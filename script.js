const CATEGORIES = ["rock", "pop", "bard"];

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
    const fileUrl = `https://raw.githubusercontent.com/${getRepoName()}/main/songs/${category}/${songName}.json`;
    try {
        const response = await fetch(fileUrl);
        const songData = await response.json();
        document.getElementById("songTitle").textContent = songData.title || songName;
        document.getElementById("songArtist").textContent = songData.artist || "";
        let text = songData.text || "Текст не задан";
        let formatted = text.replace(/\[([^\]]+)\]/g, '<span class="chord">$1</span>');
        document.getElementById("songText").innerHTML = formatted.replace(/\n/g, '<br>');
        showView("song");
    } catch (err) {
        document.getElementById("songText").innerHTML = "Ошибка загрузки песни";
        console.error(err);
    }
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
    if (window.location.hostname === "localhost") {
        return "TaiZeDTich/guitar-songs"; // Замените!
    }
    const parts = window.location.pathname.split("/");
    if (parts.length >= 2) {
        return `${parts[1]}/${parts[2]}`;
    }
    // Если не определилось, спросим
    return prompt("Введите имя репозитория в формате логин/название", "ваш_логин/guitar-songs");
}

let currentCategory = null;
let currentSong = null;
