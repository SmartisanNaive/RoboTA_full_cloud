"""Tests for /runs routes dealing with labware offsets and definitions."""

import pytest
from datetime import datetime
from decoy import Decoy

from opentrons_shared_data.labware.types import LabwareDefinition as LabwareDefDict
from opentrons_shared_data.labware.labware_definition import LabwareDefinition

from opentrons.types import DeckSlotName
from opentrons.protocol_engine import EngineStatus, types as pe_types

from robot_server.service.json_api import RequestModel, SimpleBody
from robot_server.maintenance_runs.maintenance_run_models import (
    MaintenanceRun,
    LabwareDefinitionSummary,
)
from robot_server.maintenance_runs.maintenance_run_orchestrator_store import (
    MaintenanceRunOrchestratorStore,
)
from robot_server.maintenance_runs.router.labware_router import (
    add_labware_offset,
    add_labware_definition,
)


@pytest.fixture()
def run() -> MaintenanceRun:
    """Get a fixture Run response data."""
    return MaintenanceRun(
        id="run-id",
        createdAt=datetime(year=2021, month=1, day=1),
        status=EngineStatus.IDLE,
        current=True,
        actions=[],
        errors=[],
        pipettes=[],
        labware=[],
        modules=[],
        labwareOffsets=[],
        liquids=[],
        liquidClasses=[],
        hasEverEnteredErrorRecovery=False,
    )


@pytest.fixture()
def labware_definition(minimal_labware_def: LabwareDefDict) -> LabwareDefinition:
    """Create a labware definition fixture."""
    return LabwareDefinition.model_validate(minimal_labware_def)


async def test_add_labware_offsets(
    decoy: Decoy,
    mock_maintenance_run_orchestrator_store: MaintenanceRunOrchestratorStore,
    run: MaintenanceRun,
) -> None:
    """It should add the labware offsets to the engine, assuming the run is current."""
    labware_offset_request_1 = pe_types.LegacyLabwareOffsetCreate(
        definitionUri="namespace_1/load_name_1/123",
        location=pe_types.LegacyLabwareOffsetLocation(slotName=DeckSlotName.SLOT_1),
        vector=pe_types.LabwareOffsetVector(x=1, y=2, z=3),
    )
    labware_offset_request_2 = pe_types.LegacyLabwareOffsetCreate(
        definitionUri="namespace_1/load_name_2/123",
        location=pe_types.LegacyLabwareOffsetLocation(slotName=DeckSlotName.SLOT_1),
        vector=pe_types.LabwareOffsetVector(x=1, y=2, z=3),
    )

    labware_offset_1 = pe_types.LabwareOffset(
        id="labware-offset-id-1",
        createdAt=datetime(year=2022, month=2, day=2),
        definitionUri="labware-definition-uri",
        location=pe_types.LegacyLabwareOffsetLocation(slotName=DeckSlotName.SLOT_1),
        vector=pe_types.LabwareOffsetVector(x=0, y=0, z=0),
    )
    labware_offset_2 = pe_types.LabwareOffset(
        id="labware-offset-id-2",
        createdAt=datetime(year=2022, month=2, day=2),
        definitionUri="labware-definition-uri",
        location=pe_types.LegacyLabwareOffsetLocation(slotName=DeckSlotName.SLOT_1),
        vector=pe_types.LabwareOffsetVector(x=0, y=0, z=0),
    )

    decoy.when(
        mock_maintenance_run_orchestrator_store.add_labware_offset(
            labware_offset_request_1
        )
    ).then_return(labware_offset_1)
    decoy.when(
        mock_maintenance_run_orchestrator_store.add_labware_offset(
            labware_offset_request_2
        )
    ).then_return(labware_offset_2)

    result = await add_labware_offset(
        request_body=RequestModel(data=labware_offset_request_1),
        run_orchestrator_store=mock_maintenance_run_orchestrator_store,
        run=run,
    )
    assert result.content == SimpleBody(data=labware_offset_1)
    assert result.status_code == 201

    result = await add_labware_offset(
        request_body=RequestModel(
            data=[labware_offset_request_1, labware_offset_request_2]
        ),
        run_orchestrator_store=mock_maintenance_run_orchestrator_store,
        run=run,
    )
    assert result.content == SimpleBody(data=[labware_offset_1, labware_offset_2])
    assert result.status_code == 201

    result = await add_labware_offset(
        request_body=RequestModel(data=[]),
        run_orchestrator_store=mock_maintenance_run_orchestrator_store,
        run=run,
    )
    assert result.content == SimpleBody(data=[])
    assert result.status_code == 201


async def test_add_labware_definition(
    decoy: Decoy,
    mock_maintenance_run_orchestrator_store: MaintenanceRunOrchestratorStore,
    run: MaintenanceRun,
    labware_definition: LabwareDefinition,
) -> None:
    """It should be able to add a labware definition to the engine."""
    uri = pe_types.LabwareUri("some/definition/uri")

    decoy.when(
        mock_maintenance_run_orchestrator_store.add_labware_definition(
            labware_definition
        )
    ).then_return(uri)

    result = await add_labware_definition(
        run_orchestrator_store=mock_maintenance_run_orchestrator_store,
        run=run,
        request_body=RequestModel(data=labware_definition),
    )

    assert result.content.data == LabwareDefinitionSummary(definitionUri=uri)
    assert result.status_code == 201
