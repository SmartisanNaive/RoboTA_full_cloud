from opentrons import protocol_api
metadata = {
    "protocolName": "Serial Dilution Tutorial",
    "description": """This protocol is the outcome of following the
                   Python Protocol API Tutorial located at
                   https://docs.opentrons.com/v2/tutorial.html. It takes a
                   solution and progressively dilutes it by transferring it
                   stepwise across a plate.""",
    "author": "Yihan Mao"
    }
requirements = {"robotType": "Flex", "apiLevel": "2.16"}
def run(protocol: protocol_api.ProtocolContext):
    tips = protocol.load_labware("opentrons_flex_96_tiprack_200ul", "B2")
    
    protocol.move_labware(labware=tips, new_location = "D3", use_gripper=True)
 
    protocol.move_labware(labware=tips, new_location = "A2", use_gripper=True)
    
    protocol.move_labware(labware=tips, new_location = "B2", use_gripper=True)

     