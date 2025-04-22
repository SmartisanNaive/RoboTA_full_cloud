from opentrons import protocol_api

metadata = {
    'protocolName': 'PEADL_Pipetting Operations',
    'author': 'LLM',
    'description': 'Perform pipetting operations based on JSON config.'
}
requirements = {"robotType": "Flex", "apiLevel": "2.19"}

def run(protocol: protocol_api.ProtocolContext):
    # 使用全局变量 _all_values
    source_wells = _all_values['source_wells']
    dest_wells = _all_values['dest_wells']
    volumes = _all_values['volumes']
    source_labware_type = _all_values['source_labware_type']
    dest_labware_type = _all_values['dest_labware_type']
    source_slot = _all_values['source_slot']
    dest_slot = _all_values['dest_slot']
    pipette_type = _all_values['pipette_type']
    tiprack_type = _all_values['tiprack_type']
    tiprack_slot = _all_values['tiprack_slot']
    
    # Load labware
    source_labware = protocol.load_labware(source_labware_type, source_slot)
    dest_labware = protocol.load_labware(dest_labware_type, dest_slot)
    tiprack = protocol.load_labware(tiprack_type, tiprack_slot)
    
    # Load pipette
    mount = _all_values.get('mount', 'left')
    pipette = protocol.load_instrument(pipette_type, mount, tip_racks=[tiprack])
    
    # Perform transfers
    for i in range(len(source_wells)):
        source_well = source_wells[i]
        dest_well = dest_wells[i]
        volume = volumes[i]
        
        pipette.pick_up_tip()
        pipette.aspirate(volume, source_labware[source_well])
        pipette.dispense(volume, dest_labware[dest_well])
        pipette.drop_tip() 
        