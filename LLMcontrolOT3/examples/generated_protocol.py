from opentrons import protocol_api

# JSON Configuration
_all_values = {
    "moveCSV": "SourceSlot,DestinationSlot\n9,5",
    "plateName": "corning_96_wellplate_360ul_flat"
}

from opentrons import protocol_api

metadata = {
    'protocolName': 'PEADL_Move PCR Plate with Gripper from CSV',
    'author': 'LLM',
    'description': 'Use a gripper to move a 96-well PCR plate based on JSON config.'
}
requirements = {"robotType": "Flex", "apiLevel": "2.19"}

def parse_move_csv(moveCSV):
    """解析 CSV 数据并返回源位置和目标位置"""
    csv_lines = [line.strip() for line in moveCSV.strip().splitlines() if line.strip()]
    headers = csv_lines[0].split(',')
    data_row = csv_lines[1].split(',')
    source_slot = int(data_row[0])
    destination_slot = int(data_row[1])
    return source_slot, destination_slot

def run(protocol: protocol_api.ProtocolContext):
    # 使用全局变量 _all_values
    moveCSV = _all_values['moveCSV']
    plateName = _all_values['plateName']
    
    # 解析 CSV 数据
    source_slot, destination_slot = parse_move_csv(moveCSV)
    
    # Load 必要的实验耗材和仪器
    tiprack_200 = protocol.load_labware('opentrons_flex_96_tiprack_200ul', location=6)
    P1000S = protocol.load_instrument("flex_1channel_1000", "left", tip_racks=[tiprack_200])
    
    # Load PCR plate at source location from CSV
    pcr_plate = protocol.load_labware(plateName, location=source_slot)
    
    # 移动 PCR plate 从 CSV 指定的源位置到目标位置
    protocol.move_labware(labware=pcr_plate, new_location=destination_slot, use_gripper=True) 
