// Lógica para Anime Tracker

document.addEventListener('DOMContentLoaded', () => {
    const pencilIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    const trashIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const seasonSelector = document.getElementById('season-selector');
    const addSeasonBtn = document.getElementById('add-season-btn');
    const deleteSeasonBtn = document.getElementById('delete-season-btn');
    const animeListContainer = document.getElementById('anime-list-container');
    const addAnimeBtn = document.getElementById('add-anime-btn');

    // Modales
    const addSeasonModal = document.getElementById('add-season-modal');
    const addAnimeModal = document.getElementById('add-anime-modal');
    const closeBtns = document.querySelectorAll('.close-btn');

    // Formularios de modales
    const seasonNameInput = document.getElementById('season-name-input');
    const saveSeasonBtn = document.getElementById('save-season-btn');
    const animeNameInput = document.getElementById('anime-name-input');
    const dayOfWeekInput = document.getElementById('day-of-week-input');
    const commentsInput = document.getElementById('comments-input');
    const openingsList = document.getElementById('openings-list');
    const addOpeningBtn = document.getElementById('add-opening-btn');
    const endingsList = document.getElementById('endings-list');
    const addEndingBtn = document.getElementById('add-ending-btn');
    const saveAnimeBtn = document.getElementById('save-anime-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');

    let currentSeasonId = null;
    let editingAnimeId = null;

    // --- GESTIÓN DE DATOS ---
    const getAppData = () => {
        const data = localStorage.getItem('animeTrackerData');
        if (data) {
            return JSON.parse(data);
        }
        // Datos iniciales si no hay nada guardado
        return {
            seasons: [],
            nextSeasonId: 1,
            nextAnimeId: 1,
        };
    };

    const saveAppData = (data) => {
        localStorage.setItem('animeTrackerData', JSON.stringify(data));
    };

    // --- LÓGICA DE FORMULARIO DINÁMICO ---
    const createSongEntryForm = (song = {}) => {
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

    // --- RENDERIZADO ---
    const renderAnimes = (seasonId) => {
        const data = getAppData();
        const season = data.seasons.find(s => s.id === seasonId);
        animeListContainer.innerHTML = ''; // Limpiar la lista actual

        if (!season) {
            animeListContainer.innerHTML = '<p>Selecciona una temporada o crea una nueva para empezar.</p>';
            return;
        }

        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Especial'];
        let animesFound = false;
        days.forEach(day => {
            const animesOfTheDay = season.animes.filter(a => a.day_of_week === day);
            if (animesOfTheDay.length > 0) {
                animesFound = true;
                const daySection = document.createElement('section');
                daySection.className = 'day-section';
                daySection.innerHTML = `<h3>${day}</h3>`;

                const animeList = document.createElement('div');
                animeList.className = 'anime-day-list';

                animesOfTheDay.forEach(anime => {
                    const animeCard = document.createElement('div');
                    animeCard.className = 'anime-card';
                    animeCard.dataset.animeId = anime.id;

                    const openingsHTML = anime.openings && anime.openings.length > 0
                        ? anime.openings.map((op, index) => `
                            <li class="song-item">
                                <strong class="song-title">OP ${index + 1}:</strong>
                                <div class="song-details">
                                    <span><strong>JP:</strong> ${op.jpName || 'N/A'}</span>
                                    <span><strong>Romaji:</strong> ${op.romajiName || 'N/A'}</span>
                                    ${op.youtubeUrl ? `<a href="${op.youtubeUrl}" target="_blank" title="${op.youtubeUrl}">YouTube</a>` : ''}
                                </div>
                            </li>`).join('')
                        : '<li>N/A</li>';

                    const endingsHTML = anime.endings && anime.endings.length > 0
                        ? anime.endings.map((en, index) => `
                            <li class="song-item">
                                <strong class="song-title">ED ${index + 1}:</strong>
                                <div class="song-details">
                                    <span><strong>JP:</strong> ${en.jpName || 'N/A'}</span>
                                    <span><strong>Romaji:</strong> ${en.romajiName || 'N/A'}</span>
                                    ${en.youtubeUrl ? `<a href="${en.youtubeUrl}" target="_blank" title="${en.youtubeUrl}">YouTube</a>` : ''}
                                </div>
                            </li>`).join('')
                        : '<li>N/A</li>';

                    animeCard.innerHTML = `
                        <h4>${anime.name}</h4>
                        <div class="anime-details">
                            <p><strong>Openings:</strong></p>
                            <ul>${openingsHTML}</ul>
                            <p><strong>Endings:</strong></p>
                            <ul>${endingsHTML}</ul>
                            <p><strong>Comentarios:</strong> ${anime.comments || 'N/A'}</p>
                        </div>
                        <div class="anime-actions">
                            <button class="edit-anime-btn" title="Editar">${pencilIcon}</button>
                            <button class="delete-anime-btn" title="Eliminar">${trashIcon}</button>
                        </div>
                    `;
                    animeList.appendChild(animeCard);
                });

                daySection.appendChild(animeList);
                animeListContainer.appendChild(daySection);
            }
        });

        if (!animesFound) {
            animeListContainer.innerHTML = '<p>No hay animes en esta temporada. ¡Añade uno con el botón `+`!</p>';
        }
    };

    const renderSeasons = () => {
        const data = getAppData();
        const lastSelectedSeason = localStorage.getItem('currentSeasonId');

        seasonSelector.innerHTML = '';
        if (data.seasons.length === 0) {
            seasonSelector.innerHTML = '<option>No hay temporadas</option>';
        }
        data.seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season.id;
            option.textContent = season.name;
            seasonSelector.appendChild(option);
        });

        if (lastSelectedSeason && data.seasons.some(s => s.id == lastSelectedSeason)) {
            seasonSelector.value = lastSelectedSeason;
            currentSeasonId = parseInt(lastSelectedSeason);
        } else if (data.seasons.length > 0) {
            currentSeasonId = data.seasons[0].id;
            seasonSelector.value = currentSeasonId;
        } else {
            currentSeasonId = null;
        }

        if(currentSeasonId) {
            localStorage.setItem('currentSeasonId', currentSeasonId);
        } else {
            localStorage.removeItem('currentSeasonId');
        }

        renderAnimes(currentSeasonId);
    };

    // --- LÓGICA DE MODALES ---
    const openModal = (modal) => modal.style.display = 'block';
    const closeModal = (modal) => {
        modal.style.display = 'none';
        // Resetear formularios al cerrar
        if(modal === addAnimeModal) {
            editingAnimeId = null;
            addAnimeModal.querySelector('h2').textContent = 'Agregar Anime';
            animeNameInput.value = '';
            dayOfWeekInput.value = 'Lunes';
            openingsList.innerHTML = '';
            endingsList.innerHTML = '';
            commentsInput.value = '';
        }
    };

    // --- LÓGICA DE TEMA ---
    const updateThemeIcons = (theme) => {
        themeIconSun.style.display = theme === 'dark' ? 'none' : 'block';
        themeIconMoon.style.display = theme === 'dark' ? 'block' : 'none';
    };

    // --- INICIALIZACIÓN ---
    const init = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.className = savedTheme === 'dark' ? 'dark-mode' : '';
        updateThemeIcons(savedTheme);
        renderSeasons();
    };

    init(); // Cargar todo al iniciar

    // --- MANEJO DE EVENTOS ---
    themeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        const newTheme = isDarkMode ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    });

    // Cambiar de temporada
    seasonSelector.addEventListener('change', (e) => {
        const newSeasonId = parseInt(e.target.value);
        if(!isNaN(newSeasonId)) {
            currentSeasonId = newSeasonId;
            localStorage.setItem('currentSeasonId', currentSeasonId);
            renderAnimes(currentSeasonId);
        }
    });

    // Abrir modales
    addSeasonBtn.addEventListener('click', () => openModal(addSeasonModal));
    addAnimeBtn.addEventListener('click', () => {
        if(currentSeasonId) {
            openModal(addAnimeModal);
        } else {
            alert('Por favor, crea y selecciona una temporada primero.');
        }
    });

    // Cerrar modales
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal'));
        });
    });
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    addOpeningBtn.addEventListener('click', () => {
        openingsList.appendChild(createSongEntryForm());
    });

    addEndingBtn.addEventListener('click', () => {
        endingsList.appendChild(createSongEntryForm());
    });

    // Guardar temporada
    saveSeasonBtn.addEventListener('click', () => {
        const name = seasonNameInput.value.trim();
        if (name) {
            const data = getAppData();
            const newSeason = {
                id: data.nextSeasonId++,
                name: name,
                animes: [],
            };
            data.seasons.push(newSeason);
            currentSeasonId = newSeason.id; // Cambiar a la nueva temporada
            saveAppData(data);
            renderSeasons();
            closeModal(addSeasonModal);
            seasonNameInput.value = '';
        } else {
            alert('El nombre de la temporada no puede estar vacío.');
        }
    });

    // Eliminar temporada
    deleteSeasonBtn.addEventListener('click', () => {
        if (!currentSeasonId) {
            alert('No hay ninguna temporada seleccionada para eliminar.');
            return;
        }
        if (confirm('¿Estás seguro de que quieres eliminar la temporada seleccionada y todos sus animes?')) {
            const data = getAppData();
            data.seasons = data.seasons.filter(s => s.id !== currentSeasonId);
            saveAppData(data);
            localStorage.removeItem('currentSeasonId');
            currentSeasonId = null; // Desseleccionar
            renderSeasons();
        }
    });

    // Guardar Anime (Crear y Actualizar)
    saveAnimeBtn.addEventListener('click', () => {
        const name = animeNameInput.value.trim();
        const day = dayOfWeekInput.value;
        const comments = commentsInput.value.trim();

        if (!name) {
            alert('El nombre del anime no puede estar vacío.');
            return;
        }

        const openings = Array.from(openingsList.querySelectorAll('.song-entry')).map(entry => ({
            jpName: entry.querySelector('.song-jp-name').value.trim(),
            romajiName: entry.querySelector('.song-romaji-name').value.trim(),
            youtubeUrl: entry.querySelector('.song-youtube-url').value.trim(),
        })).filter(s => s.jpName || s.romajiName || s.youtubeUrl);

        const endings = Array.from(endingsList.querySelectorAll('.song-entry')).map(entry => ({
            jpName: entry.querySelector('.song-jp-name').value.trim(),
            romajiName: entry.querySelector('.song-romaji-name').value.trim(),
            youtubeUrl: entry.querySelector('.song-youtube-url').value.trim(),
        })).filter(s => s.jpName || s.romajiName || s.youtubeUrl);

        const data = getAppData();
        const season = data.seasons.find(s => s.id === currentSeasonId);

        if (editingAnimeId) {
            // Actualizar
            const anime = season.animes.find(a => a.id === editingAnimeId);
            anime.name = name;
            anime.day_of_week = day;
            anime.openings = openings;
            anime.endings = endings;
            anime.comments = comments;
        } else {
            // Crear
            const newAnime = {
                id: data.nextAnimeId++,
                name,
                day_of_week: day,
                openings,
                endings,
                comments,
            };
            season.animes.push(newAnime);
        }

        saveAppData(data);
        renderAnimes(currentSeasonId);
        closeModal(addAnimeModal);
    });

    // Acciones de Anime (Editar y Eliminar)
    animeListContainer.addEventListener('click', (e) => {
        const animeCard = e.target.closest('.anime-card');
        if (!animeCard) return;

        const animeId = parseInt(animeCard.dataset.animeId);

        if (e.target.classList.contains('delete-anime-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar este anime?')) {
                const data = getAppData();
                const season = data.seasons.find(s => s.id === currentSeasonId);
                season.animes = season.animes.filter(a => a.id !== animeId);
                saveAppData(data);
                renderAnimes(currentSeasonId);
            }
        } else if (e.target.classList.contains('edit-anime-btn')) {
            const data = getAppData();
            const season = data.seasons.find(s => s.id === currentSeasonId);
            const anime = season.animes.find(a => a.id === animeId);

            editingAnimeId = anime.id;
            addAnimeModal.querySelector('h2').textContent = 'Editar Anime';
            animeNameInput.value = anime.name;
            dayOfWeekInput.value = anime.day_of_week;

            openingsList.innerHTML = ''; // Limpiar
            if(anime.openings) {
                anime.openings.forEach(op => openingsList.appendChild(createSongEntryForm(op)));
            }

            endingsList.innerHTML = ''; // Limpiar
            if(anime.endings) {
                anime.endings.forEach(en => endingsList.appendChild(createSongEntryForm(en)));
            }

            commentsInput.value = anime.comments;

            openModal(addAnimeModal);
        }
    });
});
