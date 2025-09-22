from opentrons import protocol_api
import math
import numpy as np
from opentrons.protocol_api import RuntimeParameterRequiredError
import csv
from opentrons.protocol_api import PARTIAL_COLUMN, ALL, SINGLE


def fas_parse():
    """
    This function mimics the Opentrons CSV Parser format. 
    It reads the CSV file and returns the file contents and the CSVParameter object.
    file_csv : Raw file contents
    content_csv : CSVParameter object, can be further parsed using parse_as_csv() method and contents method.
    """
    from opentrons.protocols.api_support.types import APIVersion
    from opentrons import protocol_api
    LOCATION = "C:/Users/anura/OneDrive/Desktop/pyapps/ak_custom_protocols/spc/normalization/normalization_template.csv" # I am reading a local file
    with open(LOCATION, "rb") as file:
        file_csv = file.read()

    content_csv = protocol_api.CSVParameter(contents=file_csv, api_version=APIVersion(2, 20))
    return file_csv, content_csv

#file_csv, content_csv = fas_parse()

metadata = {
    "author": "Anurag Kanase <anurag.kanase@opentrons.com>",
    "protocolName": "Normalization using a single or eight channel pipette",
    "description": "The file was uploaded from",
}

# requirements
requirements = {"robotType": "Flex", "apiLevel": "2.20"}

def add_parameters(parameters):
    # csv parameter load
    parameters.add_csv_file(
    variable_name="csv_data",
    display_name="Normalization CSV",
    description="Please use the template CSV from the plate reader "
)

    parameters.add_int(
        variable_name="dest_bottom_height",
        display_name="Destination Bottom Height",
        description="Please enter the destination bottom height",
        default=3,
        minimum=0,
        maximum=10
    )

    parameters.add_str(
        variable_name="small_pipette", 
        display_name="Small Volume Pipette",
        description="Preferred pipette to transfer DNA samples",
        default="flex_1channel_50",
        choices=[
            {"display_name": "Flex 1 Channel 1000 ul", "value": "flex_1channel_1000"},
            {"display_name": "Flex 1 Channel 50 ul", "value": "flex_1channel_50"},
            {"display_name": "Flex 8 Channel 1000 ul", "value": "flex_8channel_1000"},
            {"display_name": "Flex 8 Channel 50 ul", "value": "flex_8channel_50"},
        ]
    )
    parameters.add_str(
        variable_name="small_mount", 
        display_name="Small Volume Pipette Mount",
        description="Select the small volume pipette mount to use",
        default="left",
        choices=[
            {"display_name": "Left", "value": "left"},
            {"display_name": "Right", "value": "right"},
        ]
    )

    parameters.add_str(
        variable_name="large_pipette", 
        display_name="Large Volume Pipette",
        description="Preferred pipette to transfer diluent",
        default="flex_1channel_1000",
        choices=[
            {"display_name": "Flex 1 Channel 1000 ul", "value": "flex_1channel_1000"},
            {"display_name": "Flex 1 Channel 50 ul", "value": "flex_1channel_50"},
            {"display_name": "Flex 8 Channel 1000 ul", "value": "flex_8channel_1000"},
            {"display_name": "Flex 8 Channel 50 ul", "value": "flex_8channel_50"},
        ]
    )

    parameters.add_str(
        variable_name="large_mount", 
        display_name="Large Volume Pipette Mount",
        description="Select the large volume pipette mount to use",
        default="right",
        choices=[

            {"display_name": "Left", "value": "left"},
            {"display_name": "Right", "value": "right"},
        ]
    )


    parameters.add_str(
        variable_name="small_tiprack", 
        display_name="Small Tiprack",
        description="Select the small tiprack to use",
        default="opentrons_flex_96_filtertiprack_200ul",
        choices=[

            {"display_name": "Tip Rack 200 µL", "value": "opentrons_flex_96_tiprack_200ul"},
            {"display_name": "Tip Rack 50 µL", "value": "opentrons_flex_96_tiprack_50ul"},
            {"display_name": "Tip Rack 1000 µL", "value": "opentrons_flex_96_tiprack_1000ul"},
            {"display_name": "Filter Tip Rack 1000 µL", "value": "opentrons_flex_96_filtertiprack_1000ul"},
            {"display_name": "Filter Tip Rack 200 µL", "value": "opentrons_flex_96_filtertiprack_200ul"},
            {"display_name": "Filter Tip Rack 50 µL", "value": "opentrons_flex_96_filtertiprack_50ul"},
        ]
    )

    parameters.add_str(
        variable_name="large_tiprack", 
        display_name="Large Tiprack",
        description="Select the large tiprack to use",
        default="opentrons_flex_96_filtertiprack_200ul",
        choices=[

            {"display_name": "Tip Rack 200 µL", "value": "opentrons_flex_96_tiprack_200ul"},
            {"display_name": "Tip Rack 50 µL", "value": "opentrons_flex_96_tiprack_50ul"},
            {"display_name": "Tip Rack 1000 µL", "value": "opentrons_flex_96_tiprack_1000ul"},
            {"display_name": "Filter Tip Rack 1000 µL", "value": "opentrons_flex_96_filtertiprack_1000ul"},
            {"display_name": "Filter Tip Rack 200 µL", "value": "opentrons_flex_96_filtertiprack_200ul"},
            {"display_name": "Filter Tip Rack 50 µL", "value": "opentrons_flex_96_filtertiprack_50ul"},
        ]
    )

    parameters.add_bool(
        variable_name="blowout",
        display_name="Blowout",
        description="Please select if you want to blowout",
        default=True
    )

    parameters.add_bool(
        variable_name="dry_run",
        display_name="Dry Run",
        description="Please select if you want to dry run, returns tip to tip rack",
        default=True
    )

    parameters.add_str(
        variable_name="dil_tube", 
        display_name="Diluent Tube",
        description="Select the diluent tube to use",
        default="falcon_50",
        choices=[
            {"display_name": "Falcon 15 ml", "value": "falcon_15"},
            {"display_name": "Falcon 50 ml", "value": "falcon_50"},
        ]
    )


# protocol run function
def run(protocol: protocol_api.ProtocolContext):
    dry_run = protocol.params.dry_run
    large_tiprack = protocol.params.large_tiprack
    small_tiprack = protocol.params.small_tiprack
    small_pipette = protocol.params.small_pipette
    small_mount = protocol.params.small_mount
    large_pipette = protocol.params.large_pipette
    large_mount = protocol.params.large_mount
    dil_tube = protocol.params.dil_tube

    input_csv = protocol.params.csv_data.parse_as_csv()
    #input_csv = content_csv.parse_as_csv()
    input_csv = list(zip(*input_csv[1:]))

    dest_bottom_height = protocol.params.dest_bottom_height
    blowout = protocol.params.blowout

    blowout = True if blowout == "True" else False

    def find_aspirate_height(pip,source_well):
        if pip.has_tip == False:
            pip.pick_up_tip()
            pip.configure_for_volume(pip.max_volume)
        pip.prepare_to_aspirate()
        measured_height = pip.measure_liquid_height(source_well)
        lld_height = source_well.top().point.z - measured_height #- source_well.bottom().point.z
        #aspirate_height = max(lld_height - 1.5, 1)
        return lld_height
    
    def drop(pip):
        if dry_run:
            if pip.channels > 1:
                pip.drop_tip()  
            else:
                pip.return_tip()
        else:
            pip.drop_tip()

    def track_tips():
        """
        Adjust tip tracking method
        Reverses the tips in the tiprack for single tip pickup
        """
        if isSmallMulti:
            stips = small_tips.wells()[::-1]
        else:
            stips = small_tips.wells()
        

        if isLargeMulti:    
            ltips = large_tips.wells()[::-1]
        else:
            ltips = large_tips.wells()
        return stips, ltips


    def clean_well_id(well_id):
        # Remove leading zero if present, but keep single digits as is
        well_id = str(well_id[0]) + str(int(well_id[1:])) if len(well_id) > 2 else well_id
        return well_id

    # add plate mapping here

    well_id, diluent_vol, dna_vol, sample_name = input_csv
    #PARAMETERS
    DNA_VOL = tuple(float(vol) for vol in dna_vol)
    DIL_VOL = tuple(float(vol) for vol in diluent_vol)
    print(DIL_VOL)

    SAMPLES = len(well_id)
    MIXES = 3
    TIP_HEIGHT_FROM_TOP = -10
    no_of_diluent_tubes = math.ceil(sum(DIL_VOL)/50000)
    DISTANCE_FROM_BOTTOM = dest_bottom_height

    
    #chute
    chute = protocol.load_waste_chute()


    src_plate_slot = "B2"
    dest_plate_slot = "C2"

    src_plate = protocol.load_labware("nest_96_wellplate_100ul_pcr_full_skirt", location=src_plate_slot, label="DNA Plate")
    dest_plate = protocol.load_labware("nest_96_wellplate_100ul_pcr_full_skirt", location=dest_plate_slot, label="Normalization Plate")
    tuberack = protocol.load_labware("opentrons_10_tuberack_falcon_4x50ml_6x15ml_conical", "A2", label="Diluent Tuberack")

    # pipettes
    small = protocol.load_instrument(small_pipette, mount=small_mount)
    large = protocol.load_instrument(large_pipette, mount=large_mount)

    large_tip_location = "A3"
    small_tip_location = "C3"

    #tiprack
    small_tips = protocol.load_labware(small_tiprack, location=small_tip_location)
    large_tips = protocol.load_labware(large_tiprack, location=large_tip_location)

    # create pipette config def
    isSmallMulti = small.channels > 1
    isLargeMulti = large.channels > 1

    smallp = small
    largep = large    


    if isSmallMulti:
        small.configure_nozzle_layout(
            style=SINGLE,
            start="A1",
        )

    if isLargeMulti:
        large.configure_nozzle_layout(
            style=SINGLE,
            start="A1",
        )

    stips, ltips = track_tips()

    def pickS(vol):
        small.pick_up_tip(stips.pop(0))
        if small.max_volume == 50:
            small.configure_for_volume(volume=vol)

    def pickL():
        large.pick_up_tip(ltips.pop(0))


    def grip(tiprack, location):
        protocol.move_labware(tiprack, location, use_gripper=True)

    def h(height):
        height = 0

    falcon15dim = [3, 6.55, 6.55, 7.585, 27.04, 118.5]
    falcon50dim = [3.075, 12.98, 12.98, 13.905, 16, 114.55]
    def h2vol(h, tube):
        r1,R1,r2,R2,H1,H2 = tube
        H1_new = h if h <= H1 else H1
        H2_new = h-H1 if h >= H1 else 0
        volume_frustum1 = (1/3) * math.pi * H1_new * (R1**2 + r1**2 + R1*r1)
        volume_frustum2 = (1/3) * math.pi * H2_new * (R2**2 + r2**2 + R2*r2)
        volat_h = volume_frustum1 + volume_frustum2
        return volat_h

    def vol2h(vol, tube):
        height = np.arange(1,119)
        func = [h2vol(h, tube) for h in height]    
        coefficients = np.polyfit(func, height, 6)
        fit = np.poly1d(coefficients)
        h = fit(vol)
        return h

    diluent_tubes = [tuberack["A3"], tuberack["A4"], tuberack["B3"], tuberack["B4"]][:no_of_diluent_tubes]
    dna_wells = [src_plate[clean_well_id(well)] for well in well_id]
    dest_wells = [dest_plate[clean_well_id(well)] for well in well_id]

    def add_liquid(name, color, well, volume):
        liquid = protocol.define_liquid(name = name, description = "generic", display_color = color)
        well.load_liquid(liquid=liquid, volume=volume)
        return liquid , well
    
    for well in diluent_tubes:
        add_liquid("diluent", "#008000", well, sum(DIL_VOL)+35000)

    for well in np.array(dna_wells).flatten():
        add_liquid("DNA sample", "#f08000", well, 200)

    
    protocol.pause(f"Please confirm if Plate: {src_plate.name} is placed in the slot {src_plate_slot} and Plate: {dest_plate.name} is placed in the slot {dest_plate_slot}.")

    pickL()
    tube = falcon50dim if dil_tube == "falcon_50" else falcon15dim
    initial_diluent_height = find_aspirate_height(largep,diluent_tubes[0])
    initial_diluent_vol = h2vol(initial_diluent_height, tube)

    protocol.comment(f"Initial Diluent Height: {initial_diluent_height} mm and Initial Diluent Volume: {initial_diluent_vol} ul")

    protocol.comment("--------Adding Diluent to the Destination Plate --------")
    for vol, dest, sample in zip(DIL_VOL, dest_wells, sample_name):
        # add choice of pipette

        largep.configure_for_volume(volume=vol)
        h = max(initial_diluent_height - vol2h(vol, tube) - 2, 5) # immersed 2 mm extra
        initial_diluent_height = initial_diluent_height - vol2h(vol, tube)
        src = diluent_tubes[0]
        # Nov. 5, 2024: Commented out the skipping of samples beyond threshold to sync with the tips
        if vol < 0:
            protocol.comment(f"Skipping Sample ID: {sample} beyond than threshold.")
            continue

        protocol.comment(f"Transferring Diluent to Sample ID: {sample}")
        largep.aspirate(vol, src.bottom(h))
        largep.dispense(vol, dest.bottom(1))
        if blowout:
            largep.blow_out()
    drop(largep)

    if small.channels > 1:
        grip(small_tips, "B3")

    protocol.comment("--------Adding DNA to the Destination Plate --------")
    for vol, src, dest, sample in zip(DNA_VOL, dna_wells, dest_wells, sample_name):
        pip = small

        pickS(vol)
        
        #h = max(find_aspirate_height(p50, vol,diluent_tubes[0]) -5, 5)
        s = src
        # Nov. 5, 2024: Commented out the skipping of samples beyond threshold to sync with the tips
        if vol < 0:
            protocol.comment(f"Skipping Sample ID: {sample} beyond than threshold.")
            continue

        protocol.comment(f"Transferring Sample to Sample ID: {sample}")
        pip.aspirate(vol, s.bottom(1))
        pip.dispense(vol, dest.bottom(1))
        if dry_run:
            pip.mix(1, 50)
        else:
            pip.mix(3, 50)
        if blowout:
            pip.blow_out()
        drop(pip)