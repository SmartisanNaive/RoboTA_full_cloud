import requests
from generate_protocol import generate_protocol

# Server URL
BASE_URL = "http://localhost:5000"  # Replace with your server's URL

def upload_protocol(protocol_file):
    """上传协议文件并返回 protocol_id"""
    url = f"{BASE_URL}/upload-protocol/"
    files = {"file": open(protocol_file, "rb")}
    try:
        response = requests.post(url, files=files)
        response.raise_for_status()  # Raise HTTPError for bad responses
        protocol_id = response.json()["Protocol ID"]
        print(f"Protocol uploaded successfully. Protocol ID: {protocol_id}")
        return protocol_id
    except requests.exceptions.RequestException as e:
        print(f"Error uploading protocol: {e}")
        return None

def run_protocol(protocol_id):
    """运行指定 protocol_id 的协议并返回 run_id"""
    url = f"{BASE_URL}/run-protocol/"
    data = {"protocol_id": protocol_id}
    try:
        response = requests.post(url, data=data)
        response.raise_for_status()
        response_data = response.json()
        if "error" in response_data:
            print(f"Server error: {response_data['error']}")
            return None
        run_id = response_data["Run ID"]
        print(f"Protocol run created successfully. Run ID: {run_id}")
        return run_id
    except requests.exceptions.RequestException as e:
        print(f"Error creating protocol run: {e}")
        return None

def execute_action(run_id):
    """执行指定 run_id 的操作"""
    url = f"{BASE_URL}/execute-action/"
    data = {"run_id": run_id}
    try:
        response = requests.post(url, data=data)
        response.raise_for_status()
        print(f"Action executed successfully. Response: {response.json()}")
    except requests.exceptions.RequestException as e:
        print(f"Error executing action: {e}")

def stop_runs():
    """停止所有正在运行的任务"""
    url = f"{BASE_URL}/stop-runs/"
    try:
        response = requests.post(url)
        response.raise_for_status()
        print("All runs stopped successfully")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error stopping runs: {e}")
        return False

if __name__ == "__main__":
    stop_runs()
    # 先生成协议文件
    generated_protocol = generate_protocol("protocol_template.py", "move_config.json", "generated_protocol.py")
    # 使用生成的协议文件
    protocol_id = upload_protocol(generated_protocol)
    if protocol_id:
        run_id = run_protocol(protocol_id)
        if run_id:
            execute_action(run_id)