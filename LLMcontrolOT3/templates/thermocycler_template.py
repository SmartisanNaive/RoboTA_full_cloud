from opentrons import protocol_api

metadata = {
    'protocolName': 'PEADL_Thermocycler Operations',
    'author': 'LLM',
    'description': 'Control thermocycler based on JSON config.'
}
requirements = {"robotType": "Flex", "apiLevel": "2.19"}

def run(protocol: protocol_api.ProtocolContext):
    # 使用全局变量 _all_values
    cycles = _all_values['cycles']
    plate_type = _all_values['plate_type']
    
    # Load thermocycler
    tc = protocol.load_module('thermocycler module gen2')
    tc_plate = tc.load_labware(plate_type)
    
    # Open lid if needed
    if _all_values.get('open_lid', True):
        tc.open_lid()
    elif _all_values.get('close_lid', False):
        tc.close_lid()
    
    # Load plate if specified
    if 'plate_source_slot' in _all_values:
        source_plate = protocol.load_labware(_all_values['plate_source_type'], _all_values['plate_source_slot'])
        # Use gripper to move plate to thermocycler
        protocol.move_labware(labware=source_plate, new_location=tc_plate, use_gripper=True)
    
    # Only close lid if not explicitly opened or closed
    if not _all_values.get('open_lid', False) and not _all_values.get('close_lid', False):
        tc.close_lid()
    
    # Set lid temperature
    if 'lid_temperature' in _all_values:
        tc.set_lid_temperature(_all_values['lid_temperature'])
    
    # Initial temperature
    if 'initial_temperature' in _all_values and 'initial_hold_time' in _all_values:
        tc.set_block_temperature(_all_values['initial_temperature'], 
                                hold_time_seconds=_all_values['initial_hold_time'])
    
    # Run cycles
    for _ in range(cycles):
        for step in _all_values['steps']:
            tc.set_block_temperature(step['temperature'], 
                                    hold_time_seconds=step['hold_time'])
    
    # Final hold
    if 'final_temperature' in _all_values:
        tc.set_block_temperature(_all_values['final_temperature'])
    
    # Open lid at end if specified
    if _all_values.get('open_lid_at_end', True):
        tc.open_lid() 