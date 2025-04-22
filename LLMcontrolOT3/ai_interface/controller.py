from langchain.agents import AgentExecutor, LLMSingleActionAgent
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain.schema.agent import AgentAction, AgentFinish

import requests
import json
import re
from typing import Dict, List, Union, Any, Optional

from config.ai_settings import SYSTEM_PROMPT
from ai_interface.tools import register_tools, get_tools
from ai_interface.prompts import PREFIX, SUFFIX, FORMAT_INSTRUCTIONS, CustomPromptTemplate, CustomOutputParser
from ai_interface.llm_integrations import get_llm_model

class RobotController:
    """大模型控制器类，用于处理自然语言指令并转换为机器人操作"""
    
    def __init__(self, base_url="http://localhost:5000"):
        """初始化控制器"""
        self.base_url = base_url
        
        # 初始化LLM（使用集成模块）
        self.llm = get_llm_model()
        
        # 注册工具
        self.tools = register_tools(base_url)
        
        # 初始化记忆组件
        self.memory = ConversationBufferMemory(memory_key="chat_history")
        
        # 创建代理执行器
        self.agent_executor = self._create_agent_executor()
    
    def _create_agent_executor(self):
        """创建代理执行器"""
        # 创建提示模板
        prompt = CustomPromptTemplate(
            template=PREFIX + FORMAT_INSTRUCTIONS + SUFFIX,
            tools=self.tools,
            system_message=SYSTEM_PROMPT,
            input_variables=["input", "chat_history", "agent_scratchpad"]
        )
        
        # 输出解析器
        output_parser = CustomOutputParser()
        
        # 创建LLM链
        llm_chain = LLMChain(llm=self.llm, prompt=prompt)
        
        # 创建代理
        agent = LLMSingleActionAgent(
            llm_chain=llm_chain,
            output_parser=output_parser,
            stop=["\nObservation:"],
            allowed_tools=[tool.name for tool in self.tools]
        )
        
        # 创建代理执行器
        return AgentExecutor.from_agent_and_tools(
            agent=agent,
            tools=self.tools,
            verbose=True,
            memory=self.memory
        )
    
    def execute_command(self, command: str) -> str:
        """执行自然语言命令"""
        try:
            # 使用代理执行器处理命令
            response = self.agent_executor.run(command)
            return response
        except Exception as e:
            return f"执行命令时发生错误: {str(e)}"
    
    def reset_memory(self):
        """重置对话记忆"""
        self.memory = ConversationBufferMemory(memory_key="chat_history")
        self.agent_executor = self._create_agent_executor()
        return "记忆已重置。" 