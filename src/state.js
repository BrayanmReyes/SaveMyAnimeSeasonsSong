const state = {
    currentSeasonId: null,
    editingAnimeId: null,
    editingSeasonId: null,
    isContinuationMode: false,
};

export function getState() {
    return state;
}

export function setState(newState) {
    Object.assign(state, newState);
}
