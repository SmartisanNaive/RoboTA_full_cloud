from flask import Flask, request, jsonify
import requests
import json
import os
import sys
import tempfile
import shutil

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 导入配置
from config.settings import ROBOT_IP, ROBOT_PORT, ROBOT_HEADERS
from config.settings import TEMPLATE_DIR, SERVER_HOST, SERVER_PORT

# 导入工具函数
from utils.generate_protocol import generate_protocol

# 导入 AI 控制器
from ai_controller.main import AIController

app = Flask(__name__)

# 设置机器人 URL
BASE_URL = f"http://{ROBOT_IP}:{ROBOT_PORT}"
HEADERS = ROBOT_HEADERS

# --- AI Controller Initialization ---
# 在 Flask 应用启动时创建 AIController 实例
# 注意：这会在全局作用域创建实例，对于简单应用是可行的。
# 对于更复杂的应用，可能需要使用 Flask 的应用上下文或扩展。
ai_controller = AIController()
# ----------------------------------

def post_request(endpoint, data=None, files=None):
    """发送 POST 请求并返回响应"""
    try:
        response = requests.post(
            url=f"{BASE_URL}{endpoint}",
            headers=HEADERS,
            data=json.dumps(data) if data else None,
            files=files
        )
        print(f"Posting to {BASE_URL}{endpoint} with data: {data}")  # Debugging line
        response.raise_for_status()  # Raise an exception for HTTP errors
        return response.json()
    except Exception as e:
        print(f"Error in post_request: {str(e)}")
        # Return a minimal valid response structure to prevent downstream errors
        if endpoint.startswith("/protocols"):
            return {"data": {"id": "error-protocol-id"}}
        elif endpoint.startswith("/runs"):
            return {"data": {"id": "error-run-id"}}
        elif "/actions" in endpoint:
            return {"data": {"actionType": "error", "id": "error-action-id"}}
        else:
            return {"error": str(e)}

@app.route("/home", methods=['POST'])
def home_robot():
    """发送 home 命令"""
    home_data = {"data": {"commandType": "home", "params": {}}}
    home_response = post_request("/commands", home_data)
    return jsonify({"Home Command Response": home_response})

@app.route("/lights-on", methods=['POST'])
def turn_lights_on():
    """打开机器人灯光"""
    lights_on_data = {"on": True}
    lights_on_response = post_request("/robot/lights", lights_on_data)
    return jsonify({"Lights On Response": lights_on_response})

@app.route("/lights-off", methods=['POST'])
def turn_lights_off():
    """关闭机器人灯光"""
    lights_off_data = {"on": False}
    lights_off_response = post_request("/robot/lights", lights_off_data)
    return jsonify({"Lights Off Response": lights_off_response})

@app.route("/upload-protocol/", methods=['POST'])
def upload_protocol():
    """上传协议文件"""
    file = request.files['file'] # Access the uploaded file
    protocol_response = post_request("/protocols", files={"files": (file.filename, file.read(), file.content_type)}) # Pass the file data
    protocol_id = protocol_response["data"]["id"]
    return jsonify({"Protocol ID": protocol_id})

@app.route("/run-protocol/", methods=['POST'])
def run_protocol():
    """创建运行并获取运行 ID"""
    protocol_id = request.form['protocol_id']  # Get protocol_id from form
    print(f"Received protocol_id: {protocol_id}")  # Debugging line
    run_data = {"data": {"protocolId": protocol_id}}
    try:
        run_response = post_request("/runs", run_data)
        print(f"Run response: {run_response}")  # Debugging line
        if "data" not in run_response:
            return jsonify({"error": "Invalid response from robot"}), 500
        run_id = run_response["data"]["id"]
        return jsonify({"Run ID": run_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/execute-action/", methods=['POST'])
def execute_action():
    """执行运行动作"""
    run_id = request.form['run_id'] # Get run_id from form
    action_data = {"data": {"actionType": "play"}}
    action_response = post_request(f"/runs/{run_id}/actions", action_data)
    return jsonify({"Action Response": action_response})

@app.route("/stop-runs/", methods=['POST'])
def stop_runs():
    """停止所有正在运行的任务"""
    try:
        stop_response = post_request("/runs", {"data": {"command": "stop"}})
        return jsonify({"message": "All runs stopped"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/move-labware", methods=['POST'])
def move_labware():
    """通过JSON数据控制机械臂移动耗材"""
    try:
        # 获取JSON数据
        data = request.json
        # 验证必要参数
        if 'source_slot' not in data or 'destination_slot' not in data:
            return jsonify({"error": "Missing required parameters: source_slot and destination_slot"}), 400
        
        # 获取参数
        source_slot = data['source_slot']
        destination_slot = data['destination_slot']
        plate_name = data.get('plate_name', 'corning_96_wellplate_360ul_flat')  # 默认值
        
        # 创建CSV格式的移动数据
        move_csv = f"SourceSlot,DestinationSlot\n{source_slot},{destination_slot}"
        
        # 创建配置数据
        config_data = {
            "moveCSV": move_csv,
            "plateName": plate_name
        }
        
        # 创建临时JSON配置文件
        temp_dir = tempfile.mkdtemp()
        config_file = os.path.join(temp_dir, "temp_config.json")
        with open(config_file, 'w') as f:
            json.dump(config_data, f)
        
        # 生成协议文件
        protocol_file = os.path.join(temp_dir, "temp_protocol.py")
        template_file = os.path.join(TEMPLATE_DIR, "protocol_template.py")
        generate_protocol(template_file, config_file, protocol_file)
        
        # 上传协议
        with open(protocol_file, 'rb') as f:
            protocol_response = post_request("/protocols", files={"files": (os.path.basename(protocol_file), f.read(), "text/plain")})
        
        protocol_id = protocol_response["data"]["id"]
        
        # 创建运行
        run_data = {"data": {"protocolId": protocol_id}}
        run_response = post_request("/runs", run_data)
        run_id = run_response["data"]["id"]
        
        # 执行运行
        action_data = {"data": {"actionType": "play"}}
        action_response = post_request(f"/runs/{run_id}/actions", action_data)
        
        # 清理临时文件
        shutil.rmtree(temp_dir)
        
        return jsonify({
            "status": "success",
            "message": f"Moving labware from slot {source_slot} to slot {destination_slot}",
            "protocol_id": protocol_id,
            "run_id": run_id,
            "action_response": action_response
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/move-labware-and-back", methods=['POST'])
def move_labware_and_back():
    """通过JSON数据控制机械臂移动耗材到目标位置，然后再移回原位置"""
    try:
        # 获取JSON数据
        data = request.json
        # 验证必要参数
        if 'source_slot' not in data or 'destination_slot' not in data:
            return jsonify({"error": "Missing required parameters: source_slot and destination_slot"}), 400
        
        # 获取参数
        source_slot = data['source_slot']
        destination_slot = data['destination_slot']
        plate_name = data.get('plate_name', 'corning_96_wellplate_360ul_flat')  # 默认值
        delay_seconds = data.get('delay_seconds', 5)  # 在目标位置停留的时间，默认5秒
        
        # 创建配置数据
        config_data = {
            "source_slot": source_slot,
            "destination_slot": destination_slot,
            "plate_name": plate_name,
            "delay_seconds": delay_seconds
        }
        
        # 创建临时JSON配置文件
        temp_dir = tempfile.mkdtemp()
        config_file = os.path.join(temp_dir, "move_and_back_config.json")
        with open(config_file, 'w') as f:
            json.dump(config_data, f)
        
        # 生成协议文件
        protocol_file = os.path.join(temp_dir, "move_and_back_protocol.py")
        template_file = os.path.join(TEMPLATE_DIR, "move_and_back_template.py")
        generate_protocol(template_file, config_file, protocol_file)
        
        # 上传协议
        with open(protocol_file, 'rb') as f:
            protocol_response = post_request("/protocols", files={"files": (os.path.basename(protocol_file), f.read(), "text/plain")})
        
        protocol_id = protocol_response["data"]["id"]
        
        # 创建运行
        run_data = {"data": {"protocolId": protocol_id}}
        run_response = post_request("/runs", run_data)
        run_id = run_response["data"]["id"]
        
        # 执行运行
        action_data = {"data": {"actionType": "play"}}
        action_response = post_request(f"/runs/{run_id}/actions", action_data)
        
        # 清理临时文件
        shutil.rmtree(temp_dir)
        
        return jsonify({
            "status": "success",
            "message": f"Moving labware from slot {source_slot} to slot {destination_slot} and back",
            "protocol_id": protocol_id,
            "run_id": run_id,
            "action_response": action_response
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/pipette", methods=['POST'])
def pipette_operation():
    """执行移液操作"""
    try:
        # 获取JSON数据
        data = request.json
        
        # 验证必要参数
        required_params = ['source_wells', 'dest_wells', 'volumes', 'source_labware_type', 
                          'dest_labware_type', 'source_slot', 'dest_slot', 'pipette_type', 
                          'tiprack_type', 'tiprack_slot']
        
        for param in required_params:
            if param not in data:
                return jsonify({"error": f"Missing required parameter: {param}"}), 400
        
        # 创建临时目录
        temp_dir = tempfile.mkdtemp()
        config_file = os.path.join(temp_dir, "pipette_config.json")
        
        # 写入配置文件
        with open(config_file, 'w') as f:
            json.dump(data, f)
        
        # 生成协议文件
        protocol_file = os.path.join(temp_dir, "pipette_protocol.py")
        template_file = os.path.join(TEMPLATE_DIR, "pipetting_template.py")
        generate_protocol(template_file, config_file, protocol_file)
        
        # 上传并执行协议
        with open(protocol_file, 'rb') as f:
            protocol_response = post_request("/protocols", files={"files": (os.path.basename(protocol_file), f.read(), "text/plain")})
        
        protocol_id = protocol_response["data"]["id"]
        
        # 创建运行
        run_data = {"data": {"protocolId": protocol_id}}
        run_response = post_request("/runs", run_data)
        run_id = run_response["data"]["id"]
        
        # 执行运行
        action_data = {"data": {"actionType": "play"}}
        action_response = post_request(f"/runs/{run_id}/actions", action_data)
        
        # 清理临时文件
        shutil.rmtree(temp_dir)
        
        return jsonify({
            "status": "success",
            "message": "Pipetting operation started",
            "protocol_id": protocol_id,
            "run_id": run_id,
            "action_response": action_response
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/thermocycler", methods=['POST'])
def thermocycler_operation():
    """控制热循环仪"""
    try:
        # 获取JSON数据
        data = request.json
        
        # 验证必要参数
        required_params = ['cycles', 'plate_type', 'steps']
        
        for param in required_params:
            if param not in data:
                return jsonify({"error": f"Missing required parameter: {param}"}), 400
        
        # 验证steps格式
        for step in data['steps']:
            if 'temperature' not in step or 'hold_time' not in step:
                return jsonify({"error": "Each step must contain temperature and hold_time"}), 400
        
        # 创建临时目录
        temp_dir = tempfile.mkdtemp()
        config_file = os.path.join(temp_dir, "thermocycler_config.json")
        
        # 写入配置文件
        with open(config_file, 'w') as f:
            json.dump(data, f)
        
        # 生成协议文件
        protocol_file = os.path.join(temp_dir, "thermocycler_protocol.py")
        template_file = os.path.join(TEMPLATE_DIR, "thermocycler_template.py")
        generate_protocol(template_file, config_file, protocol_file)
        
        # 上传并执行协议
        with open(protocol_file, 'rb') as f:
            protocol_response = post_request("/protocols", files={"files": (os.path.basename(protocol_file), f.read(), "text/plain")})
        
        protocol_id = protocol_response["data"]["id"]
        
        # 创建运行
        run_data = {"data": {"protocolId": protocol_id}}
        run_response = post_request("/runs", run_data)
        run_id = run_response["data"]["id"]
        
        # 执行运行
        action_data = {"data": {"actionType": "play"}}
        action_response = post_request(f"/runs/{run_id}/actions", action_data)
        
        # 清理临时文件
        shutil.rmtree(temp_dir)
        
        return jsonify({
            "status": "success",
            "message": "Thermocycler operation started",
            "protocol_id": protocol_id,
            "run_id": run_id,
            "action_response": action_response
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/heater-shaker", methods=['POST'])
def heater_shaker_operation():
    """控制热震荡仪"""
    try:
        # 获取JSON数据
        data = request.json or {}
        
        # 添加操作类型
        data['operation_type'] = 'run'
        
        # 验证必要参数
        required_params = ['plate_type', 'temperature', 'shake_speed', 'shake_duration']
        
        for param in required_params:
            if param not in data:
                return jsonify({"error": f"Missing required parameter: {param}"}), 400
        
        # 创建临时目录
        temp_dir = tempfile.mkdtemp()
        config_file = os.path.join(temp_dir, "heater_shaker_config.json")
        
        # 写入配置文件
        with open(config_file, 'w') as f:
            json.dump(data, f)
        
        # 生成协议文件
        protocol_file = os.path.join(temp_dir, "heater_shaker_protocol.py")
        template_file = os.path.join(TEMPLATE_DIR, "heater_shaker_template.py")
        generate_protocol(template_file, config_file, protocol_file)
        
        # 上传并执行协议
        with open(protocol_file, 'rb') as f:
            protocol_response = post_request("/protocols", files={"files": (os.path.basename(protocol_file), f.read(), "text/plain")})
        
        protocol_id = protocol_response["data"]["id"]
        
        # 创建运行
        run_data = {"data": {"protocolId": protocol_id}}
        run_response = post_request("/runs", run_data)
        run_id = run_response["data"]["id"]
        
        # 执行运行
        action_data = {"data": {"actionType": "play"}}
        action_response = post_request(f"/runs/{run_id}/actions", action_data)
        
        # 清理临时文件
        shutil.rmtree(temp_dir)
        
        return jsonify({
            "status": "success",
            "message": "Heater-shaker operation started",
            "protocol_id": protocol_id,
            "run_id": run_id,
            "action_response": action_response
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/heater-shaker-open", methods=['POST'])
def heater_shaker_open_operation():
    """打开热震荡仪夹具"""
    try:
        # 获取JSON数据
        data = request.json or {}
        
        # 添加操作类型
        data['operation_type'] = 'open'
        
        # 验证必要参数
        if 'plate_type' not in data:
            # 使用默认板类型
            data['plate_type'] = 'corning_96_wellplate_360ul_flat'
        
        # 创建临时目录
        temp_dir = tempfile.mkdtemp()
        config_file = os.path.join(temp_dir, "heater_shaker_open_config.json")
        
        # 写入配置文件
        with open(config_file, 'w') as f:
            json.dump(data, f)
        
        # 生成协议文件
        protocol_file = os.path.join(temp_dir, "heater_shaker_open_protocol.py")
        template_file = os.path.join(TEMPLATE_DIR, "heater_shaker_template.py")
        generate_protocol(template_file, config_file, protocol_file)
        
        # 上传并执行协议
        with open(protocol_file, 'rb') as f:
            protocol_response = post_request("/protocols", files={"files": (os.path.basename(protocol_file), f.read(), "text/plain")})
        
        protocol_id = protocol_response["data"]["id"]
        
        # 创建运行
        run_data = {"data": {"protocolId": protocol_id}}
        run_response = post_request("/runs", run_data)
        run_id = run_response["data"]["id"]
        
        # 执行运行
        action_data = {"data": {"actionType": "play"}}
        action_response = post_request(f"/runs/{run_id}/actions", action_data)
        
        # 清理临时文件
        shutil.rmtree(temp_dir)
        
        return jsonify({
            "status": "success",
            "message": "Heater-shaker clamp opened",
            "protocol_id": protocol_id,
            "run_id": run_id,
            "action_response": action_response
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/heater-shaker-close", methods=['POST'])
def heater_shaker_close_operation():
    """关闭热震荡仪夹具"""
    try:
        # 获取JSON数据
        data = request.json or {}
        
        # 添加操作类型
        data['operation_type'] = 'close'
        
        # 验证必要参数
        if 'plate_type' not in data:
            # 使用默认板类型
            data['plate_type'] = 'corning_96_wellplate_360ul_flat'
        
        # 创建临时目录
        temp_dir = tempfile.mkdtemp()
        config_file = os.path.join(temp_dir, "heater_shaker_close_config.json")
        
        # 写入配置文件
        with open(config_file, 'w') as f:
            json.dump(data, f)
        
        # 生成协议文件
        protocol_file = os.path.join(temp_dir, "heater_shaker_close_protocol.py")
        template_file = os.path.join(TEMPLATE_DIR, "heater_shaker_template.py")
        generate_protocol(template_file, config_file, protocol_file)
        
        # 上传并执行协议
        with open(protocol_file, 'rb') as f:
            protocol_response = post_request("/protocols", files={"files": (os.path.basename(protocol_file), f.read(), "text/plain")})
        
        protocol_id = protocol_response["data"]["id"]
        
        # 创建运行
        run_data = {"data": {"protocolId": protocol_id}}
        run_response = post_request("/runs", run_data)
        run_id = run_response["data"]["id"]
        
        # 执行运行
        action_data = {"data": {"actionType": "play"}}
        action_response = post_request(f"/runs/{run_id}/actions", action_data)
        
        # 清理临时文件
        shutil.rmtree(temp_dir)
        
        return jsonify({
            "status": "success",
            "message": "Heater-shaker clamp closed",
            "protocol_id": protocol_id,
            "run_id": run_id,
            "action_response": action_response
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/thermocycler/open-lid", methods=['POST'])
def thermocycler_open_lid():
    """打开热循环仪盖子"""
    try:
        # 创建临时目录
        temp_dir = tempfile.mkdtemp()
        
        # 准备配置数据
        data = {
            "cycles": 0,
            "plate_type": request.json.get('plate_type', 'nest_96_wellplate_100ul_pcr_full_skirt'),
            "open_lid": True,
            "steps": []
        }
        
        # 写入配置文件
        config_file = os.path.join(temp_dir, "thermocycler_config.json")
        with open(config_file, 'w') as f:
            json.dump(data, f)
        
        # 生成协议文件
        protocol_file = os.path.join(temp_dir, "thermocycler_protocol.py")
        template_file = os.path.join(TEMPLATE_DIR, "thermocycler_template.py")
        generate_protocol(template_file, config_file, protocol_file)
        
        # 上传并执行协议
        with open(protocol_file, 'rb') as f:
            protocol_response = post_request("/protocols", files={"files": (os.path.basename(protocol_file), f.read(), "text/plain")})
        
        protocol_id = protocol_response["data"]["id"]
        
        # 创建运行
        run_data = {"data": {"protocolId": protocol_id}}
        run_response = post_request("/runs", run_data)
        run_id = run_response["data"]["id"]
        
        # 执行运行
        action_data = {"data": {"actionType": "play"}}
        action_response = post_request(f"/runs/{run_id}/actions", action_data)
        
        # 清理临时文件
        shutil.rmtree(temp_dir)
        
        return jsonify({
            "status": "success",
            "message": "Opening thermocycler lid",
            "protocol_id": protocol_id,
            "run_id": run_id,
            "action_response": action_response
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/thermocycler/close-lid", methods=['POST'])
def thermocycler_close_lid():
    """关闭热循环仪盖子"""
    try:
        # 创建临时目录
        temp_dir = tempfile.mkdtemp()
        
        # 准备配置数据
        data = {
            "cycles": 0,
            "plate_type": request.json.get('plate_type', 'nest_96_wellplate_100ul_pcr_full_skirt'),
            "close_lid": True,
            "steps": []
        }
        
        # 写入配置文件
        config_file = os.path.join(temp_dir, "thermocycler_config.json")
        with open(config_file, 'w') as f:
            json.dump(data, f)
        
        # 生成协议文件
        protocol_file = os.path.join(temp_dir, "thermocycler_protocol.py")
        template_file = os.path.join(TEMPLATE_DIR, "thermocycler_template.py")
        generate_protocol(template_file, config_file, protocol_file)
        
        # 上传并执行协议
        with open(protocol_file, 'rb') as f:
            protocol_response = post_request("/protocols", files={"files": (os.path.basename(protocol_file), f.read(), "text/plain")})
        
        protocol_id = protocol_response["data"]["id"]
        
        # 创建运行
        run_data = {"data": {"protocolId": protocol_id}}
        run_response = post_request("/runs", run_data)
        run_id = run_response["data"]["id"]
        
        # 执行运行
        action_data = {"data": {"actionType": "play"}}
        action_response = post_request(f"/runs/{run_id}/actions", action_data)
        
        # 清理临时文件
        shutil.rmtree(temp_dir)
        
        return jsonify({
            "status": "success",
            "message": "Closing thermocycler lid",
            "protocol_id": protocol_id,
            "run_id": run_id,
            "action_response": action_response
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/thermocycler/set-temperature", methods=['POST'])
def thermocycler_set_temperature():
    """设置热循环仪温度"""
    try:
        # 验证必要参数
        if 'temperature' not in request.json:
            return jsonify({"error": "Missing required parameter: temperature"}), 400
            
        temperature = request.json['temperature']
        hold_time = request.json.get('hold_time', 0)  # 可选的保持时间（秒）
        
        # 创建临时目录
        temp_dir = tempfile.mkdtemp()
        
        # 准备配置数据
        data = {
            "cycles": 1,
            "plate_type": request.json.get('plate_type', 'nest_96_wellplate_100ul_pcr_full_skirt'),
            "steps": [
                {"temperature": temperature, "hold_time": hold_time}
            ]
        }
        
        # 写入配置文件
        config_file = os.path.join(temp_dir, "thermocycler_config.json")
        with open(config_file, 'w') as f:
            json.dump(data, f)
        
        # 生成协议文件
        protocol_file = os.path.join(temp_dir, "thermocycler_protocol.py")
        template_file = os.path.join(TEMPLATE_DIR, "thermocycler_template.py")
        generate_protocol(template_file, config_file, protocol_file)
        
        # 上传并执行协议
        with open(protocol_file, 'rb') as f:
            protocol_response = post_request("/protocols", files={"files": (os.path.basename(protocol_file), f.read(), "text/plain")})
        
        protocol_id = protocol_response["data"]["id"]
        
        # 创建运行
        run_data = {"data": {"protocolId": protocol_id}}
        run_response = post_request("/runs", run_data)
        run_id = run_response["data"]["id"]
        
        # 执行运行
        action_data = {"data": {"actionType": "play"}}
        action_response = post_request(f"/runs/{run_id}/actions", action_data)
        
        # 清理临时文件
        shutil.rmtree(temp_dir)
        
        return jsonify({
            "status": "success",
            "message": f"Setting thermocycler temperature to {temperature}°C",
            "protocol_id": protocol_id,
            "run_id": run_id,
            "action_response": action_response
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- New AI Command Endpoint ---
@app.route("/ai-command", methods=['POST'])
def handle_ai_command():
    """接收自然语言指令，通过 AI 控制器处理并执行"""
    try:
        # 获取 JSON 数据
        data = request.json
        if not data or 'command' not in data:
            return jsonify({"status": "error", "message": "Missing 'command' field in JSON request body"}), 400
        
        user_command = data['command']
        if not user_command:
             return jsonify({"status": "error", "message": "'command' field cannot be empty"}), 400

        # 调用 AI 控制器处理指令
        # ai_controller 是在上面初始化的全局实例
        result = ai_controller.process_command(user_command)
        
        # 返回 AI 控制器的处理结果
        # 根据 AI 控制器返回的状态码决定 HTTP 状态码可能更优，
        # 但为简单起见，这里默认返回 200，除非有请求本身错误。
        # AI 控制器内部错误会通过 JSON 中的 status 返回。
        return jsonify(result)

    except Exception as e:
        # 捕获意外错误
        print(f"Error in /ai-command endpoint: {str(e)}") # Log the error server-side
        return jsonify({"status": "error", "message": f"Internal server error processing AI command: {str(e)}"}), 500
# -----------------------------

if __name__ == '__main__':
    app.run(host=SERVER_HOST, port=SERVER_PORT, debug=True)