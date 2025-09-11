const SUPABASE_URL = 'https://qlbhdapjajsyhznbodvh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsYmhkYXBqYWpzeWh6bmJvZHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjY0NjcsImV4cCI6MjA2OTk0MjQ2N30.iZGe8rQColcutlWq13zpkq5RZaYur4jfOt04p0bW11s';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const getSeasons = async () => {
    const { data, error } = await _supabase.from('seasons').select('*').order('created_at');
    if (error) console.error('Error fetching seasons:', error);
    return data || [];
};

export const getAnimesBySeason = async (seasonId) => {
    if (!seasonId) return [];

    // 1. Fetch all anime entries for the season
    const { data: animesInSeason, error: initialError } = await _supabase
        .from('animes')
        .select('*')
        .eq('season_id', seasonId)
        .order('created_at');

    if (initialError) {
        console.error('Error fetching animes for season:', initialError);
        return [];
    }

    // 2. Process each anime to fetch correct songs/details
    const processedAnimes = await Promise.all(animesInSeason.map(async (anime) => {
        if (anime.main_anime_id) {
            // It's a continuation, fetch details from the main anime
            const { data: mainAnime, error: mainError } = await _supabase
                .from('animes')
                .select('name, comments, openings(*), endings(*)')
                .eq('id', anime.main_anime_id)
                .single();

            if (mainError) {
                console.error(`Error fetching main anime details for ${anime.id}:`, mainError);
                return { ...anime, name: 'Error loading details' }; // Return gracefully
            }

            // Merge data: keep continuation's ID and day, but use main's details
            return {
                ...anime, // keeps original id, season_id, day_of_week, main_anime_id
                name: mainAnime.name,
                comments: mainAnime.comments,
                openings: mainAnime.openings,
                endings: mainAnime.endings,
            };
        } else {
            // It's a main anime, just fetch its own songs
            const { data: songs, error: songError } = await _supabase
                .from('animes')
                .select('openings(*), endings(*)')
                .eq('id', anime.id)
                .single();

            if (songError) {
                console.error(`Error fetching songs for ${anime.id}:`, songError);
            }

            return { ...anime, ...songs };
        }
    }));

    return processedAnimes;
};

export const getAnimeDetails = async (animeId) => {
    const { data: anime, error } = await _supabase
        .from('animes')
        .select('*')
        .eq('id', animeId)
        .single();

    if (error) {
        console.error('Error fetching anime details:', error);
        return null;
    }

    if (anime.main_anime_id) {
        // It's a continuation, get shared data from main
        const { data: mainAnime, error: mainError } = await _supabase
            .from('animes')
            .select('name, comments, openings(*), endings(*)')
            .eq('id', anime.main_anime_id)
            .single();

        if (mainError) {
            console.error(`Error fetching main anime details for ${anime.id}:`, mainError);
            return null;
        }

        return {
            ...anime,
            name: mainAnime.name,
            comments: mainAnime.comments,
            openings: mainAnime.openings,
            endings: mainAnime.endings,
        };
    } else {
        // It's a main anime, get its own songs
        const { data: songs, error: songError } = await _supabase
            .from('animes')
            .select('openings(*), endings(*)')
            .eq('id', anime.id)
            .single();
        if (songError) {
            console.error(`Error fetching songs for ${anime.id}:`, songError);
            return null;
        }
        return { ...anime, ...songs };
    }
};

export const addSeason = async (name) => {
    const { error } = await _supabase.from('seasons').insert({ name });
    if (error) {
        console.error('Error creating season:', error);
        return false;
    }
    return true;
};

export const getSongsByArtist = async (artistName) => {
    const { data, error } = await _supabase.rpc('get_songs_by_artist', { p_artist_name: artistName });
    if (error) {
        console.error(`Error fetching songs for artist ${artistName}:`, error);
        return [];
    }
    return data || [];
};

export const searchAnimes = async (searchTerm) => {
    if (!searchTerm) return [];

    const { data, error } = await _supabase
        .from('animes')
        .select('*, openings(*), endings(*)')
        .is('main_anime_id', null) // Only search against main entries to avoid duplicates
        .ilike('name', `%${searchTerm}%`);

    if (error) {
        console.error('Error searching animes:', error);
        return [];
    }

    return data || [];
};

export const getAllArtists = async () => {
    const { data, error } = await _supabase.rpc('get_all_artists');
    if (error) {
        console.error('Error fetching artists:', error);
        return [];
    }
    // The RPC returns an array of objects like { artist_name: '...' }
    // We map it to a simple array of strings.
    return data.map(item => item.artist_name);
};

export const getContinuableAnimes = async () => {
    const { data, error } = await _supabase
        .from('animes')
        .select('id, name')
        .is('main_anime_id', null)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching continuable animes:', error);
        return [];
    }
    return data || [];
};

export const updateSeason = async (id, name) => {
    const { error } = await _supabase.from('seasons').update({ name }).eq('id', id);
    if (error) {
        console.error('Error updating season:', error);
        return false;
    }
    return true;
};

export const deleteSeason = async (id) => {
    const { error } = await _supabase.from('seasons').delete().eq('id', id);
    if (error) {
        console.error('Error deleting season:', error);
        return false;
    }
    return true;
};

export const addAnime = async (animeData, openings, endings) => {
    const { data: newAnime, error: animeError } = await _supabase
        .from('animes')
        .insert(animeData)
        .select()
        .single();

    if (animeError) {
        console.error('Error creating anime:', animeError);
        return null;
    }

    // Only add songs if it's not a continuation entry
    if (!newAnime.main_anime_id) {
        const animeId = newAnime.id;
        if (openings && openings.length > 0) {
            const openingsWithId = openings.map(o => ({ ...o, anime_id: animeId }));
            await _supabase.from('openings').insert(openingsWithId);
        }
        if (endings && endings.length > 0) {
            const endingsWithId = endings.map(e => ({ ...e, anime_id: animeId }));
            await _supabase.from('endings').insert(endingsWithId);
        }
    }
    return newAnime;
};

export const updateAnime = async (id, animeData, openings, endings) => {
    // First, find out if this is a continuation anime
    const { data: anime, error: fetchError } = await _supabase
        .from('animes')
        .select('main_anime_id')
        .eq('id', id)
        .single();

    if (fetchError) {
        console.error('Error fetching anime before update:', fetchError);
        return false;
    }

    // ID for updating songs and comments is the main anime's ID, or its own if it's a main anime
    const songUpdateId = anime.main_anime_id || id;

    // The animeData contains season-specific info (like day_of_week) that is safe to update on the entry itself.
    // The UI will control what's in here (i.e., not allow editing name/comments on continuations).
    const { error: animeError } = await _supabase.from('animes').update(animeData).eq('id', id);
    if (animeError) {
        console.error('Error updating anime metadata:', animeError);
        return false;
    }

    // If we are editing the main entry, also update its comments.
    // The UI will ensure `animeData.comments` is only present when editing a main entry.
    if (!anime.main_anime_id && animeData.comments !== undefined) {
        await _supabase.from('animes').update({ comments: animeData.comments }).eq('id', id);
    }

    // Now, update the songs on the correct (main) entry
    await _supabase.from('openings').delete().eq('anime_id', songUpdateId);
    await _supabase.from('endings').delete().eq('anime_id', songUpdateId);

    if (openings && openings.length > 0) {
        const openingsWithId = openings.map(o => ({ ...o, anime_id: songUpdateId }));
        await _supabase.from('openings').insert(openingsWithId);
    }
    if (endings && endings.length > 0) {
        const endingsWithId = endings.map(e => ({ ...e, anime_id: songUpdateId }));
        await _supabase.from('endings').insert(endingsWithId);
    }
    return true;
};

export const deleteAnime = async (id) => {
    const { error } = await _supabase.from('animes').delete().eq('id', id);
    if (error) {
        console.error('Error deleting anime:', error);
        return false;
    }
    return true;
};
