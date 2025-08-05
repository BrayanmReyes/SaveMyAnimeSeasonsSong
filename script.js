// Lógica para Anime Tracker
const { createClient } = supabase;
const SUPABASE_URL = 'https://qlbhdapjajsyhznbodvh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsYmhkYXBqYWpzeWh6bmJvZHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjY0NjcsImV4cCI6MjA2OTk0MjQ2N30.iZGe8rQColcutlWq13zpkq5RZaYur4jfOt04p0bW11s';
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginModal = document.getElementById('login-modal');
    const passwordInput = document.getElementById('password-input');
    const loginSubmitBtn = document.getElementById('login-submit-btn');

    let currentSeasonId = null;
    let editingAnimeId = null;

    // --- GESTIÓN DE DATOS CON SUPABASE ---
    // Las funciones ahora interactuarán directamente con la API de Supabase

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

    // --- RENDERIZADO CON SUPABASE ---
    const renderAnimes = async (seasonId) => {
        if (!seasonId) {
            animeListContainer.innerHTML = '<p>Selecciona una temporada para ver los animes.</p>';
            return;
        }

        const { data: animes, error } = await _supabase
            .from('animes')
            .select(`
                id, name, day_of_week, comments,
                openings (id, jp_name, romaji_name, youtube_url),
                endings (id, jp_name, romaji_name, youtube_url)
            `)
            .eq('season_id', seasonId)
            .order('created_at');

        if (error) {
            console.error('Error fetching animes:', error);
            animeListContainer.innerHTML = '<p>Error al cargar los animes.</p>';
            return;
        }

        animeListContainer.innerHTML = ''; // Limpiar

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

                animesOfTheDay.forEach(anime => {
                    const animeCard = document.createElement('div');
                    animeCard.className = 'anime-card';
                    animeCard.dataset.animeId = anime.id;

                    const openingsHTML = anime.openings && anime.openings.length > 0
                        ? anime.openings.map((op, index) => `
                            <li class="song-item">
                                <strong class="song-title">OP ${index + 1}:</strong>
                                <div class="song-details">
                                    <span><strong>JP:</strong> ${op.jp_name || 'N/A'}</span>
                                    <span><strong>Romaji:</strong> ${op.romaji_name || 'N/A'}</span>
                                    ${op.youtube_url ? `<a href="${op.youtube_url}" target="_blank" title="${op.youtube_url}">YouTube</a>` : ''}
                                </div>
                            </li>`).join('')
                        : '<li>N/A</li>';

                    const endingsHTML = anime.endings && anime.endings.length > 0
                        ? anime.endings.map((en, index) => `
                            <li class="song-item">
                                <strong class="song-title">ED ${index + 1}:</strong>
                                <div class="song-details">
                                    <span><strong>JP:</strong> ${en.jp_name || 'N/A'}</span>
                                    <span><strong>Romaji:</strong> ${en.romaji_name || 'N/A'}</span>
                                    ${en.youtube_url ? `<a href="${en.youtube_url}" target="_blank" title="${en.youtube_url}">YouTube</a>` : ''}
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

    const renderSeasons = async () => {
        const { data: seasons, error } = await _supabase.from('seasons').select('*').order('created_at');

        if (error) {
            console.error('Error fetching seasons:', error);
            seasonSelector.innerHTML = '<option>Error al cargar</option>';
            return;
        }

        const lastSelectedSeason = localStorage.getItem('currentSeasonId');

        seasonSelector.innerHTML = '';
        if (seasons.length === 0) {
            seasonSelector.innerHTML = '<option>No hay temporadas</option>';
        } else {
            seasons.forEach(season => {
                const option = document.createElement('option');
                option.value = season.id;
                option.textContent = season.name;
                seasonSelector.appendChild(option);
            });
        }

        if (lastSelectedSeason && seasons.some(s => s.id == lastSelectedSeason)) {
            seasonSelector.value = lastSelectedSeason;
            currentSeasonId = parseInt(lastSelectedSeason);
        } else if (seasons.length > 0) {
            currentSeasonId = seasons[0].id;
            seasonSelector.value = currentSeasonId;
        } else {
            currentSeasonId = null;
        }

        if (currentSeasonId) {
            localStorage.setItem('currentSeasonId', currentSeasonId);
        } else {
            localStorage.removeItem('currentSeasonId');
        }

        await renderAnimes(currentSeasonId);
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

    // --- LÓGICA DE AUTENTICACIÓN ---
    const ADMIN_PASSWORD = 'admin'; // NOTA: Esto es inseguro. En una app real, usar variables de entorno.

    const enterAdminMode = () => {
        sessionStorage.setItem('isAdmin', 'true');
        document.body.classList.remove('readonly-mode');
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    };

    const exitAdminMode = () => {
        sessionStorage.removeItem('isAdmin');
        document.body.classList.add('readonly-mode');
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    };

    // --- INICIALIZACIÓN ---
    const init = async () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.className = savedTheme === 'dark' ? 'dark-mode' : '';
        updateThemeIcons(savedTheme);

        if (sessionStorage.getItem('isAdmin') === 'true') {
            enterAdminMode();
        } else {
            exitAdminMode();
        }

        await renderSeasons();
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
    saveSeasonBtn.addEventListener('click', async () => {
        const name = seasonNameInput.value.trim();
        if (name) {
            const { error } = await _supabase.from('seasons').insert({ name: name });
            if (error) {
                console.error('Error creating season:', error);
                alert('No se pudo crear la temporada.');
            } else {
                await renderSeasons();
                closeModal(addSeasonModal);
                seasonNameInput.value = '';
            }
        } else {
            alert('El nombre de la temporada no puede estar vacío.');
        }
    });

    // Eliminar temporada
    deleteSeasonBtn.addEventListener('click', async () => {
        if (!currentSeasonId) {
            alert('No hay ninguna temporada seleccionada para eliminar.');
            return;
        }
        if (confirm('¿Estás seguro de que quieres eliminar la temporada seleccionada y todos sus animes?')) {
            const { error } = await _supabase.from('seasons').delete().eq('id', currentSeasonId);
            if (error) {
                console.error('Error deleting season:', error);
                alert('No se pudo eliminar la temporada.');
            } else {
                localStorage.removeItem('currentSeasonId');
                currentSeasonId = null;
                await renderSeasons();
            }
        }
    });

    // Guardar Anime (Crear y Actualizar)
    saveAnimeBtn.addEventListener('click', async () => {
        const name = animeNameInput.value.trim();
        const day = dayOfWeekInput.value;
        const comments = commentsInput.value.trim();

        if (!name) {
            alert('El nombre del anime no puede estar vacío.');
            return;
        }

        const openings = Array.from(openingsList.querySelectorAll('.song-entry')).map(entry => ({
            jp_name: entry.querySelector('.song-jp-name').value.trim(),
            romaji_name: entry.querySelector('.song-romaji-name').value.trim(),
            youtube_url: entry.querySelector('.song-youtube-url').value.trim(),
        })).filter(s => s.jp_name || s.romaji_name || s.youtube_url);

        const endings = Array.from(endingsList.querySelectorAll('.song-entry')).map(entry => ({
            jp_name: entry.querySelector('.song-jp-name').value.trim(),
            romaji_name: entry.querySelector('.song-romaji-name').value.trim(),
            youtube_url: entry.querySelector('.song-youtube-url').value.trim(),
        })).filter(s => s.jp_name || s.romaji_name || s.youtube_url);

        if (editingAnimeId) {
            // Actualizar
            const { error: animeError } = await _supabase.from('animes').update({
                name,
                day_of_week: day,
                comments,
            }).eq('id', editingAnimeId);

            if (animeError) {
                console.error('Error updating anime:', animeError);
                return alert('No se pudo actualizar el anime.');
            }

            // Borrar y re-insertar openings y endings
            await _supabase.from('openings').delete().eq('anime_id', editingAnimeId);
            await _supabase.from('endings').delete().eq('anime_id', editingAnimeId);

            if (openings.length > 0) {
                const openingsWithAnimeId = openings.map(o => ({ ...o, anime_id: editingAnimeId }));
                await _supabase.from('openings').insert(openingsWithAnimeId);
            }
            if (endings.length > 0) {
                const endingsWithAnimeId = endings.map(e => ({ ...e, anime_id: editingAnimeId }));
                await _supabase.from('endings').insert(endingsWithAnimeId);
            }

        } else {
            // Crear
            const { data: newAnimeData, error: animeError } = await _supabase.from('animes').insert({
                name,
                day_of_week: day,
                comments,
                season_id: currentSeasonId,
            }).select().single();

            if (animeError) {
                console.error('Error creating anime:', animeError);
                return alert('No se pudo crear el anime.');
            }

            const newAnimeId = newAnimeData.id;
            if (openings.length > 0) {
                const openingsWithAnimeId = openings.map(o => ({ ...o, anime_id: newAnimeId }));
                await _supabase.from('openings').insert(openingsWithAnimeId);
            }
            if (endings.length > 0) {
                const endingsWithAnimeId = endings.map(e => ({ ...e, anime_id: newAnimeId }));
                await _supabase.from('endings').insert(endingsWithAnimeId);
            }
        }

        await renderAnimes(currentSeasonId);
        closeModal(addAnimeModal);
    });

    // Acciones de Anime (Editar y Eliminar)
    animeListContainer.addEventListener('click', async (e) => {
        const animeCard = e.target.closest('.anime-card');
        if (!animeCard) return;

        const animeId = parseInt(animeCard.dataset.animeId);

        if (e.target.classList.contains('delete-anime-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar este anime?')) {
                const { error } = await _supabase.from('animes').delete().eq('id', animeId);
                if (error) {
                    console.error('Error deleting anime:', error);
                    alert('No se pudo eliminar el anime.');
                } else {
                    await renderAnimes(currentSeasonId);
                }
            }
        } else if (e.target.classList.contains('edit-anime-btn')) {
            const { data: anime, error } = await _supabase
                .from('animes')
                .select(`*, openings(*), endings(*)`)
                .eq('id', animeId)
                .single();

            if (error) {
                console.error('Error fetching anime details:', error);
                return alert('No se pudieron cargar los detalles del anime.');
            }

            editingAnimeId = anime.id;
            addAnimeModal.querySelector('h2').textContent = 'Editar Anime';
            animeNameInput.value = anime.name;
            dayOfWeekInput.value = anime.day_of_week;

            openingsList.innerHTML = '';
            if(anime.openings) {
                anime.openings.forEach(op => openingsList.appendChild(createSongEntryForm({ jpName: op.jp_name, romajiName: op.romaji_name, youtubeUrl: op.youtube_url })));
            }

            endingsList.innerHTML = '';
            if(anime.endings) {
                anime.endings.forEach(en => endingsList.appendChild(createSongEntryForm({ jpName: en.jp_name, romajiName: en.romaji_name, youtubeUrl: en.youtube_url })));
            }

            commentsInput.value = anime.comments;

            openModal(addAnimeModal);
        }
    });

    loginBtn.addEventListener('click', () => openModal(loginModal));

    logoutBtn.addEventListener('click', () => {
        exitAdminMode();
    });

    loginSubmitBtn.addEventListener('click', () => {
        if (passwordInput.value === ADMIN_PASSWORD) {
            enterAdminMode();
            closeModal(loginModal);
            passwordInput.value = '';
        } else {
            alert('Contraseña incorrecta.');
            passwordInput.value = '';
        }
    });
});
