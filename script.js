// Lógica para Anime Tracker

document.addEventListener('DOMContentLoaded', () => {
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
    const openingsInput = document.getElementById('openings-input');
    const endingsInput = document.getElementById('endings-input');
    const commentsInput = document.getElementById('comments-input');
    const saveAnimeBtn = document.getElementById('save-anime-btn');

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
                    animeCard.innerHTML = `
                        <h4>${anime.name}</h4>
                        <div class="anime-details">
                            <p><strong>Openings:</strong></p>
                            <ul>${anime.openings.map(op => `<li>${op}</li>`).join('') || '<li>N/A</li>'}</ul>
                            <p><strong>Endings:</strong></p>
                            <ul>${anime.endings.map(en => `<li>${en}</li>`).join('') || '<li>N/A</li>'}</ul>
                            <p><strong>Comentarios:</strong> ${anime.comments || 'N/A'}</p>
                        </div>
                        <div class="anime-actions">
                            <button class="edit-anime-btn">Editar</button>
                            <button class="delete-anime-btn">Eliminar</button>
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
            openingsInput.value = '';
            endingsInput.value = '';
            commentsInput.value = '';
        }
    };

    // --- INICIALIZACIÓN ---
    const init = () => {
        renderSeasons();
    };

    init(); // Cargar todo al iniciar

    // --- MANEJO DE EVENTOS ---

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
        const openings = openingsInput.value.split('\n').filter(op => op.trim() !== '');
        const endings = endingsInput.value.split('\n').filter(en => en.trim() !== '');
        const comments = commentsInput.value.trim();

        if (!name) {
            alert('El nombre del anime no puede estar vacío.');
            return;
        }

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
            openingsInput.value = anime.openings.join('\n');
            endingsInput.value = anime.endings.join('\n');
            commentsInput.value = anime.comments;

            openModal(addAnimeModal);
        }
    });
});
