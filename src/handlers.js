import * as api from './api.js';
import * as ui from './ui.js';
import { getState, setState } from './state.js';
import { renderArtistList } from './artists.js';
import { reloadSeasons } from './app.js';

export async function handleSeasonChange(e) {
    const newSeasonId = parseInt(e.target.value);
    if (!isNaN(newSeasonId)) {
        setState({ currentSeasonId: newSeasonId });
        localStorage.setItem('currentSeasonId', newSeasonId);
        const animes = await api.getAnimesBySeason(newSeasonId);
        ui.renderAnimes(animes);
    }
}

export function handleAddSeason() {
    setState({ editingSeasonId: null });
    ui.DOM.addSeasonModal.querySelector('h2').textContent = 'Nueva Temporada';
    ui.DOM.seasonNameInput.value = '';
    ui.openModal(ui.DOM.addSeasonModal);
}

export function handleEditSeason() {
    const { currentSeasonId } = getState();
    if (!currentSeasonId) return ui.showError('No hay ninguna temporada seleccionada para editar.');

    setState({ editingSeasonId: currentSeasonId });
    const seasonName = ui.DOM.seasonSelector.options[ui.DOM.seasonSelector.selectedIndex].text;

    ui.DOM.addSeasonModal.querySelector('h2').textContent = 'Editar Temporada';
    ui.DOM.seasonNameInput.value = seasonName;
    ui.openModal(ui.DOM.addSeasonModal);
}

export async function handleDeleteSeason() {
    const { currentSeasonId } = getState();
    if (!currentSeasonId) return ui.showError('No hay temporada seleccionada.');
    if (confirm('¿Estás seguro de que quieres eliminar esta temporada?')) {
        const success = await api.deleteSeason(currentSeasonId);
        if (success) {
            localStorage.removeItem('currentSeasonId');
            reloadSeasons();
        } else {
            ui.showError('No se pudo eliminar la temporada.');
        }
    }
}

export async function handleSaveSeason() {
    const { editingSeasonId } = getState();
    const name = ui.DOM.seasonNameInput.value.trim();
    if (name) {
        let success;
        if (editingSeasonId) {
            success = await api.updateSeason(editingSeasonId, name);
        } else {
            success = await api.addSeason(name);
        }

        if (success) {
            ui.DOM.seasonNameInput.value = '';
            ui.closeModal(ui.DOM.addSeasonModal);
            setState({ editingSeasonId: null });
            reloadSeasons();
        } else {
            ui.showError(`No se pudo ${editingSeasonId ? 'actualizar' : 'crear'} la temporada.`);
        }
    }
}

export function handleAddAnime() {
    const { currentSeasonId } = getState();
    if (!currentSeasonId) return ui.showError('Por favor, crea y selecciona una temporada primero.');
    setState({ editingAnimeId: null, isContinuationMode: false });
    ui.prepareNewAnimeModal();
    ui.openModal(ui.DOM.addAnimeModal);
}

export async function handleAddContinuation() {
    const { currentSeasonId } = getState();
    if (!currentSeasonId) return ui.showError('Por favor, selecciona una temporada primero.');

    setState({ isContinuationMode: true });
    const animes = await api.getContinuableAnimes();

    if (animes.length === 0) {
        return ui.showError('No hay animes en temporadas anteriores para continuar.');
    }

    ui.prepareContinuationModal(animes);
    ui.openModal(ui.DOM.addAnimeModal);
}

export async function handleSaveAnime() {
    const { isContinuationMode, editingAnimeId, currentSeasonId } = getState();
    let success;

    if (isContinuationMode) {
        const main_anime_id = parseInt(ui.DOM.continuationSelect.value);
        if (!main_anime_id) return ui.showError('Por favor, selecciona un anime para continuar.');

        const selectedOption = ui.DOM.continuationSelect.options[ui.DOM.continuationSelect.selectedIndex];
        const animeData = {
            name: selectedOption.textContent,
            day_of_week: ui.DOM.dayOfWeekInput.value,
            comments: '',
            season_id: currentSeasonId,
            main_anime_id: main_anime_id,
        };
        success = await api.addAnime(animeData, [], []);
    } else {
        const name = ui.DOM.animeNameInput.value.trim();
        if (!name) return ui.showError('El nombre del anime no puede estar vacío.');

        const animeData = {
            name: name,
            day_of_week: ui.DOM.dayOfWeekInput.value,
            comments: ui.DOM.commentsInput.value.trim(),
            season_id: currentSeasonId
        };

        const openings = ui.getSongEntries(ui.DOM.openingsList);
        const endings = ui.getSongEntries(ui.DOM.endingsList);

        if (editingAnimeId) {
            success = await api.updateAnime(editingAnimeId, animeData, openings, endings);
        } else {
            success = await api.addAnime(animeData, openings, endings);
        }
    }

    if (success) {
        const animes = await api.getAnimesBySeason(currentSeasonId);
        ui.renderAnimes(animes);
        ui.closeModal(ui.DOM.addAnimeModal);
        setState({ editingAnimeId: null, isContinuationMode: false });
    } else {
        ui.showError(`No se pudo ${editingAnimeId ? 'actualizar' : 'guardar'} el anime.`);
    }
}

export function handleAnimeListClick(e) {
    if (e.target.closest('.youtube-link')) {
        e.preventDefault();
        const url = e.target.closest('.youtube-link').href;
        ui.openVideoModal(url);
        return;
    }

    const header = e.target.closest('.anime-card-header');
    if (header) {
        ui.toggleAccordion(header.parentElement);
        return;
    }

    const animeCard = e.target.closest('.anime-card');
    if (!animeCard) return;

    const animeId = parseInt(animeCard.dataset.animeId);

    if (e.target.classList.contains('delete-anime-btn')) {
        handleDeleteAnime(animeId);
    } else if (e.target.classList.contains('edit-anime-btn')) {
        handleEditAnime(animeId);
    }
}

async function handleDeleteAnime(animeId) {
    const { currentSeasonId } = getState();
    if (confirm('¿Estás seguro de que quieres eliminar este anime?')) {
        const result = await api.deleteAnime(animeId);
        if (result.success) {
            const animes = await api.getAnimesBySeason(currentSeasonId);
            ui.renderAnimes(animes);
        } else {
            ui.showError(result.message || 'No se pudo eliminar el anime.');
        }
    }
}

async function handleEditAnime(animeId) {
    const anime = await api.getAnimeDetails(animeId);
    if (anime) {
        setState({ editingAnimeId: anime.id });
        ui.prepareEditAnimeModal(anime);
        ui.openModal(ui.DOM.addAnimeModal);
    }
}

export function handleModalClose(e) {
    const modal = e.target.closest('.modal');
    ui.closeModal(modal);
    if (modal === ui.DOM.addAnimeModal) {
        setState({ editingAnimeId: null, isContinuationMode: false });
    }
    if (modal === ui.DOM.addSeasonModal) {
        setState({ editingSeasonId: null });
    }
}

export function handleLogin() {
    ui.openModal(ui.DOM.loginModal);
}

export function handleLogout() {
    sessionStorage.removeItem('isAdmin');
    ui.exitAdminMode();
}

export function handleLoginSubmit() {
    // SECURITY WARNING: This is not a secure way to handle authentication.
    // The password is still checked on the client-side, which is insecure.
    // In a real application, you should:
    // 1. Use environment variables to store secrets.
    // 2. Implement a proper server-side authentication flow (e.g., with Supabase Auth).
    const password = ui.DOM.passwordInput.value;
    if (password === 'admin') { // Replace 'admin' with a password from a secure source
        sessionStorage.setItem('isAdmin', 'true');
        ui.enterAdminMode();
        ui.closeModal(ui.DOM.loginModal);
        ui.DOM.passwordInput.value = '';
    } else {
        ui.showError('Contraseña incorrecta.');
        ui.DOM.passwordInput.value = '';
    }
}

export function handleThemeToggle() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    const newTheme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    ui.updateThemeIcons(newTheme);
}

export function handleScrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function showSeasonsView() {
    ui.DOM.seasonManager.style.display = 'flex';
    ui.DOM.animeListContainer.style.display = 'block';
    ui.DOM.artistViewContainer.style.display = 'none';
    ui.DOM.addAnimeBtn.style.display = 'flex';
}

export async function showArtistsView() {
    ui.DOM.seasonManager.style.display = 'none';
    ui.DOM.animeListContainer.style.display = 'none';
    ui.DOM.artistViewContainer.style.display = 'block';
    ui.DOM.addAnimeBtn.style.display = 'none';

    const artists = await api.getAllArtists();
    renderArtistList(artists, ui.DOM.artistViewContainer);
}

let searchTimeout;
export function handleAnimeSearch(e) {
    const { currentSeasonId } = getState();
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.trim();

    if (searchTerm.length === 0) {
        // Reload current season's animes
        (async () => {
            if (currentSeasonId) {
                const animes = await api.getAnimesBySeason(currentSeasonId);
                ui.renderAnimes(animes);
            } else {
                ui.DOM.animeListContainer.innerHTML = '<p>Crea una temporada para empezar.</p>';
            }
        })();
        return;
    }

    if (searchTerm.length < 3) return;

    searchTimeout = setTimeout(async () => {
        const results = await api.searchAnimes(searchTerm);
        ui.renderAnimes(results, { title: `Resultados para "${searchTerm}"`, groupByDay: false });
    }, 300);
}
