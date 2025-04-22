from openai import OpenAI
import json
from typing import Dict, Any, List, Optional

from config.ai_settings import API_KEY, API_BASE_URL, LLM_MODEL

def get_llm_client():
    """获取LLM客户端"""
    return OpenAI(
        api_key=API_KEY,
        base_url=API_BASE_URL
    )

def direct_llm_query(
    prompt: str, 
    system_message: str = None, 
    history: List[Dict[str, str]] = None,
    temperature: float = 0.3,
    max_tokens: int = 2000
) -> Dict[str, Any]:
    """
    直接查询LLM API
    
    Args:
        prompt: 用户提示词
        system_message: 系统消息
        history: 对话历史
        temperature: 温度参数
        max_tokens: 最大生成token数
        
    Returns:
        解析后的模型响应
    """
    client = get_llm_client()
    
    # 构建消息列表
    messages = []
    
    # 添加系统消息
    if system_message:
        messages.append({"role": "system", "content": system_message})
    
    # 添加历史消息
    if history:
        messages.extend(history)
    
    # 添加当前用户消息
    messages.append({"role": "user", "content": prompt})
    
    try:
        # 调用API
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # 提取回复内容
        reply = response.choices[0].message.content
        
        # 检查是否为JSON格式
        try:
            json_response = json.loads(reply)
            return {
                "text": reply,
                "parsed_json": json_response,
                "is_json": True
            }
        except json.JSONDecodeError:
            # 如果不是JSON格式，返回文本
            return {
                "text": reply,
                "parsed_json": None,
                "is_json": False
            }
            
    except Exception as e:
        return {
            "error": str(e),
            "text": None,
            "parsed_json": None,
            "is_json": False
        } 