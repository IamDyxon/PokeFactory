
const gameSelect = document.getElementById('gameSelect');
const pokemonSelect = $('#pokemonSelect');
const pokemonInfo = document.getElementById('pokemonInfo');
let currentPokemon = null;

const paldeaIds = [906,907,908,909,910,911,912,913,914,915];

async function fetchPokemonName(id) {
  const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return capitalize(res.data.name);
}

async function fetchPokemonData(id) {
  const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const p = res.data;
  return {
    name: capitalize(p.name),
    type: p.types.map(t => t.type.name),
    stats: Object.fromEntries(p.stats.map(s => [s.stat.name, s.base_stat])),
    sprite: p.sprites.other["official-artwork"].front_default,
    shiny: p.sprites.other["official-artwork"].front_shiny
  };
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function mapType(typeEn) {
  const map = {
    steel: "acero", water: "agua", psychic: "psíquico", bug: "bicho", dragon: "dragón",
    electric: "eléctrico", ghost: "fantasma", fire: "fuego", fairy: "hada",
    ice: "hielo", fighting: "lucha", normal: "normal", grass: "planta", rock: "roca",
    dark: "siniestro", ground: "tierra", poison: "veneno", flying: "volador"
  };
  return map[typeEn] || typeEn;
}

function formatPokemonOption(option) {
  if (!option.id) return option.text;
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${option.id}.png`;
  return $(`
    <span><img src="${spriteUrl}" style="width: 32px; height: 32px; vertical-align: middle; margin-right: 8px;" />${option.text}</span>
  `);
}

function formatPokemonSelection(option) {
  return option.text;
}

function renderPokemonInfo() {
  const isShiny = document.getElementById('shinyCheckbox').checked;
  const sprite = isShiny ? currentPokemon.shiny : currentPokemon.sprite;

  pokemonInfo.innerHTML = `
    <h3>${currentPokemon.name}</h3>
    <img src="${sprite}" alt="${currentPokemon.name}" style="width: 200px; display: block; margin: 0 auto;" />
    <p>Tipo: ${currentPokemon.type.map(t => `
      <img src="types/${mapType(t)}.png" alt="${mapType(t)}" style="width: 96px; vertical-align: middle;" />
    `).join(" ")}</p>
    <p class="stats">
      <span>HP: ${currentPokemon.stats.hp}</span>
      <span>ATK: ${currentPokemon.stats.attack}</span>
      <span>DEF: ${currentPokemon.stats.defense}</span>
      <span>SpA: ${currentPokemon.stats["special-attack"]}</span>
      <span>SpD: ${currentPokemon.stats["special-defense"]}</span>
      <span>SPE: ${currentPokemon.stats.speed}</span>
    </p>
  `;
}

function updateCopyText() {
  const game = gameSelect.value;
  const pokemonName = currentPokemon ? currentPokemon.name : "";
  const isShiny = document.getElementById('shinyCheckbox').checked;

  let text = "";
  if (game) {
    if (pokemonName) {
      text += `%trade ${pokemonName}`;
    } else {
      text += `%trade`;
    }
    if (isShiny) {
      text += `\nShiny: Yes`;
    }
  }
  document.getElementById('copyText').value = text;
}

gameSelect.addEventListener('change', async () => {
  pokemonSelect.empty().append('<option value="">Selecciona un Pokémon</option>');
  pokemonSelect.prop('disabled', true);
  pokemonInfo.innerHTML = "";

  if (gameSelect.value === "scarlet-violet") {
    for (let id of paldeaIds) {
      const name = await fetchPokemonName(id);
      const opt = new Option(name, id, false, false);
      pokemonSelect.append(opt);
    }
    pokemonSelect.prop('disabled', false);
    pokemonSelect.select2({
      width: '100%',
      placeholder: 'Selecciona un Pokémon',
      templateResult: formatPokemonOption,
      templateSelection: formatPokemonSelection
    });
  }
  updateCopyText();
});

pokemonSelect.on('change', async function () {
  const id = $(this).val();
  if (!id) return;
  currentPokemon = await fetchPokemonData(id);
  renderPokemonInfo();
  updateCopyText();
});

document.getElementById('shinyCheckbox').addEventListener('change', () => {
  updateCopyText();
  if (currentPokemon) renderPokemonInfo();
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const copyText = document.getElementById('copyText');
  copyText.select();
  document.execCommand('copy');
  alert("¡Texto copiado!");
});


const nicknameInput = document.getElementById('nickname');
const tradeCodeInput = document.getElementById('tradeCode');

nicknameInput.addEventListener('input', () => {
  nicknameInput.value = nicknameInput.value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  updateCopyText();
});

tradeCodeInput.addEventListener('input', () => {
  tradeCodeInput.value = tradeCodeInput.value.replace(/\D/g, '').substring(0, 8);
  updateCopyText();
});

// Reemplazamos la función updateCopyText
updateCopyText = function() {
  const game = gameSelect.value;
  const pokemonName = currentPokemon ? currentPokemon.name : "";
  const isShiny = document.getElementById('shinyCheckbox').checked;
  const nickname = nicknameInput.value;
  const tradeCode = tradeCodeInput.value;

  let text = "";
  if (game) {
    text += `%trade`;
    if (pokemonName) {
      let line = "";
      if (tradeCode) line += tradeCode + " ";
      if (nickname) {
        line += nickname + " (" + pokemonName + ")";
      } else if (tradeCode) {
        line += "(" + pokemonName + ")";
      } else {
        line += pokemonName;
      }
      text += ` ${line}`;
    }
    if (isShiny) {
      text += `\nShiny: Yes`;
    }
  }
  document.getElementById('copyText').value = text.trim();
};
