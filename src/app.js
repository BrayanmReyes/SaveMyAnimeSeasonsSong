import * as api from './api.js';
import * as ui from './ui.js';
import { getState, setState } from './state.js';
import * as handlers from './handlers.js';

async function initApp() {
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
    let currentSeasonId;

    if (lastSelectedSeason && seasons.some(s => s.id == lastSelectedSeason)) {
        currentSeasonId = parseInt(lastSelectedSeason);
    } else if (seasons.length > 0) {
        currentSeasonId = seasons[0].id;
    } else {
        currentSeasonId = null;
    }
    setState({ currentSeasonId });

    ui.renderSeasons(seasons, currentSeasonId);
    if (currentSeasonId) {
        const animes = await api.getAnimesBySeason(currentSeasonId);
        ui.renderAnimes(animes);
    } else {
        ui.DOM.animeListContainer.innerHTML = '<p>Crea una temporada para empezar.</p>';
    }
}

export async function reloadSeasons() {
    const seasons = await api.getSeasons();
    const currentSeasonId = getState().currentSeasonId;

    let newSeasonId = currentSeasonId;
    if (!seasons.some(s => s.id === newSeasonId)) {
        newSeasonId = seasons.length > 0 ? seasons[0].id : null;
        setState({ currentSeasonId: newSeasonId });
        localStorage.setItem('currentSeasonId', newSeasonId);
    }

    ui.renderSeasons(seasons, newSeasonId);

    if (newSeasonId) {
        const animes = await api.getAnimesBySeason(newSeasonId);
        ui.renderAnimes(animes);
    } else {
        ui.DOM.animeListContainer.innerHTML = '<p>Crea una temporada para empezar.</p>';
    }
}

function setupEventListeners() {
    ui.DOM.seasonYearSelector.addEventListener('change', handlers.handleYearChange);
    ui.DOM.seasonNameSelector.addEventListener('change', handlers.handleSeasonChange);
    ui.DOM.addSeasonBtn.addEventListener('click', handlers.handleAddSeason);
    ui.DOM.editSeasonBtn.addEventListener('click', handlers.handleEditSeason);
    ui.DOM.deleteSeasonBtn.addEventListener('click', handlers.handleDeleteSeason);
    ui.DOM.saveSeasonBtn.addEventListener('click', handlers.handleSaveSeason);

    ui.DOM.addAnimeBtn.addEventListener('click', handlers.handleAddAnime);
    ui.DOM.addContinuationBtn.addEventListener('click', handlers.handleAddContinuation);
    ui.DOM.saveAnimeBtn.addEventListener('click', handlers.handleSaveAnime);

    ui.DOM.animeListContainer.addEventListener('click', handlers.handleAnimeListClick);

    ui.DOM.closeBtns.forEach(btn => btn.addEventListener('click', handlers.handleModalClose));

    ui.DOM.addOpeningBtn.addEventListener('click', () => ui.addSongEntry(ui.DOM.openingsList));
    ui.DOM.addEndingBtn.addEventListener('click', () => ui.addSongEntry(ui.DOM.endingsList));

    ui.DOM.loginBtn.addEventListener('click', handlers.handleLogin);
    ui.DOM.logoutBtn.addEventListener('click', handlers.handleLogout);
    ui.DOM.loginSubmitBtn.addEventListener('click', handlers.handleLoginSubmit);

    ui.DOM.themeToggle.addEventListener('click', handlers.handleThemeToggle);
    ui.DOM.scrollToTopBtn.addEventListener('click', handlers.handleScrollToTop);

    ui.DOM.mainTitle.addEventListener('click', handlers.showSeasonsView);

    ui.DOM.animeSearchInput.addEventListener('input', handlers.handleAnimeSearch);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            ui.DOM.scrollToTopBtn.style.display = 'flex';
            setTimeout(() => ui.DOM.scrollToTopBtn.classList.add('visible'), 10);
        } else {
            ui.DOM.scrollToTopBtn.classList.remove('visible');
        }
    });
}

export function start() {
    initApp();
    setupEventListeners();
}
