import json
import requests
import os
import time
from bs4 import BeautifulSoup

def parse_amdm(url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')
        pre = soup.find('pre')
        if pre:
            return pre.get_text()
    except Exception as e:
        print(f"Ошибка: {e}")
    return None

def main():
    links_file = 'songs_links.txt'
    if not os.path.exists(links_file):
        print(f"Файл {links_file} не найден. Создайте его в формате: путь_к_json|ссылка")
        return

    with open(links_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split('|')
        if len(parts) != 2:
            print(f"Неверный формат: {line}")
            continue
        json_path, url = parts[0].strip(), parts[1].strip()

        if not os.path.exists(json_path):
            print(f"Файл {json_path} не найден, пропускаем")
            continue

        with open(json_path, 'r', encoding='utf-8') as jf:
            data = json.load(jf)

        # Пропускаем, если текст уже не заглушка
       # if data.get('text') and data['text'] != "Текст с аккордами появится позже":
        #    print(f"Песня {json_path} уже заполнена, пропускаем")
         #   continue

        print(f"Обработка: {url} -> {json_path}")
        chord_text = parse_amdm(url)
        if chord_text:
            data['text'] = chord_text
            with open(json_path, 'w', encoding='utf-8') as jf:
                json.dump(data, jf, ensure_ascii=False, indent=2)
            print(f"✅ Обновлено: {json_path}")
        else:
            print(f"❌ Не удалось получить аккорды для {url}")

        time.sleep(2)

if __name__ == '__main__':
    main()
