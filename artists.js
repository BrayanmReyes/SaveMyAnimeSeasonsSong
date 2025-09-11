export const renderArtistList = (artists, container) => {
    container.innerHTML = ''; // Clear previous content

    if (!artists || artists.length === 0) {
        container.innerHTML = '<p>No se encontraron artistas. Asegúrate de que los nombres de las canciones sigan el formato "Nombre Canción by Nombre Artista".</p>';
        return;
    }

    const title = document.createElement('h2');
    title.textContent = 'Artistas';
    container.appendChild(title);

    const artistList = document.createElement('ul');
    artistList.className = 'artist-list'; // You can style this class later

    artists.forEach(artistName => {
        const li = document.createElement('li');
        li.className = 'artist-list-item';
        li.textContent = artistName;
        // In the future, we'll add a click listener here
        artistList.appendChild(li);
    });

    container.appendChild(artistList);
};
