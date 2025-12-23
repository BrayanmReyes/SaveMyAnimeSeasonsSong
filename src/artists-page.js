import * as api from './api.js';
import { renderArtistList } from './artists.js';
import * as ui from './ui.js';

const DOM = {
    artistsContainer: document.getElementById('artists-container'),
    artistSearch: document.getElementById('artist-search'),
    themeToggle: document.getElementById('theme-toggle'),
    scrollToTopBtn: document.getElementById('scroll-to-top-btn'),
};

let allArtists = [];
let searchTimeout;

async function init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme === 'dark' ? 'dark-mode' : '';
    ui.updateThemeIcons(savedTheme);

    DOM.themeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        const newTheme = isDarkMode ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        ui.updateThemeIcons(newTheme);
    });

    // Video modal handling
    ui.DOM.closeBtns.forEach(btn => btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        ui.closeModal(modal);
    }));

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            DOM.scrollToTopBtn.style.display = 'flex';
            setTimeout(() => DOM.scrollToTopBtn.classList.add('visible'), 10);
        } else {
            DOM.scrollToTopBtn.classList.remove('visible');
        }
    });

    DOM.scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    DOM.artistSearch.addEventListener('input', handleSearch);

    await loadArtists();
}

async function loadArtists() {
    DOM.artistsContainer.innerHTML = '<p>Cargando artistas...</p>';
    allArtists = await api.getArtistsWithCounts();
    renderArtistList(allArtists, DOM.artistsContainer);
}

function handleSearch(e) {
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.trim().toLowerCase();

    searchTimeout = setTimeout(() => {
        if (!searchTerm) {
            renderArtistList(allArtists, DOM.artistsContainer);
            return;
        }

        const filteredArtists = allArtists.filter(artist => {
            const artistName = typeof artist === 'string' ? artist : artist.name;
            return artistName.toLowerCase().includes(searchTerm);
        });

        renderArtistList(filteredArtists, DOM.artistsContainer);
    }, 300);
}

document.addEventListener('DOMContentLoaded', init);
