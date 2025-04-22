"""
命令解析器模块
负责解析LLM的响应并转换为可执行的命令
"""

import json
import re
from .llm_manager import LLMManager

class CommandParser:
    def __init__(self):
        self.llm_manager = LLMManager()
        
    def parse_command(self, user_input):
        """
        解析用户输入的自然语言指令
        
        Args:
            user_input (str): 用户输入的指令
            
        Returns:
            dict: 解析后的命令字典
        """
        # 获取LLM的响应
        llm_response = self.llm_manager.get_completion(user_input)
        if not llm_response:
            return None
            
        try:
            # 从Markdown代码块中提取JSON
            json_str = self._extract_json_from_markdown(llm_response)
            if not json_str:
                print("No JSON found in response")
                return None
                
            # 解析JSON响应
            command = json.loads(json_str)
            
            # 检查 'operation' 字段是否存在
            if "operation" not in command:
                print("Error: Parsed JSON is missing the 'operation' field.")
                return None

            # 检查 'params' 字段是否存在 (可选，但推荐)
            if "params" not in command:
                 print("Warning: Parsed JSON is missing the 'params' field.")
                 # Depending on requirements, you might return None or an empty params dict
                 command["params"] = {} # Example: Add an empty params dict if missing

            print(f"Parsed command: {command}")
            return command
            
        except json.JSONDecodeError as e:
            print(f"Error parsing LLM response: {str(e)}")
            return None
            
    def _extract_json_from_markdown(self, text):
        """
        从Markdown代码块中提取JSON字符串
        
        Args:
            text (str): 包含Markdown代码块的文本
            
        Returns:
            str: JSON字符串，如果没找到则返回None
        """
        # 匹配```json 和 ``` 之间的内容
        pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
        match = re.search(pattern, text)
        if match:
            return match.group(1)
        return None 