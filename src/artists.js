import * as api from './api.js';
import { youtubeIcon } from './ui.js';

const renderSongList = (songs, artistName, container) => {
    container.innerHTML = ''; // Clear artist list

    const title = document.createElement('h2');
    title.textContent = `Canciones por ${artistName}`;
    container.appendChild(title);

    if (!songs || songs.length === 0) {
        container.innerHTML += '<p>No se encontraron canciones para este artista.</p>';
        return;
    }

    const songList = document.createElement('ul');
    songList.className = 'artist-song-list'; // New class for styling

    songs.forEach(song => {
        const li = document.createElement('li');
        li.className = 'song-item'; // Reuse existing class
        li.innerHTML = `
            <div class="song-details">
                <span><strong>${song.song_type}</strong> de <strong>${song.anime_name}</strong></span>
                <span>${song.romaji_name}</span>
                ${song.youtube_url ? `<a href="${song.youtube_url}" target="_blank" title="${song.youtube_url}" class="youtube-link">${youtubeIcon}</a>` : ''}
            </div>
        `;
        songList.appendChild(li);
    });

    container.appendChild(songList);
};

export const renderArtistList = (artists, container) => {
    container.innerHTML = ''; // Clear previous content

    if (!artists || artists.length === 0) {
        container.innerHTML = '<p>No se encontraron artistas. Asegúrate de que los nombres de las canciones sigan el formato "Nombre Canción by Nombre Artista".</p>';
        return;
    }

    const title = document.createElement('h2');
    title.textContent = 'Artistas';
    container.appendChild(title);

    const artistList = document.createElement('div');
    artistList.className = 'artist-grid'; // Use a grid for artists

    artists.forEach(artistObj => {
        // artistObj is expected to be { name: '...', count: N }
        // Handle backward compatibility just in case (if it's a string)
        const artistName = typeof artistObj === 'string' ? artistObj : artistObj.name;
        const count = typeof artistObj === 'string' ? '?' : artistObj.count;

        const card = document.createElement('div');
        card.className = 'artist-card';
        card.setAttribute('title', artistName); // Tooltip for truncated text

        const nameSpan = document.createElement('span');
        nameSpan.className = 'artist-name';
        nameSpan.textContent = artistName;

        const countBadge = document.createElement('span');
        countBadge.className = 'artist-count-badge';
        countBadge.textContent = count;
        countBadge.title = `${count} canciones`;

        card.appendChild(nameSpan);
        card.appendChild(countBadge);

        card.addEventListener('click', async () => {
            const songs = await api.getSongsByArtist(artistName);
            renderSongList(songs, artistName, container);
        });
        artistList.appendChild(card);
    });

    container.appendChild(artistList);
};
