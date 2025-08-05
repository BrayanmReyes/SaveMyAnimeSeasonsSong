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
    const { data, error } = await _supabase
        .from('animes')
        .select('*, openings(*), endings(*)')
        .eq('season_id', seasonId)
        .order('created_at');
    if (error) console.error('Error fetching animes:', error);
    return data || [];
};

export const getAnimeDetails = async (animeId) => {
    const { data, error } = await _supabase
        .from('animes')
        .select('*, openings(*), endings(*)')
        .eq('id', animeId)
        .single();
    if (error) console.error('Error fetching anime details:', error);
    return data;
};

export const addSeason = async (name) => {
    const { error } = await _supabase.from('seasons').insert({ name });
    if (error) {
        console.error('Error creating season:', error);
        return false;
    }
    return true;
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

    const animeId = newAnime.id;
    if (openings.length > 0) {
        const openingsWithId = openings.map(o => ({ ...o, anime_id: animeId }));
        await _supabase.from('openings').insert(openingsWithId);
    }
    if (endings.length > 0) {
        const endingsWithId = endings.map(e => ({ ...e, anime_id: animeId }));
        await _supabase.from('endings').insert(endingsWithId);
    }
    return newAnime;
};

export const updateAnime = async (id, animeData, openings, endings) => {
    const { error: animeError } = await _supabase.from('animes').update(animeData).eq('id', id);
    if (animeError) {
        console.error('Error updating anime:', animeError);
        return false;
    }

    await _supabase.from('openings').delete().eq('anime_id', id);
    await _supabase.from('endings').delete().eq('anime_id', id);

    if (openings.length > 0) {
        const openingsWithId = openings.map(o => ({ ...o, anime_id: id }));
        await _supabase.from('openings').insert(openingsWithId);
    }
    if (endings.length > 0) {
        const endingsWithId = endings.map(e => ({ ...e, anime_id: id }));
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
