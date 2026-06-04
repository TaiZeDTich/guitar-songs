import json
import requests
import sys
import os
from bs4 import BeautifulSoup

def parse_amdm(url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')
        pre = soup.find('pre')
        if pre:
            # Получаем текст как есть (с символами перевода строки)
            raw_text = pre.get_text()
            return raw_text
    except Exception as e:
        print(f"Ошибка: {e}")
    return None

if len(sys.argv) != 3:
    print("Использование: python add_song.py <путь_к_json> <ссылка_amdm>")
    sys.exit(1)

json_path = sys.argv[1]
url = sys.argv[2]

if not os.path.exists(json_path):
    print(f"Файл {json_path} не найден")
    sys.exit(1)

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

text = parse_amdm(url)
if text:
    data['text'] = text
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ Песня обновлена: {json_path}")
else:
    print("❌ Не удалось получить аккорды")