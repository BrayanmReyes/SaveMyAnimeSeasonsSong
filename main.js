import * as api from './api.js';
import * as ui from './ui.js';
import { renderArtistList } from './artists.js';

const state = {
    currentSeasonId: null,
    editingAnimeId: null,
    editingSeasonId: null,
    isContinuationMode: false,
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

    const prepareNewAnimeModal = () => {
        state.isContinuationMode = false;
        state.editingAnimeId = null;
        ui.DOM.addAnimeModal.querySelector('h2').textContent = 'Agregar Anime';
        ui.DOM.continuationSection.style.display = 'none';
        ui.DOM.newAnimeSection.style.display = 'block';
        ui.DOM.openingsList.parentElement.style.display = 'block';
        ui.DOM.endingsList.parentElement.style.display = 'block';
        ui.DOM.commentsInput.style.display = 'block';
    };

    ui.DOM.addAnimeBtn.addEventListener('click', () => {
        if (!state.currentSeasonId) return alert('Por favor, crea y selecciona una temporada primero.');
        prepareNewAnimeModal();
        ui.openModal(ui.DOM.addAnimeModal);
    });

    ui.DOM.addContinuationBtn.addEventListener('click', async () => {
        if (!state.currentSeasonId) return alert('Por favor, selecciona una temporada primero.');

        state.isContinuationMode = true;
        const animes = await api.getContinuableAnimes();

        if (animes.length === 0) {
            return alert('No hay animes en temporadas anteriores para continuar.');
        }

        ui.DOM.addAnimeModal.querySelector('h2').textContent = 'Añadir Continuación';
        ui.DOM.continuationSection.style.display = 'block';
        ui.DOM.newAnimeSection.style.display = 'none';
        ui.DOM.openingsList.parentElement.style.display = 'none';
        ui.DOM.endingsList.parentElement.style.display = 'none';
        ui.DOM.commentsInput.style.display = 'none';

        const select = ui.DOM.continuationSelect;
        select.innerHTML = '<option value="">Selecciona un anime...</option>';
        animes.forEach(anime => {
            const option = document.createElement('option');
            option.value = anime.id;
            option.textContent = anime.name;
            select.appendChild(option);
        });

        ui.openModal(ui.DOM.addAnimeModal);
    });

    ui.DOM.closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            ui.closeModal(modal);
            // Reset state on any modal close
            if (modal === ui.DOM.addAnimeModal) {
                state.editingAnimeId = null;
                state.isContinuationMode = false;
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
        let success;
        if (state.isContinuationMode) {
            const select = ui.DOM.continuationSelect;
            const main_anime_id = parseInt(select.value);
            if (!main_anime_id) return alert('Por favor, selecciona un anime para continuar.');

            const selectedOption = select.options[select.selectedIndex];
            const animeData = {
                name: selectedOption.textContent, // Inherit name from main anime
                day_of_week: ui.DOM.dayOfWeekInput.value,
                comments: '', // Comments are on the main entry
                season_id: state.currentSeasonId,
                main_anime_id: main_anime_id,
            };
            success = await api.addAnime(animeData, [], []); // No songs for continuations
        } else {
            // This is the original logic for adding a new anime or editing an existing one
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

            if (state.editingAnimeId) {
                success = await api.updateAnime(state.editingAnimeId, animeData, openings, endings);
            } else {
                success = await api.addAnime(animeData, openings, endings);
            }
        }

        if (success) {
            const animes = await api.getAnimesBySeason(state.currentSeasonId);
            ui.renderAnimes(animes);
            ui.closeModal(ui.DOM.addAnimeModal);
            state.editingAnimeId = null; // Reset editing state
            state.isContinuationMode = false; // Reset continuation mode
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
                prepareNewAnimeModal(); // Reset modal to its default state
                state.editingAnimeId = anime.id;

                ui.DOM.addAnimeModal.querySelector('h2').textContent = 'Editar Anime';
                ui.DOM.animeNameInput.value = anime.name;
                ui.DOM.dayOfWeekInput.value = anime.day_of_week;
                ui.DOM.commentsInput.value = anime.comments || '';

                // Handle readonly fields for continuations
                const isContinuation = !!anime.main_anime_id;
                ui.DOM.animeNameInput.readOnly = isContinuation;
                ui.DOM.commentsInput.readOnly = isContinuation;
                if(isContinuation) {
                    ui.DOM.animeNameInput.title = 'El nombre se hereda del anime original y no se puede cambiar aquí.';
                    ui.DOM.commentsInput.title = 'Los comentarios se heredan del anime original y no se pueden cambiar aquí.';
                } else {
                    ui.DOM.animeNameInput.title = '';
                    ui.DOM.commentsInput.title = '';
                }

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

    // --- View Switching ---
    const showSeasonsView = () => {
        ui.DOM.seasonManager.style.display = 'flex';
        ui.DOM.animeListContainer.style.display = 'block';
        ui.DOM.artistViewContainer.style.display = 'none';
        ui.DOM.addAnimeBtn.style.display = 'flex';
    };

    const showArtistsView = async () => {
        ui.DOM.seasonManager.style.display = 'none';
        ui.DOM.animeListContainer.style.display = 'none';
        ui.DOM.artistViewContainer.style.display = 'block';
        ui.DOM.addAnimeBtn.style.display = 'none';

        const artists = await api.getAllArtists();
        renderArtistList(artists, ui.DOM.artistViewContainer);
    };

    ui.DOM.artistsBtn.addEventListener('click', showArtistsView);
    ui.DOM.mainTitle.addEventListener('click', showSeasonsView);

    // --- Anime Search ---
    let searchTimeout;
    const loadCurrentSeasonAnimes = async () => {
        if (state.currentSeasonId) {
            const animes = await api.getAnimesBySeason(state.currentSeasonId);
            ui.renderAnimes(animes);
        } else {
            ui.DOM.animeListContainer.innerHTML = '<p>Crea una temporada para empezar.</p>';
        }
    };

    ui.DOM.animeSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const searchTerm = e.target.value.trim();

        if (searchTerm.length === 0) {
            loadCurrentSeasonAnimes();
            return;
        }

        if (searchTerm.length < 3) {
            return; // Don't search for very short strings
        }

        searchTimeout = setTimeout(async () => {
            const results = await api.searchAnimes(searchTerm);
            ui.renderAnimes(results, { title: `Resultados para "${searchTerm}"`, groupByDay: false });
        }, 300);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    handleInitialLoad();
    setupEventListeners();
});
