"""Router for /maintenance_runs endpoints dealing with labware offsets and definitions."""

from typing import Annotated
import logging

from fastapi import Depends, status

from opentrons_shared_data.labware.labware_definition import LabwareDefinition
from server_utils.fastapi_utils.light_router import LightRouter

from opentrons.protocol_engine import (
    LabwareOffsetCreate,
    LegacyLabwareOffsetCreate,
    LabwareOffset,
)

from robot_server.errors.error_responses import ErrorBody
from robot_server.service.json_api import RequestModel, SimpleBody, PydanticResponse

from ..maintenance_run_models import MaintenanceRun, LabwareDefinitionSummary
from ..maintenance_run_orchestrator_store import MaintenanceRunOrchestratorStore
from ..dependencies import get_maintenance_run_orchestrator_store
from .base_router import RunNotFound, RunNotIdle, get_run_data_from_url

log = logging.getLogger(__name__)
labware_router = LightRouter()


@PydanticResponse.wrap_route(
    labware_router.post,
    path="/maintenance_runs/{runId}/labware_offsets",
    summary="Add a labware offset to a maintenance run",
    description=(
        "Add a labware offset to an existing run, returning the created offset."
        "\n\n"
        "There is no matching `GET /maintenance_runs/{runId}/labware_offsets` endpoint."
        " To read the list of labware offsets currently on the run,"
        " see the run's `labwareOffsets` field."
        "\n\n"
        "The response body's `data` will either be a single offset or a list of offsets,"
        " depending on whether you provided a single offset or a list in the request body's `data`."
    ),
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_201_CREATED: {
            "model": SimpleBody[LabwareOffset | list[LabwareOffset]]
        },
        status.HTTP_404_NOT_FOUND: {"model": ErrorBody[RunNotFound]},
        status.HTTP_409_CONFLICT: {"model": ErrorBody[RunNotIdle]},
    },
)
async def add_labware_offset(
    request_body: RequestModel[
        LabwareOffsetCreate
        | LegacyLabwareOffsetCreate
        | list[LabwareOffsetCreate | LegacyLabwareOffsetCreate]
    ],
    run_orchestrator_store: Annotated[
        MaintenanceRunOrchestratorStore, Depends(get_maintenance_run_orchestrator_store)
    ],
    run: Annotated[MaintenanceRun, Depends(get_run_data_from_url)],
) -> PydanticResponse[SimpleBody[LabwareOffset | list[LabwareOffset]]]:
    """Add labware offsets to a maintenance run.

    Args:
        request_body: New labware offset request data from request body.
        run_orchestrator_store: Engine storage interface.
        run: Run response data by ID from URL; ensures 404 if run not found.
    """
    offsets_to_add = (
        request_body.data
        if isinstance(request_body.data, list)
        else [request_body.data]
    )

    added_offsets: list[LabwareOffset] = []
    for offset_to_add in offsets_to_add:
        added_offset = run_orchestrator_store.add_labware_offset(offset_to_add)
        added_offsets.append(added_offset)
        log.info(f'Added labware offset "{added_offset.id}" to run "{run.id}".')

    # Return a list if the client POSTed a list, or an object if the client POSTed an object.
    # For some reason, mypy needs to be given the type annotation explicitly.
    response_data: LabwareOffset | list[LabwareOffset] = (
        added_offsets if isinstance(request_body.data, list) else added_offsets[0]
    )

    return await PydanticResponse.create(
        content=SimpleBody.model_construct(data=response_data),
        status_code=status.HTTP_201_CREATED,
    )


# TODO(mc, 2022-02-28): add complementary GET endpoint
# https://github.com/Opentrons/opentrons/issues/9427
@PydanticResponse.wrap_route(
    labware_router.post,
    path="/maintenance_runs/{runId}/labware_definitions",
    summary="Add a labware definition to a maintenance run",
    description=(
        "Add a labware definition to a run, returning the added definition's URI."
    ),
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_201_CREATED: {"model": SimpleBody[MaintenanceRun]},
        status.HTTP_404_NOT_FOUND: {"model": ErrorBody[RunNotFound]},
        status.HTTP_409_CONFLICT: {"model": ErrorBody[RunNotIdle]},
    },
)
async def add_labware_definition(
    request_body: RequestModel[LabwareDefinition],
    run_orchestrator_store: Annotated[
        MaintenanceRunOrchestratorStore, Depends(get_maintenance_run_orchestrator_store)
    ],
    run: Annotated[MaintenanceRun, Depends(get_run_data_from_url)],
) -> PydanticResponse[SimpleBody[LabwareDefinitionSummary]]:
    """Add a labware offset to a run.

    Args:
        request_body: New labware offset request data from request body.
        run_orchestrator_store: Engine storage interface.
        run: Run response data by ID from URL; ensures 404 if run not found.
    """
    uri = run_orchestrator_store.add_labware_definition(request_body.data)
    log.info(f'Added labware definition "{uri}"' f' to run "{run.id}".')

    return PydanticResponse(
        content=SimpleBody.model_construct(
            data=LabwareDefinitionSummary.model_construct(definitionUri=uri)
        ),
        status_code=status.HTTP_201_CREATED,
    )
