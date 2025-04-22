"""
LLM管理器模块
负责与DeepSeek API的交互
"""

from openai import OpenAI
from config.ai_settings import (
    DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL,
    DEEPSEEK_MODEL,
    SYSTEM_PROMPT
)

class LLMManager:
    def __init__(self):
        print("Initializing LLM Manager...")
        print(f"Base URL: {DEEPSEEK_BASE_URL}")
        print(f"Model: {DEEPSEEK_MODEL}")
        self.client = OpenAI(
            api_key=DEEPSEEK_API_KEY,
            base_url=DEEPSEEK_BASE_URL
        )
        self.model = DEEPSEEK_MODEL
        
    def get_completion(self, user_input):
        """
        获取LLM的响应
        
        Args:
            user_input (str): 用户输入的指令
            
        Returns:
            str: LLM的响应内容
        """
        print("\nSending request to DeepSeek API...")
        print(f"User input: {user_input}")
        
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_input}
        ]
        
        try:
            print("Calling API...")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=False
            )
            print("API call successful")
            content = response.choices[0].message.content
            print(f"Response content: {content}")
            return content
        except Exception as e:
            print(f"Error calling DeepSeek API: {str(e)}")
            print(f"Error type: {type(e)}")
            if hasattr(e, 'response'):
                print(f"Response status: {e.response.status_code}")
                print(f"Response text: {e.response.text}")
            return None 