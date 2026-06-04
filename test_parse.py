import requests
from bs4 import BeautifulSoup

url = "https://913.amdm.ru/akkordi/pornofilmy/174310/zvezdochka/"  # замените на реальную ссылку

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
resp = requests.get(url, headers=headers)
soup = BeautifulSoup(resp.text, 'html.parser')

# Ищем тег <pre> – в нём часто бывают аккорды
pre = soup.find('pre')
if pre:
    print(pre.get_text())
else:
    # Попробуем найти div с классом "b-chord"
    chord_div = soup.find('div', class_='b-chord')
    if chord_div:
        print(chord_div.get_text())
    else:
        print("Не найдено")
