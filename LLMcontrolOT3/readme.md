# LLMcontrolOT3 项目说明

## 项目简介
LLMcontrolOT3 是一个用于控制 Opentrons OT-3 机器人的 Python 项目。它通过 Flask 服务器提供 REST API 接口，支持动态生成和执行实验协议。此项目集成了大型语言模型（LLM），允许用户通过自然语言指令来控制机器人，简化实验操作。

## 项目概述

LLMcontrolOT3 利用大模型理解用户的中文或英文自然语言指令，将其转换为结构化的机器人操作命令。系统可以解析多种实验操作，如移动耗材、移液、温度控制和加热震荡，并在执行前对参数进行基础验证。如果指令信息不全，系统会提示用户补充必要参数。

## 核心架构

项目采用模块化架构设计，主要包含以下部分：

1.  **服务器层 (`server`)**: Flask 应用，提供 REST API 接口用于接收机器人控制命令。它负责与 OT-3 机器人通信，上传并执行动态生成的协议。
2.  **AI 控制层 (`ai_controller`)**: 负责处理用户输入的自然语言指令。
    *   **指令解析器 (`command_parser.py`)**: 调用大模型（如 DeepSeek）将自然语言转换为结构化的 JSON 命令。
    *   **主控制器 (`main.py`)**: 接收解析后的 JSON 命令，使用 `FUNCTION_MAPPINGS` 验证必需参数。如果参数缺失，返回提示信息；如果参数完整，则调用服务器层相应的 API 执行操作。
3.  **配置层 (`config`)**: 存储项目配置。
    *   **`settings.py`**: 包含服务器地址、机器人连接信息等。
    *   **`ai_settings.py`**: 包含大模型 API Key、系统提示词（`SYSTEM_PROMPT`）以及定义操作及其参数的 `FUNCTION_MAPPINGS`。
4.  **协议模板层 (`templates`)**: 包含各种基础操作的 Opentrons Python API 协议模板。服务器层会根据 API 请求中的参数填充这些模板以生成可执行协议。
5.  **工具层 (`utils`)**: 提供辅助功能，例如根据模板和配置动态生成协议的脚本。
6.  **测试层 (`test`)**: 包含单元测试和集成测试，确保各组件功能正常。

## 功能特性

*   **两种交互模式**: 
    *   **直接 API 调用**: 可通过向具体端点 (如 `/move-labware`, `/pipette`) 发送结构化 JSON 请求来精确控制机器人。
    *   **自然语言控制 API**: 可通过向 `/ai-command` 端点发送包含自然语言指令的 JSON 请求，由 AI 控制器解析并执行。
*   **自然语言理解**: 支持中文或英文指令。
*   **多操作支持**: 目前支持 `move_labware` (移动耗材), `pipette` (移液), `thermocycler` (温控), `heater_shaker` (加热震荡) 操作。
*   **参数验证**: 在执行命令前，检查大模型解析出的参数是否包含操作所必需的全部信息。
*   **交互式反馈**: 当指令缺少必要参数时，系统会返回 `{"status": "missing_info", "message": "..."}` 告知用户缺少哪些参数。
*   **动态协议生成**: 基于模板和实时参数生成 Opentrons 协议。
*   **模块化与可扩展**: 方便添加新的操作类型或集成其他大模型。

## 工作流程与交互方式

系统提供了两种主要的交互方式：

**方式一：直接调用具体功能的 API**

1.  **客户端**: 构造包含具体操作参数的 JSON 数据。
2.  **请求**: 向服务器对应的具体 API 端点发送 POST 请求 (例如 `POST /move-labware`，请求体为 `{"source_slot": 1, "destination_slot": 3, "plate_name": "..."}`)。
3.  **服务器 (`ot_robot_server.py`)**: 接收请求，根据参数和协议模板生成 Opentrons 协议。
4.  **执行**: 上传协议到机器人并执行。
5.  **响应**: 将执行结果（成功或失败信息）返回给客户端。
*这种方式适用于需要精确控制、编写自动化脚本或进行底层功能测试的场景。*

**方式二：通过 AI 命令 API 使用自然语言**

1.  **客户端**: 构造一个包含自然语言指令的 JSON 数据，格式为 `{"command": "<你的自然语言指令>"}`。
2.  **请求**: 向服务器新增的 `/ai-command` 端点发送 POST 请求。
3.  **服务器 (`ot_robot_server.py`)**: 接收请求，将指令传递给 AI 控制器实例。
4.  **AI 控制器 (`ai_controller/main.py`)**: 
    a.  调用 `command_parser.py` 将自然语言指令发送给大模型进行解析，获取结构化 JSON 命令（包含 `operation` 和 `params`）。
    b.  使用 `FUNCTION_MAPPINGS` 验证必需参数是否存在。
    c.  如果参数完整，**内部调用**方式一中的相应 API 端点（例如，如果解析出是 `move_labware` 操作，则内部调用 `/move-labware` API）。
    d.  如果参数缺失，生成 `missing_info` 响应。
5.  **响应**: AI 控制器的处理结果（可能是成功执行的消息、`missing_info` 消息或错误消息）通过 `/ai-command` 端点返回给客户端。
*这种方式适用于希望通过自然语言进行快速操作、简化交互的场景。*

## API 端点说明

### 1. 具体功能 API (部分示例)

*   `POST /move-labware`: 移动耗材。
    *   请求体: `{"source_slot": <int>, "destination_slot": <int>, "plate_name": <str> (可选)}`
*   `POST /pipette`: 执行移液。
    *   请求体: (包含 `source_wells`, `dest_wells`, `volumes`, `source_labware_type`, `dest_labware_type`, `source_slot`, `dest_slot`, `pipette_type`, `tiprack_type`, `tiprack_slot` 等参数的 JSON)
*   `POST /thermocycler`: 控制热循环仪。
    *   请求体: (包含 `cycles`, `plate_type`, `steps` 等参数的 JSON)
*   `POST /heater-shaker`: 控制加热震荡仪。
    *   请求体: (包含 `plate_type`, `temperature`, `shake_speed`, `shake_duration` 等参数的 JSON)
*   *其他端点... (`/home`, `/lights-on`, `/lights-off`等)*

### 2. 自然语言命令 API (新增)

*   `POST /ai-command`: 通过自然语言控制机器人。
    *   **请求体 (Request Body)**:
        ```json
        {
          "command": "<用户的自然语言指令，例如：将1号槽的板子移动到3号槽>"
        }
        ```
    *   **响应体 (Response Body)**:
        *   成功: `{"status": "success", "message": "Operation '...' executed successfully.", "details": "..."}`
        *   缺少信息: `{"status": "missing_info", "message": "Missing required parameters for operation '...': ..."}`
        *   解析或执行错误: `{"status": "error", "message": "..."}`

## 配置与运行

1.  **配置 `config/ai_settings.py`**:
    *   设置 `API_KEY` 为你的大模型 API 密钥。
    *   检查 `SYSTEM_PROMPT` 和 `FUNCTION_MAPPINGS`。
2.  **配置 `config/settings.py`**:
    *   设置 `ROBOT_IP`, `ROBOT_PORT`。
    *   设置 `SERVER_HOST`, `SERVER_PORT`。
3.  **启动服务器**: `python server/ot_robot_server.py` (现在包含了所有 API 端点，包括 `/ai-command`)。
4.  **测试 AI 命令 API (示例)**:
    使用 `curl` 或 Python `requests` 发送 POST 请求到 `http://{SERVER_HOST}:{SERVER_PORT}/ai-command`:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"command": "将1号槽的板子移到3号槽"}' http://localhost:5001/ai-command 
    # (假设服务器运行在 localhost:5001)
    ```
```python
    import requests
    import json

    server_url = "http://localhost:5001/ai-command" # 替换为你的服务器地址
    command_data = {"command": "将1号槽的板子移动到3号槽"}

    response = requests.post(server_url, json=command_data)

    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.json()}")
    ```
5.  **运行测试**: `python -m unittest discover test`

## 项目结构

```plaintext
LLMcontrolOT3/
├── .gitignore             # Git 忽略配置文件 (例如忽略 __pycache__, .idea/, .vscode/)
├── README.md              # 项目说明文档 (本文件)
├── requirements.txt       # 项目依赖库列表 (例如 Flask, requests, openai)
│
├── ai_controller/         # AI 控制器模块
│   ├── __init__.py
│   ├── command_parser.py  # 负责调用大语言模型 (LLM) 解析自然语言指令为 JSON
│   └── main.py            # AI 控制器核心逻辑：接收指令 -> 解析 -> 验证参数 -> 调用服务器 API
│
├── config/                # 配置文件夹
│   ├── __init__.py
│   ├── ai_settings.py     # AI 相关配置：LLM API Key, 系统提示词 (SYSTEM_PROMPT), 操作映射 (FUNCTION_MAPPINGS)
│   └── settings.py        # 应用配置：服务器地址 (HOST/PORT), 机器人地址 (ROBOT_IP/PORT)
│
├── server/                # Flask 服务器模块
│   ├── __init__.py
│   └── ot_robot_server.py # Flask 应用实例和 API 端点定义 (包括 /ai-command 和具体操作 API)
│
├── templates/             # Opentrons Python API 协议模板
│   ├── __init__.py        # (可选) 使其成为 Python 包
│   ├── heater_shaker_template.py  # 加热震荡操作模板
│   ├── move_and_back_template.py  # 来回移动操作模板 (示例)
│   ├── pipetting_template.py      # 移液操作模板
│   ├── protocol_template.py       # 移动耗材操作模板
│   └── thermocycler_template.py   # 温控循环操作模板
│
├── test/                  # 测试代码文件夹 (统一存放所有测试)
│   ├── __init__.py        # 使其成为 Python 包
│   ├── test_ai_control.py     # AI 控制器单元测试 (使用 mock 模拟 LLM 和服务器)
│   ├── test_deepseek.py       # (示例) 测试 DeepSeek API 连通性
│   ├── otrobot_test_function.py # (示例) 测试服务器具体功能 API 的脚本
│   └── otrobot_test_protocol.py # (示例) 测试协议上传和执行流程的脚本
│
├── protocol_library/      # (原 protocalLibrary) 存放示例 Opentrons 协议文件 (.py)
│   ├── __init__.py        # (可选)
│   └── ... (示例协议 .py 文件) 
│
└── utils/                 # 实用工具模块
    ├── __init__.py
    └── generate_protocol.py # 根据模板和配置生成具体 Opentrons 协议的脚本

```

## 后续计划 (阶段性)

*   **阶段二**:
    *   精炼 `SYSTEM_PROMPT` 以提高 LLM 解析准确性。
    *   在 `ai_controller` 中增加更详细的参数验证（类型、范围、逻辑一致性）。
*   **阶段三**:
    *   支持将复杂的自然语言指令分解为顺序执行的多步操作。
    *   在 `ai_controller` 中添加基础的安全检查（如检查槽位冲突）。

## 技术栈

*   Python 3.x
*   Flask
*   Requests
*   DeepSeek API (或其他 LLM API)
*   Opentrons Python API v2
*   Unittest, unittest.mock

## 贡献

欢迎提出改进建议或贡献代码。请通过 Issue 或 Pull Request 进行。
