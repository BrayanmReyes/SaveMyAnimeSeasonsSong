export const pencilIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
export const trashIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
export const youtubeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`;
export const linkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="continuation-icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>`;

export const DOM = {
    mainTitle: document.querySelector('header h1'),
    seasonSelector: document.getElementById('season-selector'),
    seasonManager: document.getElementById('season-manager'),
    addSeasonBtn: document.getElementById('add-season-btn'),
    addContinuationBtn: document.getElementById('add-continuation-btn'),
    editSeasonBtn: document.getElementById('edit-season-btn'),
    deleteSeasonBtn: document.getElementById('delete-season-btn'),
    animeListContainer: document.getElementById('anime-list-container'),
    artistViewContainer: document.getElementById('artist-view-container'),
    artistsBtn: document.getElementById('artists-btn'),
    animeSearchInput: document.getElementById('anime-search-input'),
    addAnimeBtn: document.getElementById('add-anime-btn'),
    addSeasonModal: document.getElementById('add-season-modal'),
    addAnimeModal: document.getElementById('add-anime-modal'),
    closeBtns: document.querySelectorAll('.close-btn'),
    seasonNameInput: document.getElementById('season-name-input'),
    saveSeasonBtn: document.getElementById('save-season-btn'),
    newAnimeSection: document.getElementById('new-anime-section'),
    animeNameInput: document.getElementById('anime-name-input'),
    continuationSection: document.getElementById('continuation-section'),
    continuationSelect: document.getElementById('continuation-select'),
    dayOfWeekInput: document.getElementById('day-of-week-input'),
    commentsInput: document.getElementById('comments-input'),
    openingsList: document.getElementById('openings-list'),
    addOpeningBtn: document.getElementById('add-opening-btn'),
    endingsList: document.getElementById('endings-list'),
    addEndingBtn: document.getElementById('add-ending-btn'),
    saveAnimeBtn: document.getElementById('save-anime-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIconSun: document.getElementById('theme-icon-sun'),
    themeIconMoon: document.getElementById('theme-icon-moon'),
    loginBtn: document.getElementById('login-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    loginModal: document.getElementById('login-modal'),
    passwordInput: document.getElementById('password-input'),
    loginSubmitBtn: document.getElementById('login-submit-btn'),
    videoModal: document.getElementById('video-modal'),
    youtubeIframe: document.getElementById('youtube-iframe'),
    openInYtLink: document.getElementById('open-in-yt-link'),
    scrollToTopBtn: document.getElementById('scroll-to-top-btn'),
};

export const createSongEntryForm = (song = {}) => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'song-entry';
    entryDiv.innerHTML = `
        <input type="text" class="song-jp-name" placeholder="Nombre en Japonés" value="${song.jpName || ''}">
        <input type="text" class="song-romaji-name" placeholder="Nombre en Romanji" value="${song.romajiName || ''}">
        <input type="url" class="song-youtube-url" placeholder="URL de YouTube" value="${song.youtubeUrl || ''}">
        <button type="button" class="delete-entry-btn">Eliminar</button>
    `;
    entryDiv.querySelector('.delete-entry-btn').addEventListener('click', () => {
        entryDiv.remove();
    });
    return entryDiv;
};

const createAnimeCard = (anime) => {
    const animeCard = document.createElement('div');
    animeCard.className = 'anime-card';
    animeCard.dataset.animeId = anime.id;
    const openingsHTML = anime.openings && anime.openings.length > 0
        ? anime.openings.map((op, index) => `<li class="song-item"><strong class="song-title">OP ${index + 1}:</strong><div class="song-details"><span><strong>JP:</strong> ${op.jp_name || 'N/A'}</span><span><strong>Romaji:</strong> ${op.romaji_name || 'N/A'}</span>${op.youtube_url ? `<a href="${op.youtube_url}" target="_blank" title="${op.youtube_url}" class="youtube-link">${youtubeIcon}</a>` : ''}</div></li>`).join('')
        : '<li>N/A</li>';
    const endingsHTML = anime.endings && anime.endings.length > 0
        ? anime.endings.map((en, index) => `<li class="song-item"><strong class="song-title">ED ${index + 1}:</strong><div class="song-details"><span><strong>JP:</strong> ${en.jp_name || 'N/A'}</span><span><strong>Romaji:</strong> ${en.romaji_name || 'N/A'}</span>${en.youtube_url ? `<a href="${en.youtube_url}" target="_blank" title="${en.youtube_url}" class="youtube-link">${youtubeIcon}</a>` : ''}</div></li>`).join('')
        : '<li>N/A</li>';
    const continuationIcon = anime.main_anime_id ? linkIcon : '';
    animeCard.innerHTML = `
        <div class="anime-card-header">
            <h4>${continuationIcon}${anime.name}</h4>
            <span class="accordion-icon"></span>
        </div>
        <div class="anime-details">
            <p><strong>Openings:</strong></p>
            <ul>${openingsHTML}</ul>
            <p><strong>Endings:</strong></p>
            <ul>${endingsHTML}</ul>
            <p><strong>Comentarios:</strong> ${anime.comments || 'N/A'}</p>
            <div class="anime-actions">
                <button class="edit-anime-btn" title="Editar">${pencilIcon}</button>
                <button class="delete-anime-btn" title="Eliminar">${trashIcon}</button>
            </div>
        </div>
    `;
    return animeCard;
};

export const renderAnimes = (animes, options = {}) => {
    const { title = null, groupByDay = true } = options;
    DOM.animeListContainer.innerHTML = '';

    if (title) {
        const titleEl = document.createElement('h2');
        titleEl.className = 'view-title';
        titleEl.textContent = title;
        DOM.animeListContainer.appendChild(titleEl);
    }

    if (!animes || animes.length === 0) {
        DOM.animeListContainer.innerHTML += '<p>No se encontraron animes.</p>';
        return;
    }

    if (groupByDay) {
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Especial'];
        let animesFound = false;
        days.forEach(day => {
            const animesOfTheDay = animes.filter(a => a.day_of_week === day);
            if (animesOfTheDay.length > 0) {
                animesFound = true;
                const daySection = document.createElement('section');
                daySection.className = 'day-section';
                daySection.innerHTML = `<h3>${day}</h3>`;
                const animeList = document.createElement('div');
                animeList.className = 'anime-day-list';
                animesOfTheDay.forEach(anime => animeList.appendChild(createAnimeCard(anime)));
                daySection.appendChild(animeList);
                DOM.animeListContainer.appendChild(daySection);
            }
        });
        if (!animesFound) {
            DOM.animeListContainer.innerHTML = '<p>No hay animes en esta temporada. ¡Añade uno con el botón `+`!</p>';
        }
    } else {
        // Render as a flat list
        const animeList = document.createElement('div');
        animeList.className = 'anime-day-list'; // Re-use class for consistent grid styling
        animes.forEach(anime => animeList.appendChild(createAnimeCard(anime)));
        DOM.animeListContainer.appendChild(animeList);
    }
};

export const renderSeasons = (seasons, currentSeasonId) => {
    DOM.seasonSelector.innerHTML = '';
    if (seasons.length === 0) {
        DOM.seasonSelector.innerHTML = '<option>No hay temporadas</option>';
    } else {
        seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season.id;
            option.textContent = season.name;
            DOM.seasonSelector.appendChild(option);
        });
        if (currentSeasonId) {
            DOM.seasonSelector.value = currentSeasonId;
        }
    }
};

export const openModal = (modal) => {
    modal.style.display = 'block';
};

export const openVideoModal = (url) => {
    const videoIdMatch = url.match(/(?:v=|\/embed\/|\.be\/)([\w-]{11})/);
    if (!videoIdMatch) {
        console.error("Invalid YouTube URL");
        return;
    }
    const videoId = videoIdMatch[1];
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    DOM.youtubeIframe.src = embedUrl;
    DOM.openInYtLink.href = `https://www.youtube.com/watch?v=${videoId}`;
    openModal(DOM.videoModal);
};

export const closeModal = (modal) => {
    modal.style.display = 'none';
    if (modal === DOM.videoModal) {
        DOM.youtubeIframe.src = ''; // Stop video playback
    }
    // Also reset anime form on close
    if (modal === DOM.addAnimeModal) {
        DOM.addAnimeModal.querySelector('h2').textContent = 'Agregar Anime';
        DOM.animeNameInput.value = '';
        DOM.dayOfWeekInput.value = 'Lunes';
        DOM.commentsInput.value = '';
        DOM.openingsList.innerHTML = '';
        DOM.endingsList.innerHTML = '';
    }
};

export const updateThemeIcons = (theme) => {
    DOM.themeIconSun.style.display = theme === 'dark' ? 'none' : 'block';
    DOM.themeIconMoon.style.display = theme === 'dark' ? 'block' : 'none';
};

export const enterAdminMode = () => {
    document.body.classList.remove('readonly-mode');
    DOM.loginBtn.style.display = 'none';
    DOM.logoutBtn.style.display = 'inline-block';
};

export const exitAdminMode = () => {
    document.body.classList.add('readonly-mode');
    DOM.loginBtn.style.display = 'inline-block';
    DOM.logoutBtn.style.display = 'none';
};
