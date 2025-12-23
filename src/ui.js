import { getSeasons } from './api.js';

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
    animeSearchInput: document.getElementById('anime-search-input'),
    addAnimeBtn: document.getElementById('add-anime-btn'),
    addSeasonModal: document.getElementById('add-season-modal'),
    addAnimeModal: document.getElementById('add-anime-modal'),
    closeBtns: document.querySelectorAll('.close-btn'),
    seasonNameInput: document.getElementById('season-name-input'),
    saveSeasonBtn: document.getElementById('save-season-btn'),
    newAnimeSection: document.getElementById('new-anime-section'),
    animeNameInput: document.getElementById('anime-name-input'),
    editSeasonSection: document.getElementById('edit-season-section'),
    animeSeasonSelect: document.getElementById('anime-season-select'),
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
    errorToast: document.getElementById('error-toast'),
};

let errorTimeout;
export function showError(message) {
    clearTimeout(errorTimeout);
    DOM.errorToast.textContent = message;
    DOM.errorToast.classList.add('visible');

    errorTimeout = setTimeout(() => {
        DOM.errorToast.classList.remove('visible');
    }, 3000);
}

export const createSongEntryForm = (song = {}) => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'song-entry';

    const jpNameInput = document.createElement('input');
    jpNameInput.type = 'text';
    jpNameInput.className = 'song-jp-name';
    jpNameInput.placeholder = 'Nombre en Japonés';
    jpNameInput.value = song.jp_name || '';
    entryDiv.appendChild(jpNameInput);

    const romajiNameInput = document.createElement('input');
    romajiNameInput.type = 'text';
    romajiNameInput.className = 'song-romaji-name';
    romajiNameInput.placeholder = 'Nombre en Romanji';
    romajiNameInput.value = song.romaji_name || '';
    entryDiv.appendChild(romajiNameInput);

    const youtubeUrlInput = document.createElement('input');
    youtubeUrlInput.type = 'url';
    youtubeUrlInput.className = 'song-youtube-url';
    youtubeUrlInput.placeholder = 'URL de YouTube';
    youtubeUrlInput.value = song.youtube_url || '';
    entryDiv.appendChild(youtubeUrlInput);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-entry-btn';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => {
        entryDiv.remove();
    });
    entryDiv.appendChild(deleteBtn);

    return entryDiv;
};

export function addSongEntry(listElement) {
    listElement.appendChild(createSongEntryForm());
}

export function getSongEntries(listElement) {
    return Array.from(listElement.querySelectorAll('.song-entry')).map(entry => ({
        jp_name: entry.querySelector('.song-jp-name').value.trim(),
        romaji_name: entry.querySelector('.song-romaji-name').value.trim(),
        youtube_url: entry.querySelector('.song-youtube-url').value.trim(),
    })).filter(s => s.jp_name || s.romaji_name || s.youtube_url);
}

export function toggleAccordion(card) {
    const isExpanded = card.classList.contains('expanded');
    // Close all other cards
    DOM.animeListContainer.querySelectorAll('.anime-card').forEach(c => {
        c.classList.remove('expanded');
        c.querySelector('.anime-details').style.maxHeight = null;
    });
    // If the clicked card was not already open, open it
    if (!isExpanded) {
        card.classList.add('expanded');
        const details = card.querySelector('.anime-details');
        details.style.maxHeight = details.scrollHeight + 'px';
    }
}

const createAnimeCard = (anime, index) => {
    const animeCard = document.createElement('div');
    animeCard.className = 'anime-card';
    animeCard.dataset.animeId = anime.id;

    // Staggered animation
    animeCard.style.animation = `card-fade-in 0.5s ease-out ${index * 0.05}s forwards`;
    animeCard.style.opacity = 0; // Start hidden

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
                animesOfTheDay.forEach((anime, index) => animeList.appendChild(createAnimeCard(anime, index)));
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
        animes.forEach((anime, index) => animeList.appendChild(createAnimeCard(anime, index)));
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
    modal.style.display = 'flex';
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
        // Reset on close
        prepareNewAnimeModal();
    }
};

export function prepareNewAnimeModal() {
    DOM.addAnimeModal.classList.remove('edit-mode');
    DOM.addAnimeModal.querySelector('h2').textContent = 'Agregar Anime';
    DOM.continuationSection.style.display = 'none';
    DOM.editSeasonSection.style.display = 'none';
    DOM.newAnimeSection.style.display = 'block';
    DOM.openingsList.parentElement.style.display = 'block';
    DOM.endingsList.parentElement.style.display = 'block';
    DOM.commentsInput.style.display = 'block';
    DOM.animeNameInput.readOnly = false;
    DOM.commentsInput.readOnly = false;
    DOM.animeNameInput.title = '';
    DOM.commentsInput.title = '';

    // Clear fields
    DOM.animeNameInput.value = '';
    DOM.dayOfWeekInput.value = 'Lunes';
    DOM.commentsInput.value = '';
    DOM.openingsList.innerHTML = '';
    DOM.endingsList.innerHTML = '';
    DOM.continuationSelect.innerHTML = '<option value="">Selecciona un anime...</option>';
}

export function prepareContinuationModal(animes) {
    DOM.addAnimeModal.querySelector('h2').textContent = 'Añadir Continuación';
    DOM.continuationSection.style.display = 'block';
    DOM.newAnimeSection.style.display = 'none';
    DOM.openingsList.parentElement.style.display = 'none';
    DOM.endingsList.parentElement.style.display = 'none';
    DOM.commentsInput.style.display = 'none';

    const select = DOM.continuationSelect;
    select.innerHTML = '<option value="">Selecciona un anime...</option>';
    animes.forEach(anime => {
        const option = document.createElement('option');
        option.value = anime.id;
        option.textContent = anime.name;
        select.appendChild(option);
    });
}

export async function prepareEditAnimeModal(anime) {
    prepareNewAnimeModal(); // Start with a clean slate
    DOM.addAnimeModal.classList.add('edit-mode');

    DOM.addAnimeModal.querySelector('h2').textContent = 'Editar Anime';

    // --- Season Selector ---
    DOM.editSeasonSection.style.display = 'block';
    const seasons = await getSeasons();
    const select = DOM.animeSeasonSelect;
    select.innerHTML = '';
    seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season.id;
        option.textContent = season.name;
        select.appendChild(option);
    });
    select.value = anime.season_id;
    // --- End Season Selector ---

    // Ensure song sections are visible
    DOM.openingsList.parentElement.style.display = 'block';
    DOM.endingsList.parentElement.style.display = 'block';

    DOM.animeNameInput.value = anime.name;
    DOM.dayOfWeekInput.value = anime.day_of_week;
    DOM.commentsInput.value = anime.comments || '';

    const isContinuation = !!anime.main_anime_id;
    DOM.animeNameInput.readOnly = isContinuation;
    DOM.commentsInput.readOnly = isContinuation;
    if (isContinuation) {
        DOM.animeNameInput.title = 'El nombre se hereda del anime original y no se puede cambiar aquí.';
        DOM.commentsInput.title = 'Los comentarios se heredan del anime original y no se pueden cambiar aquí.';
        // Also disable season change for continuations as it might be confusing
        select.disabled = true;
        DOM.editSeasonSection.title = 'La temporada de una continuación no se puede cambiar directamente.';
    } else {
        select.disabled = false;
        DOM.editSeasonSection.title = '';
    }

    DOM.openingsList.innerHTML = '';
    if (anime.openings) {
        anime.openings.forEach(op => {
            DOM.openingsList.appendChild(createSongEntryForm(op));
        });
    }

    DOM.endingsList.innerHTML = '';
    if (anime.endings) {
        anime.endings.forEach(en => {
            DOM.endingsList.appendChild(createSongEntryForm(en));
        });
    }
}

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
