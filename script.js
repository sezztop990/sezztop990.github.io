document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. АНИМАЦИЯ И ЗВУК
    // ==========================================
    const enterScreen = document.getElementById("enter-screen");
    const mainContent = document.getElementById("main-content");
    const bgMusic = document.getElementById("bg-music");
    const audioToggle = document.getElementById("audio-toggle");
    const audioIcon = audioToggle.querySelector("i");

    enterScreen.addEventListener("click", () => {
        enterScreen.style.opacity = "0"; 
        setTimeout(() => {
            enterScreen.classList.add("hidden");
            mainContent.classList.remove("hidden");
            setTimeout(() => { mainContent.classList.add("visible"); }, 100);
            bgMusic.volume = 0.3; 
            bgMusic.play();
        }, 500); 
    });

    audioToggle.addEventListener("click", () => {
        if (bgMusic.paused) {
            bgMusic.play();
            audioIcon.classList.remove("fa-volume-xmark");
            audioIcon.classList.add("fa-volume-high");
        } else {
            bgMusic.pause();
            audioIcon.classList.remove("fa-volume-high");
            audioIcon.classList.add("fa-volume-xmark");
        }
    });

    // ==========================================
    // 2. LANYARD API (ДИНАМИЧЕСКИЙ СТАТУС)
    // ==========================================
    const USER_ID = '1018792249678647376'; 

    async function fetchDiscordStatus() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`);
            const data = await response.json();

            if (data.success) {
                const d = data.data;

                // Базовый статус (Кружок, Имя, Аватарка)
                document.getElementById('dc-status-indicator').className = `status-indicator ${d.discord_status}`;
                document.getElementById('dc-username').innerText = d.discord_user.display_name || d.discord_user.username;

                if (d.discord_user.avatar) {
                    document.getElementById('dc-avatar').src = `https://cdn.discordapp.com/avatars/${d.discord_user.id}/${d.discord_user.avatar}.png?size=256`;
                }

                // Переменные для текста и иконки
                const activityEl = document.getElementById('dc-activity');
                const detailsEl = document.getElementById('dc-details');
                const iconContainer = document.getElementById('dc-icon-container');
                const iconEl = document.getElementById('dc-activity-icon');

                iconContainer.style.display = 'none'; // Прячем картинку по умолчанию

                // 1. ПРИОРИТЕТ: SPOTIFY
                if (d.spotify) {
                    activityEl.innerHTML = `Слушает <b>Spotify</b>`;
                    detailsEl.innerHTML = `${d.spotify.song}<br><span style="color: #aaa;">${d.spotify.artist}</span>`;
                    iconEl.src = d.spotify.album_art_url;
                    iconContainer.style.display = 'block';
                } 
                // 2. ПРИОРИТЕТ: ИГРЫ И АКТИВНОСТЬ
                else if (d.activities && d.activities.length > 0) {
                    const game = d.activities.find(a => a.type === 0);
                    const customStatus = d.activities.find(a => a.type === 4);

                    if (game) {
                        activityEl.innerHTML = `Играет в <b>${game.name}</b>`;
                        
                        let gameDetails = [];
                        if (game.details) gameDetails.push(game.details);
                        if (game.state) gameDetails.push(game.state);
                        detailsEl.innerHTML = gameDetails.join('<br>');

                        // Ищем картинку игры
                        if (game.assets && game.assets.large_image) {
                            let imageUrl = game.assets.large_image.startsWith('mp:') 
                                ? `https://media.discordapp.net/${game.assets.large_image.replace('mp:', '')}` 
                                : `https://cdn.discordapp.com/app-assets/${game.application_id}/${game.assets.large_image}.png`;
                            
                            iconEl.src = imageUrl;
                            iconContainer.style.display = 'block';
                        }
                    } else if (customStatus) {
                        activityEl.innerText = customStatus.state || 'В сети';
                        detailsEl.innerText = '';
                    } else {
                        activityEl.innerText = 'В сети';
                        detailsEl.innerText = '';
                    }
                } 
                // 3. ПРИОРИТЕТ: НИЧЕГО НЕ ДЕЛАЕТ
                else {
                    activityEl.innerText = d.discord_status === 'offline' ? 'Не в сети' : 'В сети';
                    detailsEl.innerText = '';
                }
            }
        } catch (error) {
            console.error("Ошибка Lanyard:", error);
        }
    }

    // Запускаем сразу и обновляем каждые 5 секунд
    fetchDiscordStatus();
    setInterval(fetchDiscordStatus, 5000); 
});