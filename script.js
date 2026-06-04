const CATEGORIES = [
    "Группа Порнофильмы",
    "Группа Сектор Газа",
    "Разные песни",
    "Группа Звери",
    "Группа Король и Шут",
    "Группа Валентин Стрыкало",
    "Группа Макс Корж",
    "Походные",
    "РСО"
];

document.addEventListener("DOMContentLoaded", () => {
    renderCategories();
    document.getElementById("backBtn").addEventListener("click", goBack);
});

function renderCategories() {
    const container = document.getElementById("categoriesList");
    container.innerHTML = "";
    for (let cat of CATEGORIES) {
        const div = document.createElement("div");
        div.className = "category-item";
        div.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        div.onclick = () => loadCategory(cat);
        container.appendChild(div);
    }
    showView("categories");
}

async function loadCategory(category) {
    currentCategory = category;
    document.getElementById("categoryTitle").textContent = category.charAt(0).toUpperCase() + category.slice(1);
    const songsListDiv = document.getElementById("songsList");
    songsListDiv.innerHTML = "<div>Загрузка...</div>";
    
    const apiUrl = `https://api.github.com/repos/${getRepoName()}/contents/songs/${category}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Нет песен");
        const files = await response.json();
        const jsonFiles = files.filter(f => f.name.endsWith(".json"));
        if (jsonFiles.length === 0) {
            songsListDiv.innerHTML = "<div>Нет песен. Добавьте .json в папку songs/"+category+"</div>";
        } else {
            songsListDiv.innerHTML = "";
            for (let file of jsonFiles) {
                const songName = file.name.replace(".json", "");
                const div = document.createElement("div");
                div.className = "song-item";
                div.textContent = songName.replace(/_/g, " ");
                div.onclick = () => loadSong(category, songName);
                songsListDiv.appendChild(div);
            }
        }
        showView("songs");
    } catch (err) {
        songsListDiv.innerHTML = "<div>Ошибка. Убедитесь, что папка songs/"+category+" существует.</div>";
        console.error(err);
    }
}

async function loadSong(category, songName) {
    const fileUrl = `https://raw.githubusercontent.com/TaiZeDTich/guitar-songs/main/songs/${category}/${songName}.json`;
    try {
        const response = await fetch(fileUrl);
        const songData = await response.json();
        document.getElementById("songTitle").textContent = songData.title || songName;
        document.getElementById("songArtist").textContent = songData.artist || "";

        let rawText = songData.text || "Текст не задан";
        // Разбиваем текст на строки
        let lines = rawText.split('\n');

        let formattedHtml = '';
        for (let line of lines) {
            // Проверяем, содержит ли строка аккорды (любые символы в квадратных скобках)
            if (line.match(/\[.*?\]/)) {
                // Строка с аккордами — обрабатываем её отдельно
                let chordsHtml = line.replace(/\[(.*?)\]/g, '<span class="chord">$1</span>');
                formattedHtml += `<div class="song-line chords-line">${chordsHtml}</div>`;
            } else if (line.trim() !== "") {
                // Обычная текстовая строка
                formattedHtml += `<div class="song-line lyrics-line">${escapeHtml(line)}</div>`;
            } else {
                // Пустая строка — просто добавляем <br>
                formattedHtml += `<br>`;
            }
        }

        // Вставляем результат на страницу
        document.getElementById("songText").innerHTML = formattedHtml;
        showView("song");
    } catch (err) {
        document.getElementById("songText").innerHTML = "Ошибка загрузки песни";
        console.error(err);
    }
}

// Вспомогательная функция для экранирования спецсимволов, чтобы твой код был в безопасности
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function goBack() {
    if (currentSong) {
        currentSong = null;
        loadCategory(currentCategory);
    } else if (currentCategory) {
        currentCategory = null;
        renderCategories();
    }
}

function showView(viewName) {
    document.getElementById("categoriesView").classList.add("hidden");
    document.getElementById("songsView").classList.add("hidden");
    document.getElementById("songView").classList.add("hidden");
    document.getElementById(`${viewName}View`).classList.remove("hidden");
    
    const backBtn = document.getElementById("backBtn");
    if (viewName === "categories") {
        backBtn.classList.add("hidden");
    } else {
        backBtn.classList.remove("hidden");
    }
}

function getRepoName() {
    return "TaiZeDTich/guitar-songs";
}

let currentCategory = null;
let currentSong = null;
