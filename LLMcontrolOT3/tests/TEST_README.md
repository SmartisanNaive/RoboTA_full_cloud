# OT-3机器人测试工具

这个测试工具用于测试Opentrons OT-3机器人的各种功能，包括移液操作、热循环仪操作、热震荡仪操作和板子移动操作。

## 功能概述

测试工具包含以下测试功能：

1. **基本移液测试**：从管架到PCR板的转移
2. **模块间移液测试**：从PCR板到热震荡模块上的PCR板的转移
3. **磁性模块移液测试**：从管架到磁性模块上的PCR板的转移
4. **多通道移液测试**：使用8通道移液枪在同一个板内转移
5. **热循环仪测试**：测试热循环仪的基本操作
6. **热循环仪板子转移测试**：测试将板子移动到热循环仪并执行PCR
7. **热震荡仪测试**：测试热震荡仪的基本操作
8. **热震荡仪板子转移测试**：测试将板子移动到热震荡仪并执行操作
9. **板子移动测试**：测试使用机械臂移动板子

## 使用方法

### 前提条件

1. 确保Flask服务器已经启动：
   ```bash
   python ot_robot_server.py
   ```

2. 确保所有必要的模板文件都已存在：
   - `pipetting_template.py`
   - `thermocycler_template.py`
   - `heater_shaker_template.py`
   - `protocol_template.py`

### 运行测试

#### 交互式菜单

最简单的方式是运行测试工具，然后通过交互式菜单选择要运行的测试：

```bash
python ot_robot_tests.py
```

这将显示一个菜单，您可以选择要运行的测试。

#### 命令行参数

您也可以使用命令行参数来运行特定的测试：

```bash
# 运行特定测试
python ot_robot_tests.py --test 1  # 运行基本移液测试

# 运行所有测试
python ot_robot_tests.py --all
```

## 测试说明

### 移液测试

移液测试使用`/pipette`端点，通过JSON数据指定源位置、目标位置、体积等参数。

示例JSON数据：
```json
{
  "source_wells": ["A1", "B1", "C1"],
  "dest_wells": ["A1", "B1", "C1"],
  "volumes": [50, 50, 50],
  "source_labware_type": "opentrons_24_tuberack_eppendorf_1.5ml_safelock_snapcap",
  "dest_labware_type": "opentrons_96_wellplate_200ul_pcr_full_skirt",
  "source_slot": "B2",
  "dest_slot": "D2",
  "pipette_type": "flex_1channel_1000",
  "tiprack_type": "opentrons_flex_96_tiprack_200ul",
  "tiprack_slot": "C3",
  "mount": "right"
}
```

### 热循环仪测试

热循环仪测试使用`/thermocycler`端点，通过JSON数据指定循环次数、温度步骤等参数。

示例JSON数据：
```json
{
  "cycles": 3,
  "plate_type": "nest_96_wellplate_100ul_pcr_full_skirt",
  "lid_temperature": 105,
  "initial_temperature": 95,
  "initial_hold_time": 120,
  "steps": [
    {"temperature": 95, "hold_time": 30},
    {"temperature": 55, "hold_time": 30},
    {"temperature": 72, "hold_time": 60}
  ],
  "final_temperature": 4,
  "open_lid_at_end": true
}
```

### 热震荡仪测试

热震荡仪测试使用`/heater-shaker`端点，通过JSON数据指定温度、震荡速度等参数。

示例JSON数据：
```json
{
  "plate_type": "corning_96_wellplate_360ul_flat",
  "temperature": 37,
  "shake_speed": 500,
  "shake_duration": 60,
  "hold_time": 300,
  "deactivate_at_end": true
}
```

### 板子移动测试

板子移动测试使用`/move-labware`端点，通过JSON数据指定源位置、目标位置和板子类型。

示例JSON数据：
```json
{
  "source_slot": 9,
  "destination_slot": 5,
  "plate_name": "corning_96_wellplate_360ul_flat"
}
```

## 故障排除

1. **服务器未启动**：确保Flask服务器已经启动，并且可以通过`http://localhost:5000`访问。

2. **模板文件缺失**：确保所有必要的模板文件都已存在。

3. **多通道移液测试失败**：可能是由于多通道移液枪配置问题或位置冲突导致的。尝试修改源位置和目标位置，或者使用不同的板子。

4. **模块位置错误**：确保模块位置正确指定，例如热震荡模块位于`D1`，磁性模块位于`C1`。

## 扩展

如果需要添加新的测试功能，可以按照以下步骤进行：

1. 在`ot_robot_tests.py`中添加新的测试函数。
2. 在`print_menu`函数中添加新的菜单项。
3. 在`run_test`函数中添加新的测试选项。
4. 如果需要，创建新的模板文件。 