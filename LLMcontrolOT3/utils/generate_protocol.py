import json
import os

def read_json_config(json_file):
    """读取 JSON 配置文件"""
    with open(json_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_protocol(template_file, json_file, output_file):
    """生成包含 JSON 数据的协议文件"""
    # 读取 JSON 配置
    config_data = read_json_config(json_file)
    
    # 读取协议模板
    with open(template_file, 'r', encoding='utf-8') as f:
        template_content = f.read()
    
    # 在协议开头插入 JSON 数据
    json_str = json.dumps(config_data, indent=4)
    protocol_content = f"""from opentrons import protocol_api

# JSON Configuration
_all_values = {json_str}

{template_content}
"""
    
    # 写入新的协议文件
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(protocol_content)
    
    return output_file

if __name__ == "__main__":
    # 导入配置
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from config.settings import TEMPLATE_DIR, CONFIG_DIR, EXAMPLES_DIR
    
    template_file = os.path.join(TEMPLATE_DIR, "protocol_template.py")
    json_file = os.path.join(CONFIG_DIR, "move_config.json")
    output_file = os.path.join(EXAMPLES_DIR, "generated_protocol.py")
    
    generated_file = generate_protocol(template_file, json_file, output_file)
    print(f"Generated protocol file: {generated_file}")