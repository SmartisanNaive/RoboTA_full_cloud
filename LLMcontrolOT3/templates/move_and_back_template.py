from opentrons import protocol_api
import time

metadata = {
    'protocolName': 'PEADL_Move PCR Plate with Gripper and Back',
    'author': 'LLM',
    'description': 'Use a gripper to move a 96-well PCR plate to destination and back to source.'
}
requirements = {"robotType": "Flex", "apiLevel": "2.19"}

def run(protocol: protocol_api.ProtocolContext):
    # 使用全局变量 _all_values
    source_slot = _all_values['source_slot']
    destination_slot = _all_values['destination_slot']
    plate_name = _all_values['plate_name']
    delay_seconds = _all_values.get('delay_seconds', 5)  # 默认停留5秒
    
    # 加载板子
    source_labware = protocol.load_labware(plate_name, source_slot)
    
    # 移动到目标位置
    protocol.move_labware(
        labware=source_labware,
        new_location=destination_slot,
        use_gripper=True
    )
    
    # 等待指定的时间
    if delay_seconds > 0:
        protocol.delay(seconds=delay_seconds)
    
    # 加载目标位置的板子（现在板子已经在这里了）
    dest_labware = protocol.load_labware(plate_name, destination_slot)
    
    # 移回原位置
    protocol.move_labware(
        labware=dest_labware,
        new_location=source_slot,
        use_gripper=True
    ) 