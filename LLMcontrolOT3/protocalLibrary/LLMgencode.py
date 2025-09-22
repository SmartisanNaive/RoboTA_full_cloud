# metadata
metadata = {
    'protocolName': 'Simple PCR Amplification',
    'author': 'Opentrons Code Generator + Code Review',
    'description': 'Automated PCR reaction setup on Opentrons Flex',
    'apiLevel': '2.19'
}

def run(protocol):

    # 实验器具
    pcr_plate = protocol.load_labware('nest_96_wellplate_100ul_pcr_full_skirt', 'A1', 'PCR Plate')
    reagent_reservoir = protocol.load_labware('nest_12_reservoir_15ml', 'B1', 'Reagent Reservoir')

    # 试剂位置 (建议使用更具描述性的名称)
    pcr_mastermix = reagent_reservoir['A1']
    forward_primer = reagent_reservoir['A2']
    reverse_primer = reagent_reservoir['A3']
    dna_template = reagent_reservoir['A4']
    sterile_water = reagent_reservoir['A5']

    # 移液器
    pipette = protocol.load_instrument('flex_8channel_50ul', 'right') # 选择更合适的移液器，根据总体积调整

    # 体积 (添加单位注释)
    pcr_mix_volume = 20  # µL
    forward_primer_volume = 2  # µL
    reverse_primer_volume = 2  # µL
    dna_template_volume = 1  # µL
    sterile_water_volume = 15  # µL

    # 调整移液器参数 (提高精度和效率)
    pipette.flow_rate.aspirate = 10 # µL/s
    pipette.flow_rate.dispense = 10 # µL/s
    pipette.mix_air_gap = 5 # µL

    # 热循环参数 (注意：Opentrons 无法自动控制外部热循环仪，需要手动设置)
    protocol.comment("请手动将 PCR 板转移到热循环仪，并运行以下程序：")
    protocol.comment("95°C 预变性 5 分钟")
    protocol.comment("30 个循环：")
    protocol.comment("  95°C 变性 30 秒")
    protocol.comment("  55°C 退火 30 秒")
    protocol.comment("  72°C 延伸 1 分钟")
    protocol.comment("72°C 终延伸 5 分钟")

    # 配制反应体系
    pipette.distribute(
        [pcr_mix_volume, forward_primer_volume, reverse_primer_volume, dna_template_volume, sterile_water_volume], # 将体积列表放入 distribute
        [pcr_mastermix, forward_primer, reverse_primer, dna_template, sterile_water], # 试剂列表
        pcr_plate['A1'],
        new_tip='always'
    )

    protocol.comment("PCR 反应体系已配制完成，请手动将 PCR 板转移到热循环仪并运行上述程序。")