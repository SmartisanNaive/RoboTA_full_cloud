"""
HTTP反向代理服务
为外部大模型提供统一的访问接口
"""

from flask import Flask, request, jsonify
import requests
import uuid
import json
import time
import asyncio
from typing import Dict, Any, List, Optional

from config.settings import SERVER_HOST, SERVER_PORT
from ai_interface.llm_controller import LLMController
from ai_interface.llm_integrations import direct_llm_query

app = Flask(__name__)

# 会话映射
session_mapping = {}

# LLM控制器实例
controllers = {}

@app.route("/api/v1/robot", methods=["POST"])
def robot_proxy():
    """
    机器人代理API
    允许外部LLM通过统一接口访问机器人控制系统
    
    请求体格式:
    {
        "external_session_id": "外部会话ID", (可选)
        "message": "用户消息",
        "model_info": {
            "provider": "模型提供商",  (可选)
            "model": "模型名称"        (可选)
        }
    }
    
    响应格式:
    {
        "external_session_id": "外部会话ID",
        "internal_session_id": "内部会话ID",
        "response": "机器人响应",
        "api_call": {
            "intent": "意图",
            "parameters": {...}
        } (可选)
    }
    """
    try:
        data = request.json
        
        # 获取外部会话ID
        external_session_id = data.get("external_session_id")
        if not external_session_id:
            external_session_id = str(uuid.uuid4())
        
        # 获取内部会话ID
        internal_session_id = session_mapping.get(external_session_id)
        if not internal_session_id:
            internal_session_id = str(uuid.uuid4())
            session_mapping[external_session_id] = internal_session_id
            
        # 获取用户消息
        user_message = data.get("message")
        if not user_message:
            return jsonify({"error": "消息不能为空"}), 400
        
        # 获取或创建LLM控制器
        if internal_session_id not in controllers:
            controllers[internal_session_id] = LLMController()
        
        controller = controllers[internal_session_id]
        
        # 处理命令
        parsed_command = controller.process_command(user_message)
        
        # 如果解析成功并且有明确的意图，则转发到对应的机器人API
        if "error" not in parsed_command and "intent" in parsed_command:
            api_endpoint = parsed_command["endpoint"]
            parameters = parsed_command["parameters"]
            
            # 构建API URL
            robot_api_url = f"http://{SERVER_HOST}:{SERVER_PORT}{api_endpoint}"
            
            try:
                # 调用机器人API
                robot_response = requests.post(robot_api_url, json=parameters)
                robot_response.raise_for_status()
                
                # 返回结果
                return jsonify({
                    "external_session_id": external_session_id,
                    "internal_session_id": internal_session_id,
                    "response": parsed_command["description"],
                    "api_call": {
                        "intent": parsed_command["intent"],
                        "parameters": parsed_command["parameters"]
                    },
                    "robot_response": robot_response.json()
                })
            
            except requests.exceptions.RequestException as e:
                return jsonify({
                    "external_session_id": external_session_id,
                    "internal_session_id": internal_session_id,
                    "error": f"调用机器人API时出错: {str(e)}",
                    "api_call": {
                        "intent": parsed_command["intent"],
                        "parameters": parsed_command["parameters"]
                    }
                })
        
        # 如果解析出错或没有明确意图，返回错误信息
        return jsonify({
            "external_session_id": external_session_id,
            "internal_session_id": internal_session_id,
            "response": parsed_command.get("error", "无法解析命令"),
            "parsed_result": parsed_command
        })
        
    except Exception as e:
        app.logger.error(f"处理代理请求时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/robot/reset", methods=["POST"])
def reset_proxy_session():
    """重置会话"""
    try:
        data = request.json
        external_session_id = data.get("external_session_id")
        
        if not external_session_id or external_session_id not in session_mapping:
            return jsonify({"error": "会话不存在"}), 404
        
        internal_session_id = session_mapping[external_session_id]
        
        # 清除会话历史
        if internal_session_id in controllers:
            controllers[internal_session_id].clear_history()
        
        return jsonify({
            "external_session_id": external_session_id,
            "message": "会话已重置"
        })
        
    except Exception as e:
        app.logger.error(f"重置代理会话时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/analyze", methods=["POST"])
def analyze_experiment():
    """
    分析实验请求
    使用LLM分析用户的实验需求，返回结构化的实验步骤
    
    请求体格式:
    {
        "description": "实验描述"
    }
    
    响应格式:
    {
        "analysis": "分析结果"
    }
    """
    try:
        data = request.json
        description = data.get("description")
        
        if not description:
            return jsonify({"error": "实验描述不能为空"}), 400
        
        # 构造提示词
        prompt = f"""请分析以下实验描述，提取关键步骤和参数，并转换为结构化的实验流程:

实验描述: {description}

分析结果应包括:
1. 实验目的简述
2. 所需耗材和设备
3. 步骤分解（精确到具体参数，如体积、温度、时间等）
4. 可能的风险点和注意事项

请以JSON格式返回你的分析结果:
{{
    "experiment_name": "实验名称",
    "purpose": "实验目的",
    "materials": ["耗材1", "耗材2", ...],
    "equipment": ["设备1", "设备2", ...],
    "steps": [
        {{
            "step_number": 1,
            "description": "步骤描述",
            "parameters": {{...具体参数...}},
            "duration": "预计时间"
        }},
        ...
    ],
    "risks": ["风险1", "风险2", ...],
    "notes": ["注意事项1", "注意事项2", ...]
}}
"""
        
        # 使用LLM进行分析
        analysis_result = direct_llm_query(prompt)
        
        if analysis_result["is_json"]:
            return jsonify(analysis_result["parsed_json"])
        else:
            return jsonify({
                "analysis": analysis_result["text"]
            })
        
    except Exception as e:
        app.logger.error(f"分析实验时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/translate", methods=["POST"])
def translate_to_robot_command():
    """
    将自然语言翻译为机器人命令
    
    请求体格式:
    {
        "instruction": "自然语言指令"
    }
    
    响应格式:
    {
        "robot_command": {
            "intent": "操作类型",
            "parameters": {...}
        }
    }
    """
    try:
        data = request.json
        instruction = data.get("instruction")
        
        if not instruction:
            return jsonify({"error": "指令不能为空"}), 400
        
        # 创建临时控制器处理单条指令
        temp_controller = LLMController()
        result = temp_controller.process_command(instruction)
        
        return jsonify({
            "robot_command": result
        })
        
    except Exception as e:
        app.logger.error(f"翻译命令时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/templates", methods=["GET"])
def get_api_templates():
    """获取API模板信息"""
    try:
        # 创建临时控制器获取模板
        temp_controller = LLMController()
        templates = temp_controller.get_api_templates()
        
        return jsonify(templates)
        
    except Exception as e:
        app.logger.error(f"获取API模板时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500

# 清理过期会话
def cleanup_sessions():
    """清理过期会话和控制器"""
    current_time = time.time()
    expired_sessions = []
    
    for external_id, internal_id in session_mapping.items():
        # 假设30分钟没有活动就清理
        if current_time - getattr(controllers.get(internal_id, object()), "last_active_time", 0) > 1800:
            expired_sessions.append((external_id, internal_id))
    
    for external_id, internal_id in expired_sessions:
        if internal_id in controllers:
            del controllers[internal_id]
        del session_mapping[external_id]

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5002) 