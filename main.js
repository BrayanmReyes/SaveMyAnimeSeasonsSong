import * as api from './api.js';
import * as ui from './ui.js';

const state = {
    currentSeasonId: null,
    editingAnimeId: null,
    editingSeasonId: null,
};

const ADMIN_PASSWORD = 'admin'; // NOTA: Esto es inseguro. En una app real, usar variables de entorno.

async function handleInitialLoad() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme === 'dark' ? 'dark-mode' : '';
    ui.updateThemeIcons(savedTheme);

    if (sessionStorage.getItem('isAdmin') === 'true') {
        ui.enterAdminMode();
    } else {
        ui.exitAdminMode();
    }

    const seasons = await api.getSeasons();
    const lastSelectedSeason = localStorage.getItem('currentSeasonId');

    if (lastSelectedSeason && seasons.some(s => s.id == lastSelectedSeason)) {
        state.currentSeasonId = parseInt(lastSelectedSeason);
    } else if (seasons.length > 0) {
        state.currentSeasonId = seasons[0].id;
    } else {
        state.currentSeasonId = null;
    }

    ui.renderSeasons(seasons, state.currentSeasonId);
    if (state.currentSeasonId) {
        const animes = await api.getAnimesBySeason(state.currentSeasonId);
        ui.renderAnimes(animes);
    } else {
        ui.DOM.animeListContainer.innerHTML = '<p>Crea una temporada para empezar.</p>';
    }
}

function setupEventListeners() {
    ui.DOM.seasonSelector.addEventListener('change', async (e) => {
        const newSeasonId = parseInt(e.target.value);
        if (!isNaN(newSeasonId)) {
            state.currentSeasonId = newSeasonId;
            localStorage.setItem('currentSeasonId', state.currentSeasonId);
            const animes = await api.getAnimesBySeason(state.currentSeasonId);
            ui.renderAnimes(animes);
        }
    });

    ui.DOM.addSeasonBtn.addEventListener('click', () => ui.openModal(ui.DOM.addSeasonModal));
    ui.DOM.addAnimeBtn.addEventListener('click', () => {
        if (state.currentSeasonId) {
            ui.openModal(ui.DOM.addAnimeModal);
        } else {
            alert('Por favor, crea y selecciona una temporada primero.');
        }
    });

    ui.DOM.closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            ui.closeModal(modal);
            if (modal === ui.DOM.addAnimeModal) {
                state.editingAnimeId = null;
                // Reset form
            }
            if (modal === ui.DOM.addSeasonModal) {
                state.editingSeasonId = null;
                ui.DOM.addSeasonModal.querySelector('h2').textContent = 'Nueva Temporada';
                ui.DOM.seasonNameInput.value = '';
            }
        });
    });

    ui.DOM.addOpeningBtn.addEventListener('click', () => {
        ui.DOM.openingsList.appendChild(ui.createSongEntryForm());
    });

    ui.DOM.addEndingBtn.addEventListener('click', () => {
        ui.DOM.endingsList.appendChild(ui.createSongEntryForm());
    });

    ui.DOM.editSeasonBtn.addEventListener('click', () => {
        if (!state.currentSeasonId) return alert('No hay ninguna temporada seleccionada para editar.');

        state.editingSeasonId = state.currentSeasonId;
        const seasonName = ui.DOM.seasonSelector.options[ui.DOM.seasonSelector.selectedIndex].text;

        ui.DOM.addSeasonModal.querySelector('h2').textContent = 'Editar Temporada';
        ui.DOM.seasonNameInput.value = seasonName;
        ui.openModal(ui.DOM.addSeasonModal);
    });

    ui.DOM.saveSeasonBtn.addEventListener('click', async () => {
        const name = ui.DOM.seasonNameInput.value.trim();
        if (name) {
            let success;
            if (state.editingSeasonId) {
                success = await api.updateSeason(state.editingSeasonId, name);
            } else {
                success = await api.addSeason(name);
            }

            if (success) {
                ui.DOM.seasonNameInput.value = '';
                ui.closeModal(ui.DOM.addSeasonModal);
                await handleInitialLoad(); // Reload everything
            } else {
                alert(`No se pudo ${state.editingSeasonId ? 'actualizar' : 'crear'} la temporada.`);
            }
            state.editingSeasonId = null; // Reset
            ui.DOM.addSeasonModal.querySelector('h2').textContent = 'Nueva Temporada';
        }
    });

    ui.DOM.deleteSeasonBtn.addEventListener('click', async () => {
        if (!state.currentSeasonId) return alert('No hay temporada seleccionada.');
        if (confirm('¿Estás seguro de que quieres eliminar esta temporada?')) {
            const success = await api.deleteSeason(state.currentSeasonId);
            if (success) {
                localStorage.removeItem('currentSeasonId');
                await handleInitialLoad();
            } else {
                alert('No se pudo eliminar la temporada.');
            }
        }
    });

    ui.DOM.saveAnimeBtn.addEventListener('click', async () => {
        const name = ui.DOM.animeNameInput.value.trim();
        if (!name) return alert('El nombre del anime no puede estar vacío.');

        const animeData = {
            name: name,
            day_of_week: ui.DOM.dayOfWeekInput.value,
            comments: ui.DOM.commentsInput.value.trim(),
            season_id: state.currentSeasonId
        };

        const openings = Array.from(ui.DOM.openingsList.querySelectorAll('.song-entry')).map(entry => ({
            jp_name: entry.querySelector('.song-jp-name').value.trim(),
            romaji_name: entry.querySelector('.song-romaji-name').value.trim(),
            youtube_url: entry.querySelector('.song-youtube-url').value.trim(),
        })).filter(s => s.jp_name || s.romaji_name || s.youtube_url);

        const endings = Array.from(ui.DOM.endingsList.querySelectorAll('.song-entry')).map(entry => ({
            jp_name: entry.querySelector('.song-jp-name').value.trim(),
            romaji_name: entry.querySelector('.song-romaji-name').value.trim(),
            youtube_url: entry.querySelector('.song-youtube-url').value.trim(),
        })).filter(s => s.jp_name || s.romaji_name || s.youtube_url);

        let success;
        if (state.editingAnimeId) {
            success = await api.updateAnime(state.editingAnimeId, animeData, openings, endings);
        } else {
            success = await api.addAnime(animeData, openings, endings);
        }

        if (success) {
            const animes = await api.getAnimesBySeason(state.currentSeasonId);
            ui.renderAnimes(animes);
            ui.closeModal(ui.DOM.addAnimeModal);
            state.editingAnimeId = null; // Reset editing state
        } else {
            alert(`No se pudo ${state.editingAnimeId ? 'actualizar' : 'guardar'} el anime.`);
        }
    });

    ui.DOM.animeListContainer.addEventListener('click', async (e) => {
        // YouTube link click
        if (e.target.closest('.youtube-link')) {
            e.preventDefault();
            const url = e.target.closest('.youtube-link').href;
            ui.openVideoModal(url);
            return;
        }

        // Accordion toggle logic
        const header = e.target.closest('.anime-card-header');
        if (header) {
            const clickedCard = header.parentElement;
            const isAlreadyExpanded = clickedCard.classList.contains('expanded');

            // Close all other cards
            ui.DOM.animeListContainer.querySelectorAll('.anime-card').forEach(card => {
                card.classList.remove('expanded');
                card.querySelector('.anime-details').style.maxHeight = null;
            });

            // If the clicked card was not already open, open it
            if (!isAlreadyExpanded) {
                clickedCard.classList.add('expanded');
                const details = clickedCard.querySelector('.anime-details');
                details.style.maxHeight = details.scrollHeight + 'px';
            }
        }

        // Action buttons logic
        const animeCard = e.target.closest('.anime-card');
        if (!animeCard) return;

        const animeId = parseInt(animeCard.dataset.animeId);

        if (e.target.classList.contains('delete-anime-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar este anime?')) {
                const success = await api.deleteAnime(animeId);
                if (success) {
                    const animes = await api.getAnimesBySeason(state.currentSeasonId);
                    ui.renderAnimes(animes);
                } else {
                    alert('No se pudo eliminar el anime.');
                }
            }
        } else if (e.target.classList.contains('edit-anime-btn')) {
            const anime = await api.getAnimeDetails(animeId);
            if (anime) {
                state.editingAnimeId = anime.id;
                ui.DOM.addAnimeModal.querySelector('h2').textContent = 'Editar Anime';
                ui.DOM.animeNameInput.value = anime.name;
                ui.DOM.dayOfWeekInput.value = anime.day_of_week;
                ui.DOM.commentsInput.value = anime.comments;

                ui.DOM.openingsList.innerHTML = '';
                if(anime.openings) {
                    anime.openings.forEach(op => ui.DOM.openingsList.appendChild(ui.createSongEntryForm({ jpName: op.jp_name, romajiName: op.romaji_name, youtubeUrl: op.youtube_url })));
                }

                ui.DOM.endingsList.innerHTML = '';
                if(anime.endings) {
                    anime.endings.forEach(en => ui.DOM.endingsList.appendChild(ui.createSongEntryForm({ jpName: en.jp_name, romajiName: en.romaji_name, youtubeUrl: en.youtube_url })));
                }

                ui.openModal(ui.DOM.addAnimeModal);
            }
        }
    });

    ui.DOM.loginBtn.addEventListener('click', () => ui.openModal(ui.DOM.loginModal));
    ui.DOM.logoutBtn.addEventListener('click', () => ui.exitAdminMode());

    ui.DOM.loginSubmitBtn.addEventListener('click', () => {
        if (ui.DOM.passwordInput.value === ADMIN_PASSWORD) {
            ui.enterAdminMode();
            ui.closeModal(ui.DOM.loginModal);
            ui.DOM.passwordInput.value = '';
        } else {
            alert('Contraseña incorrecta.');
            ui.DOM.passwordInput.value = '';
        }
    });

    ui.DOM.themeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        const newTheme = isDarkMode ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        ui.updateThemeIcons(newTheme);
    });

    // Scroll to top logic
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            ui.DOM.scrollToTopBtn.style.display = 'flex';
            // Use a timeout to allow the display property to apply before adding the class
            setTimeout(() => ui.DOM.scrollToTopBtn.classList.add('visible'), 10);
        } else {
            ui.DOM.scrollToTopBtn.classList.remove('visible');
        }
    });

    ui.DOM.scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    handleInitialLoad();
    setupEventListeners();
});
