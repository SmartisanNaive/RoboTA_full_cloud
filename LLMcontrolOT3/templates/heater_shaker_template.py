from opentrons import protocol_api

metadata = {
    'protocolName': 'PEADL_Heater Shaker Operations',
    'author': 'LLM',
    'description': 'Control heater-shaker module based on JSON config.'
}
requirements = {"robotType": "Flex", "apiLevel": "2.19"}

def run(protocol: protocol_api.ProtocolContext):
    # 使用全局变量 _all_values
    operation_type = _all_values.get('operation_type', 'run')  # Default to 'run' for backward compatibility
    plate_type = _all_values['plate_type']
    
    # Load heater-shaker module
    heater_shaker = protocol.load_module("heaterShakerModuleV1", "D1")
    hs_plate = heater_shaker.load_labware(plate_type)
    
    # Handle different operation types
    if operation_type == 'open':
        # Open the clamp
        heater_shaker.open_labware_latch()
        
    elif operation_type == 'close':
        # Close the clamp
        heater_shaker.close_labware_latch()
        
    elif operation_type == 'run':
        # This is the original thermal shaking program
        temperature = _all_values['temperature']
        shake_speed = _all_values['shake_speed']
        shake_duration = _all_values['shake_duration']
        
        # Load plate if specified
        if 'plate_source_slot' in _all_values:
            source_plate = protocol.load_labware(_all_values['plate_source_type'], _all_values['plate_source_slot'])
            # Use gripper to move plate to heater-shaker
            protocol.move_labware(labware=source_plate, new_location=hs_plate, use_gripper=True)
        
        # Set temperature
        if temperature > 0:
            heater_shaker.set_temperature(temperature)
        
        # Start shaking
        if shake_speed > 0:
            heater_shaker.set_and_wait_for_shake_speed(shake_speed)
            protocol.delay(seconds=shake_duration)
            heater_shaker.deactivate_shaker()
        
        # Wait for temperature if needed
        if temperature > 0:
            heater_shaker.wait_for_temperature()
            
        # Hold for specified time
        if 'hold_time' in _all_values:
            protocol.delay(seconds=_all_values['hold_time'])
        
        # Turn off heat if specified
        if _all_values.get('deactivate_at_end', True):
            heater_shaker.deactivate_heater()
    else:
        # Invalid operation type
        protocol.comment(f"Invalid operation type: {operation_type}") 