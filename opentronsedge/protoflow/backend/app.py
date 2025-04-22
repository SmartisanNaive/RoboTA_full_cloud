from fastapi import FastAPI, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import json
from pathlib import Path
import shutil
import uuid
import logging
from typing import List, Optional, Dict, Union, Sequence
import io
import asyncio

# Import directly from opentrons
from opentrons.cli.analyze import (
    _get_runtime_parameter_values,
    _get_runtime_parameter_paths,
    _get_input_files,
    _get_outputs,
    _do_analyze,
)
from opentrons.protocol_reader import ProtocolReader
from opentrons.protocol_engine.types import PrimitiveRunTimeParamValuesType, CSVRuntimeParamPaths

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("opentrons-analyzer")

app = FastAPI(
    title="Opentrons Protocol Analyzer",
    description="API for analyzing Opentrons protocols",
    version="1.0.0"
)

# Add CORS middleware to allow cross-origin requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],  # Allow both ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handling middleware
@app.middleware("http")
async def catch_exceptions_middleware(request, call_next):
    try:
        return await call_next(request)
    except ConnectionResetError:
        logger.warning("Client connection was reset")
        return JSONResponse(
            status_code=499,  # Use 499 status code to indicate client closed request
            content={"detail": "Client closed request"}
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

# Create a temporary directory for storing uploaded files and results
TEMP_DIR = Path(tempfile.gettempdir()) / "opentrons_analyzer"
RESULTS_DIR = TEMP_DIR / "results"
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# In-memory store for analysis results (could be replaced with a database)
analysis_results = {}

class AnalysisError(Exception):
    """Exception raised for errors during protocol analysis."""
    pass

async def cleanup_files(file_paths: List[Path]):
    """Remove temporary files after processing."""
    try:
        for file_path in file_paths:
            if file_path.exists():
                if file_path.is_dir():
                    shutil.rmtree(file_path)
                else:
                    os.remove(file_path)
            
        logger.info(f"Cleaned up temporary files")
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")

# Modified function that doesn't use anyio.run, since we're already in an async context
async def analyze_protocol_files(
    files_and_dirs: Sequence[Path],
    rtp_values: str,
    rtp_files: str,
    outputs: List
) -> Dict:
    """Run protocol analysis without using anyio.run"""
    input_files = _get_input_files(files_and_dirs)
    parsed_rtp_values = _get_runtime_parameter_values(rtp_values)
    rtp_paths = _get_runtime_parameter_paths(rtp_files)

    # Read the protocol files
    protocol_source = await ProtocolReader().read_saved(
        files=input_files,
        directory=None,
    )

    # Analyze the protocol
    analysis = await _do_analyze(protocol_source, parsed_rtp_values, rtp_paths)
    
    # Return the analysis result
    for output in outputs:
        if output.kind == "json":
            # Define a function to convert the analysis to JSON
            from opentrons.cli.analyze import AnalyzeResults, AnalysisResult, ProtocolFile, JsonConfig, PythonConfig
            from datetime import datetime, timezone

            # Check if there are errors that require parameters
            from opentrons.protocol_engine.protocol_engine import code_in_error_tree
            from opentrons_shared_data.errors import ErrorCodes
            
            if len(analysis.state_summary.errors) > 0:
                if any(
                    code_in_error_tree(
                        root_error=error, code=ErrorCodes.RUNTIME_PARAMETER_VALUE_REQUIRED
                    )
                    for error in analysis.state_summary.errors
                ):
                    result = AnalysisResult.PARAMETER_VALUE_REQUIRED
                else:
                    result = AnalysisResult.NOT_OK
            else:
                result = AnalysisResult.OK

            results = AnalyzeResults.model_construct(
                createdAt=datetime.now(tz=timezone.utc),
                files=[
                    ProtocolFile.model_construct(name=f.path.name, role=f.role)
                    for f in protocol_source.files
                ],
                config=(
                    JsonConfig.model_construct(
                        schemaVersion=protocol_source.config.schema_version
                    )
                    if hasattr(protocol_source.config, 'schema_version')
                    else PythonConfig.model_construct(
                        apiVersion=protocol_source.config.api_version
                    )
                ),
                result=result,
                metadata=protocol_source.metadata,
                robotType=protocol_source.robot_type,
                runTimeParameters=analysis.parameters,
                commands=analysis.commands,
                errors=analysis.state_summary.errors,
                labware=analysis.state_summary.labware,
                pipettes=analysis.state_summary.pipettes,
                modules=analysis.state_summary.modules,
                liquids=analysis.state_summary.liquids,
                commandAnnotations=analysis.command_annotations,
                liquidClasses=analysis.state_summary.liquidClasses,
            )

            output.to_file.write(
                results.model_dump_json(exclude_none=True).encode("utf-8"),
            )
            
            # Return the result as a Python dict
            return json.loads(results.model_dump_json(exclude_none=True))
    
    # If no JSON output was configured (shouldn't happen)
    return {"error": "No JSON output configured"}

@app.post("/api/analyze", response_class=JSONResponse)
async def analyze_protocol(
    background_tasks: BackgroundTasks,
    files: List[UploadFile],
    rtp_values: str = "{}",
    rtp_files: str = "{}"
):
    """
    Analyze Opentrons protocol files and return a unique ID to access the results.
    
    - **files**: One or more protocol files (.py, .json, etc.)
    - **rtp_values**: Optional JSON string of runtime parameter values
    - **rtp_files**: Optional JSON string of runtime parameter file paths
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    # Generate a unique ID for this analysis
    analysis_id = str(uuid.uuid4())
    
    # Create a unique session directory
    session_dir = TEMP_DIR / analysis_id
    os.makedirs(session_dir, exist_ok=True)
    
    # Save uploaded files
    file_paths = []
    file_names = []
    try:
        for file in files:
            file_path = session_dir / file.filename
            file_paths.append(file_path)
            file_names.append(file.filename)
            
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            logger.info(f"Saved uploaded file: {file_path}")
    except Exception as e:
        # Clean up any files that were saved
        background_tasks.add_task(cleanup_files, file_paths)
        raise HTTPException(status_code=500, detail=f"Error saving files: {str(e)}")
    
    # Create a memory file to capture JSON output
    memory_file = io.BytesIO()
    
    # Create output configuration for the analyzer
    class OutputConfig:
        def __init__(self, to_file, kind):
            self.to_file = to_file
            self.kind = kind
    
    outputs = [OutputConfig(to_file=memory_file, kind="json")]
    
    try:
        # Run the analyzer directly
        analysis_result = await analyze_protocol_files(
            file_paths,
            rtp_values,
            rtp_files,
            outputs
        )
        
        # Create a result file
        result_path = RESULTS_DIR / f"{analysis_id}.json"
        with open(result_path, "w") as f:
            json.dump(analysis_result, f)
            
        # Store basic info about this analysis
        analysis_results[analysis_id] = {
            "id": analysis_id,
            "files": file_names,
            "createdAt": analysis_result["createdAt"],
            "result": analysis_result["result"],
            "resultPath": str(result_path)
        }
        
        # Schedule cleanup of temporary protocol files, but keep the results
        background_tasks.add_task(cleanup_files, file_paths)
        
        # Return just the ID to the frontend
        return {"analysisId": analysis_id}
        
    except Exception as e:
        background_tasks.add_task(cleanup_files, file_paths)
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        memory_file.close()

@app.get("/api/analysis/{analysis_id}")
async def get_analysis_result(analysis_id: str):
    """Get the full analysis result for a specific ID."""
    if analysis_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    result_path = Path(analysis_results[analysis_id]["resultPath"])
    if not result_path.exists():
        raise HTTPException(status_code=404, detail="Analysis result file not found")
    
    with open(result_path, "r") as f:
        return json.load(f)

@app.get("/api/analyses")
async def list_analyses():
    """List all available analyses."""
    return list(analysis_results.values())

@app.get("/health")
async def health_check():
    """Check if the service is running."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        timeout_keep_alive=65,  # Increase keep-alive timeout
        limit_concurrency=100,  # Limit concurrent connections
        timeout_graceful_shutdown=10  # Graceful shutdown timeout
    )