import { getSeasons } from './src/api.js';

async function run() {
  const seasons = await getSeasons();
  console.log(seasons);
}
run();
