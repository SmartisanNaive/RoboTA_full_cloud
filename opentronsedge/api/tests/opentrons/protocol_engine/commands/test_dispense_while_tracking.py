"""Test dispense-in-place commands."""

from datetime import datetime

import pytest
from decoy import Decoy, matchers

from opentrons_shared_data.errors.exceptions import PipetteOverpressureError

from opentrons.types import Point
from opentrons.protocol_engine.execution import PipettingHandler, GantryMover

from opentrons.protocol_engine.commands.command import SuccessData, DefinedErrorData
from opentrons.protocol_engine.commands.dispense_while_tracking import (
    DispenseWhileTrackingParams,
    DispenseWhileTrackingResult,
    DispenseWhileTrackingImplementation,
)
from opentrons.protocol_engine.commands.pipetting_common import OverpressureError
from opentrons.protocol_engine.resources import ModelUtils
from opentrons.protocol_engine.state.state import StateView
from opentrons.protocol_engine.types import (
    CurrentWell,
    CurrentPipetteLocation,
    CurrentAddressableArea,
    LiquidHandlingWellLocation,
    WellOrigin,
    WellOffset,
    DeckPoint,
)
from opentrons.protocol_engine.state import update_types


@pytest.fixture
def subject(
    pipetting: PipettingHandler,
    state_view: StateView,
    gantry_mover: GantryMover,
    model_utils: ModelUtils,
) -> DispenseWhileTrackingImplementation:
    """Build a command implementation."""
    return DispenseWhileTrackingImplementation(
        pipetting=pipetting,
        state_view=state_view,
        gantry_mover=gantry_mover,
        model_utils=model_utils,
    )


@pytest.mark.parametrize(
    "location,stateupdateLabware,stateupdateWell",
    [
        (
            CurrentWell(
                pipette_id="pipette-id-abc",
                labware_id="labware-id-1",
                well_name="well-name-1",
            ),
            "labware-id-1",
            "well-name-1",
        ),
        (
            CurrentAddressableArea("pipette-id-abc", "addressable-area-1"),
            "funky-labware",
            "funky-well",
        ),
    ],
)
async def test_dispense_while_tracking_implementation(
    decoy: Decoy,
    gantry_mover: GantryMover,
    pipetting: PipettingHandler,
    state_view: StateView,
    subject: DispenseWhileTrackingImplementation,
    location: CurrentPipetteLocation | None,
    stateupdateLabware: str,
    stateupdateWell: str,
) -> None:
    """It should dispense in place."""
    well_location = LiquidHandlingWellLocation(
        origin=WellOrigin.MENISCUS,
        offset=WellOffset(x=0, y=0, z=1),
    )
    data = DispenseWhileTrackingParams(
        pipetteId="pipette-id-abc",
        labwareId=stateupdateLabware,
        wellName=stateupdateWell,
        wellLocation=well_location,
        volume=123,
        flowRate=456,
    )

    decoy.when(
        await pipetting.dispense_while_tracking(
            pipette_id="pipette-id-abc",
            volume=123,
            flow_rate=456,
            push_out=None,
            well_name=stateupdateWell,
            labware_id=stateupdateLabware,
        )
    ).then_return(42)

    decoy.when(state_view.pipettes.get_current_location()).then_return(location)
    decoy.when(
        state_view.pipettes.get_liquid_dispensed_by_ejecting_volume(
            pipette_id="pipette-id-abc", volume=42
        )
    ).then_return(34)

    decoy.when(
        state_view.geometry.get_nozzles_per_well(
            labware_id=stateupdateLabware,
            target_well_name=stateupdateWell,
            pipette_id="pipette-id-abc",
        )
    ).then_return(2)

    decoy.when(
        state_view.geometry.get_wells_covered_by_pipette_with_active_well(
            stateupdateLabware, stateupdateWell, "pipette-id-abc"
        )
    ).then_return(["A3", "A4"])
    decoy.when(await gantry_mover.get_position("pipette-id-abc")).then_return(
        Point(1, 2, 3)
    )

    result = await subject.execute(data)

    if isinstance(location, CurrentWell):
        assert result == SuccessData(
            public=DispenseWhileTrackingResult(
                volume=42, position=DeckPoint(x=1, y=2, z=3)
            ),
            state_update=update_types.StateUpdate(
                pipette_aspirated_fluid=update_types.PipetteEjectedFluidUpdate(
                    pipette_id="pipette-id-abc", volume=42
                ),
                liquid_operated=update_types.LiquidOperatedUpdate(
                    labware_id=stateupdateLabware,
                    well_names=["A3", "A4"],
                    volume_added=68,
                ),
            ),
        )
    else:
        assert result == SuccessData(
            public=DispenseWhileTrackingResult(
                volume=42, position=DeckPoint(x=1, y=2, z=3)
            ),
            state_update=update_types.StateUpdate(
                pipette_aspirated_fluid=update_types.PipetteEjectedFluidUpdate(
                    pipette_id="pipette-id-abc", volume=42
                )
            ),
        )


@pytest.mark.parametrize(
    "location,stateupdateLabware,stateupdateWell",
    [
        (
            CurrentWell(
                pipette_id="pipette-id",
                labware_id="labware-id-1",
                well_name="well-name-1",
            ),
            "labware-id-1",
            "well-name-1",
        ),
        (
            CurrentAddressableArea("pipette-id", "addressable-area-1"),
            "funky-labware",
            "funky-well",
        ),
    ],
)
async def test_overpressure_error(
    decoy: Decoy,
    gantry_mover: GantryMover,
    pipetting: PipettingHandler,
    state_view: StateView,
    model_utils: ModelUtils,
    subject: DispenseWhileTrackingImplementation,
    location: CurrentPipetteLocation | None,
    stateupdateLabware: str,
    stateupdateWell: str,
) -> None:
    """It should return an overpressure error if the hardware API indicates that."""
    pipette_id = "pipette-id"

    position = Point(x=1, y=2, z=3)

    error_id = "error-id"
    error_timestamp = datetime(year=2020, month=1, day=2)
    well_location = LiquidHandlingWellLocation(
        origin=WellOrigin.MENISCUS,
        offset=WellOffset(x=0, y=0, z=1),
    )
    data = DispenseWhileTrackingParams(
        pipetteId=pipette_id,
        labwareId=stateupdateLabware,
        wellName=stateupdateWell,
        wellLocation=well_location,
        volume=50,
        flowRate=1.23,
        pushOut=10,
    )

    decoy.when(
        state_view.geometry.get_nozzles_per_well(
            labware_id=stateupdateLabware,
            target_well_name=stateupdateWell,
            pipette_id="pipette-id",
        )
    ).then_return(2)

    decoy.when(
        state_view.geometry.get_wells_covered_by_pipette_with_active_well(
            stateupdateLabware, stateupdateWell, "pipette-id"
        )
    ).then_return(["A3", "A4"])

    decoy.when(
        await pipetting.dispense_while_tracking(
            pipette_id=pipette_id,
            volume=50,
            flow_rate=1.23,
            push_out=10,
            well_name=stateupdateWell,
            labware_id=stateupdateLabware,
        ),
    ).then_raise(PipetteOverpressureError())

    decoy.when(model_utils.generate_id()).then_return(error_id)
    decoy.when(model_utils.get_timestamp()).then_return(error_timestamp)
    decoy.when(await gantry_mover.get_position(pipette_id)).then_return(position)
    decoy.when(state_view.pipettes.get_current_location()).then_return(location)

    result = await subject.execute(data)

    if isinstance(location, CurrentWell):
        assert result == DefinedErrorData(
            public=OverpressureError.model_construct(
                id=error_id,
                createdAt=error_timestamp,
                wrappedErrors=[matchers.Anything()],
                errorInfo={"retryLocation": (position.x, position.y, position.z)},
            ),
            state_update=update_types.StateUpdate(
                liquid_operated=update_types.LiquidOperatedUpdate(
                    labware_id=stateupdateLabware,
                    well_names=["A3", "A4"],
                    volume_added=update_types.CLEAR,
                ),
                pipette_aspirated_fluid=update_types.PipetteUnknownFluidUpdate(
                    pipette_id="pipette-id"
                ),
            ),
        )
    else:
        assert result == DefinedErrorData(
            public=OverpressureError.model_construct(
                id=error_id,
                createdAt=error_timestamp,
                wrappedErrors=[matchers.Anything()],
                errorInfo={"retryLocation": (position.x, position.y, position.z)},
            ),
            state_update=update_types.StateUpdate(
                pipette_aspirated_fluid=update_types.PipetteUnknownFluidUpdate(
                    pipette_id="pipette-id"
                )
            ),
        )
