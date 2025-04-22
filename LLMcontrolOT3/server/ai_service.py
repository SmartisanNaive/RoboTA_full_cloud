from flask import Flask, request, jsonify
import uuid
import time
import threading
from typing import Dict, Any, List, Optional

# 导入AI控制器
from ai_interface.controller import RobotController
from config.ai_settings import MAX_HISTORY_LENGTH, HISTORY_TIMEOUT

app = Flask(__name__)

# 全局会话存储
sessions = {}

# 会话清理锁
cleanup_lock = threading.Lock()

@app.route("/api/chat", methods=["POST"])
def chat():
    """处理聊天请求"""
    try:
        data = request.json
        
        # 获取会话ID，如果不存在则创建新会话
        session_id = data.get("session_id")
        if not session_id or session_id not in sessions:
            session_id = str(uuid.uuid4())
            sessions[session_id] = {
                "controller": RobotController(),
                "created_at": time.time(),
                "last_active": time.time()
            }
        else:
            # 更新会话活跃时间
            sessions[session_id]["last_active"] = time.time()
        
        # 获取用户消息
        user_message = data.get("message", "")
        if not user_message:
            return jsonify({"error": "消息不能为空"}), 400
        
        # 执行命令
        controller = sessions[session_id]["controller"]
        response = controller.execute_command(user_message)
        
        # 返回响应
        return jsonify({
            "session_id": session_id,
            "response": response
        })
    
    except Exception as e:
        app.logger.error(f"处理聊天请求时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/reset", methods=["POST"])
def reset_session():
    """重置会话"""
    try:
        data = request.json
        session_id = data.get("session_id")
        
        if not session_id or session_id not in sessions:
            return jsonify({"error": "会话不存在"}), 404
        
        # 重置记忆
        controller = sessions[session_id]["controller"]
        controller.reset_memory()
        
        return jsonify({
            "session_id": session_id,
            "message": "会话已重置"
        })
    
    except Exception as e:
        app.logger.error(f"重置会话时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/sessions", methods=["GET"])
def list_sessions():
    """列出所有活跃会话"""
    active_sessions = []
    
    for session_id, session_data in sessions.items():
        active_sessions.append({
            "session_id": session_id,
            "created_at": session_data["created_at"],
            "last_active": session_data["last_active"]
        })
    
    return jsonify({"sessions": active_sessions})

# 定期清理过期会话
def cleanup_sessions():
    """清理过期会话"""
    with cleanup_lock:
        current_time = time.time()
        expired_sessions = []
        
        for session_id, session_data in sessions.items():
            if current_time - session_data["last_active"] > HISTORY_TIMEOUT:
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            del sessions[session_id]
            app.logger.info(f"已清理过期会话: {session_id}")

# 启动清理线程
def start_cleanup_thread():
    """启动会话清理线程"""
    def cleanup_worker():
        while True:
            cleanup_sessions()
            time.sleep(300)  # 每5分钟清理一次
    
    cleanup_thread = threading.Thread(target=cleanup_worker)
    cleanup_thread.daemon = True
    cleanup_thread.start()

# 应用启动时初始化清理线程
with app.app_context():
    # 在应用上下文中启动清理线程
    start_cleanup_thread()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001) 