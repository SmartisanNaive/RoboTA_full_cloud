import json
import logging
import re
from typing import Dict, Any, List, Optional, Tuple, Union

from config.ai_settings import API_TEMPLATES, SYSTEM_PROMPT, MAX_HISTORY_LENGTH
from ai_interface.llm_integrations import direct_llm_query

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 板子位置映射
POSITION_MAPPING = {
    "A1": 10, "A2": 11, "A3": 12,
    "B1": 7, "B2": 8, "B3": 9,
    "C1": 4, "C2": 5, "C3": 6,
    "D1": 1, "D2": 2, "D3": 3
}

class LLMController:
    """
    大模型控制器，负责解析自然语言指令为API调用参数
    """
    def __init__(self):
        """初始化控制器"""
        self.conversation_history = []
        
    def process_command(self, command: str, concise_output: bool = True) -> Dict[str, Any]:
        """
        处理用户命令
        
        Args:
            command: 用户自然语言命令
            concise_output: 是否使用简洁输出格式（移除description字段）
            
        Returns:
            解析后的API调用参数
        """
        # 添加用户输入到历史
        self._add_to_history({"role": "user", "content": command})
        
        # 调用LLM解析命令
        response = direct_llm_query(
            prompt=command,
            system_message=SYSTEM_PROMPT,
            history=self.conversation_history[:-1],  # 不包括最后一条用户消息，因为已经在prompt中
            temperature=0.2,  # 使用较低的温度提高一致性
            max_tokens=1500
        )
        
        # 检查是否有错误
        if "error" in response:
            return {"error": response["error"]}
        
        # 保存LLM回复到历史
        self._add_to_history({"role": "assistant", "content": response["text"]})
        
        # 处理响应
        if response["is_json"]:
            # 已经是JSON格式
            result = self._validate_and_format_intent(response["parsed_json"])
        else:
            # 尝试从文本中提取JSON
            try:
                # 查找JSON部分
                text = response["text"]
                json_start = text.find('{')
                json_end = text.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = text[json_start:json_end]
                    parsed_json = json.loads(json_str)
                    result = self._validate_and_format_intent(parsed_json)
                else:
                    # 无法提取JSON
                    result = {
                        "error": "无法从LLM响应中提取JSON格式",
                        "raw_response": text
                    }
            except Exception as e:
                result = {
                    "error": f"解析LLM响应时出错: {str(e)}",
                    "raw_response": response["text"]
                }
        
        # 如果需要简洁输出，移除描述字段
        if concise_output and "description" in result and "error" not in result:
            del result["description"]
            
        return result
    
    def _convert_plate_positions(self, parameters: Dict) -> Dict:
        """
        转换板子位置格式
        如果source_slot或destination_slot是字符串格式（如"A1", "B2"），
        则转换为对应的数字编号
        
        Args:
            parameters: 参数字典
            
        Returns:
            更新后的参数字典
        """
        # 处理source_slot
        if "source_slot" in parameters:
            source = parameters["source_slot"]
            if isinstance(source, str) and source.upper() in POSITION_MAPPING:
                parameters["source_slot"] = POSITION_MAPPING[source.upper()]
        
        # 处理destination_slot
        if "destination_slot" in parameters:
            dest = parameters["destination_slot"]
            if isinstance(dest, str) and dest.upper() in POSITION_MAPPING:
                parameters["destination_slot"] = POSITION_MAPPING[dest.upper()]
                
        return parameters
    
    def _validate_and_format_intent(self, parsed_response: Dict) -> Dict:
        """
        验证并格式化意图
        
        Args:
            parsed_response: 解析后的LLM响应
            
        Returns:
            验证后的响应
        """
        intent = parsed_response.get("intent")
        parameters = parsed_response.get("parameters", {})
        description = parsed_response.get("description", "")
        
        # 检查意图是否有效
        if not intent or intent not in API_TEMPLATES:
            return {
                "error": f"无效的操作类型: {intent}",
                "valid_intents": list(API_TEMPLATES.keys())
            }
        
        # 获取API模板
        template = API_TEMPLATES[intent]
        
        # 如果是移动板子操作，转换位置格式
        if intent == "move_labware":
            parameters = self._convert_plate_positions(parameters)
        
        # 特殊处理热循环仪的完整PCR程序
        if intent == "thermocycler" and "steps" in parameters:
            # 如果提供了steps参数，则不再需要temperature和hold_time
            required_params = ["steps", "cycles"]
            # 检查steps的格式是否正确
            if not isinstance(parameters["steps"], list):
                return {
                    "error": "steps参数格式错误，应为包含temperature和hold_time的对象列表",
                    "intent": intent
                }
            # 检查每个step是否包含必要的temperature和hold_time
            for i, step in enumerate(parameters["steps"]):
                if not isinstance(step, dict) or "temperature" not in step or "hold_time" not in step:
                    return {
                        "error": f"步骤 {i+1} 缺少必要参数: temperature, hold_time",
                        "intent": intent
                    }
        else:
            # 常规参数验证
            required_params = template["required_params"]
        
        # 检查必要参数
        missing_params = []
        for param in required_params:
            if param not in parameters:
                missing_params.append(param)
        
        if missing_params:
            return {
                "error": f"缺少必要参数: {', '.join(missing_params)}",
                "intent": intent,
                "missing_params": missing_params,
                "template": template
            }
        
        # 添加默认值（如果参数未提供且存在默认值）
        if "default_values" in template:
            for param, default_value in template["default_values"].items():
                if param not in parameters and param in template["optional_params"]:
                    parameters[param] = default_value
        
        # 构建响应
        response = {
            "intent": intent,
            "parameters": parameters,
            "description": description or template["description"],
            "endpoint": template["endpoint"]
        }
        
        return response
    
    def _add_to_history(self, message: Dict[str, str]):
        """
        添加消息到对话历史
        
        Args:
            message: 消息字典，包含role和content
        """
        self.conversation_history.append(message)
        
        # 限制历史长度
        if len(self.conversation_history) > MAX_HISTORY_LENGTH * 2:  # 乘以2是因为每轮有用户和助手两条消息
            self.conversation_history = self.conversation_history[-MAX_HISTORY_LENGTH*2:]
    
    def clear_history(self):
        """清除对话历史"""
        self.conversation_history = []
        return {"message": "对话历史已清除"}
    
    def get_api_templates(self) -> Dict[str, Any]:
        """获取API模板信息"""
        return {"templates": API_TEMPLATES} 