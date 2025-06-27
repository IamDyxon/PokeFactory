const gameSelect = document.getElementById('gameSelect');
const pokemonSelect = document.getElementById('pokemonSelect');
const shinyCheckbox = document.getElementById('shinyCheckbox');
const nicknameInput = document.getElementById('nickname');
const tradeCodeInput = document.getElementById('tradeCode');
const languageSelect = document.getElementById('languageSelect');
const levelSelect = document.getElementById('levelSelect');
const genderSelect = document.getElementById('genderSelect');
const abilitySelect = document.getElementById('abilitySelect');
const natureSelect = document.getElementById('natureSelect');
const itemSelect = document.getElementById('itemSelect');
const copyText = document.getElementById('copyText');
const pokemonInfo = document.getElementById('pokemonInfo');
const metDateInput = document.getElementById('metDate');
let metDateTouched = false;
if (metDateInput) {
  metDateInput.addEventListener('change', () => {
    metDateTouched = true;
    updateCopyText();
  });
}

const copyBtn = document.getElementById('copyBtn');

let currentPokemon = null;
let abilityMap = {}; // español -> inglés

gameSelect.addEventListener('change', function() {
  const game = gameSelect.value;
  if (game) {
    const pokemons = [
      { id: 906, name: "Sprigatito", stats: { hp: 40, atk: 61, def: 54, spAtk: 45, spDef: 45, speed: 65 }, types: ["Grass"] },
      { id: 909, name: "Fuecoco", stats: { hp: 67, atk: 45, def: 59, spAtk: 63, spDef: 40, speed: 36 }, types: ["Fire"] },
      { id: 912, name: "Quaxly", stats: { hp: 55, atk: 65, def: 45, spAtk: 50, spDef: 45, speed: 50 }, types: ["Water"] }
    ];

    $(pokemonSelect).empty();
    pokemons.forEach(poke => {
      const option = new Option(poke.name, poke.name, false, false);
      $(option).attr('data-id', poke.id);
      $(option).attr('data-image', `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`);
      $(pokemonSelect).append(option);
    });
    $(pokemonSelect).prop('disabled', false);
    $(pokemonSelect).select2({
      templateResult: formatState,
      templateSelection: formatState
    });
  } else {
    $(pokemonSelect).empty().prop('disabled', true);
  }
  updateCopyText();
});

$(pokemonSelect).on('select2:select', function (e) {
  const selectedName = e.params.data.id;
  const pokemons = [
    { id: 906, name: "Sprigatito", stats: { hp: 40, atk: 61, def: 54, spAtk: 45, spDef: 45, speed: 65 }, types: ["Grass"] },
    { id: 909, name: "Fuecoco", stats: { hp: 67, atk: 45, def: 59, spAtk: 63, spDef: 40, speed: 36 }, types: ["Fire"] },
    { id: 912, name: "Quaxly", stats: { hp: 55, atk: 65, def: 45, spAtk: 50, spDef: 45, speed: 50 }, types: ["Water"] }
  ];
  currentPokemon = pokemons.find(p => p.name === selectedName);
  renderPokemonInfo();

  if (currentPokemon) {
    loadAbilities(currentPokemon.id);
  }

  updateCopyText();
});

shinyCheckbox.addEventListener('change', () => {
  renderPokemonInfo();
  updateCopyText();
});
nicknameInput.addEventListener('input', updateCopyText);
tradeCodeInput.addEventListener('input', updateCopyText);
languageSelect.addEventListener('change', updateCopyText);
levelSelect.addEventListener('change', updateCopyText);
genderSelect.addEventListener('change', updateCopyText);
abilitySelect.addEventListener('change', updateCopyText);
natureSelect.addEventListener('change', updateCopyText);
itemSelect.addEventListener('change', updateCopyText);

copyBtn.addEventListener('click', function() {
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
});

function renderPokemonInfo() {
  if (!currentPokemon) {
    pokemonInfo.innerHTML = "";
    return;
  }
  const isShiny = shinyCheckbox.checked;
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? 'shiny/' : ''}${currentPokemon.id}.png`;
  const typeMap = {
    "Grass": "planta", "Fire": "fuego", "Water": "agua", "Bug": "bicho", "Dragon": "dragón",
    "Electric": "eléctrico", "Ghost": "fantasma", "Fairy": "hada", "Ice": "hielo", "Fighting": "lucha",
    "Normal": "normal", "Psychic": "psíquico", "Rock": "roca", "Dark": "siniestro", "Ground": "tierra",
    "Poison": "veneno", "Flying": "volador", "Steel": "acero", "Astral": "astral"
  };

  let html = `<img src="${spriteUrl}" alt="${currentPokemon.name}" style="max-width:200px;" /><div class="stats">`;
  for (const [stat, value] of Object.entries(currentPokemon.stats)) {
    html += `<span>${stat.toUpperCase()}: ${value}</span>`;
  }
  html += `</div><div class="types">`;
  currentPokemon.types.forEach(type => {
    const tipoEsp = typeMap[type] || type.toLowerCase();
    html += `<img src="types/${tipoEsp}.png" alt="${type}" style="height:20px; margin-right:4px;" />`;
  });
  html += `</div>`;
  pokemonInfo.innerHTML = html;
}

function updateCopyText() {
  const game = gameSelect.value;
  const pokemonName = currentPokemon ? currentPokemon.name : "";
  const isShiny = shinyCheckbox.checked;
  const nickname = nicknameInput.value;
  const tradeCode = tradeCodeInput.value;
  const language = languageSelect.value;
  const level = levelSelect.value;
  const gender = genderSelect.value;
  const abilityEs = abilitySelect.value;
  const abilityEn = abilityMap[abilityEs] || abilityEs;
  const nature = natureSelect.value;
  const item = itemSelect.value;

  let text = "";

  if (game && pokemonName) {
    text += `%trade`;
    let line = "";
    if (tradeCode) line += tradeCode + " ";
    if (nickname) {
      line += nickname + " (" + pokemonName + ")";
    } else {
      line += pokemonName;
    }
    text += ` ${line}`;

    if (isShiny) text += `\nShiny: Yes`;
    if (language) text += `\nLanguage: ${language}`;
    if (level) text += `\nLevel: ${level}`;
    if (gender) text += `\nGender: ${gender}`;
    if (abilityEs) text += `\nAbility: ${abilityEn.split(" ")[0]}`;
    if (nature) {
      const match = nature.match(/^(\w+)/);
      const natureName = match ? match[1] : nature;
      text += `\nNature: ${natureName}`;
    }
    if (item) text += `\nItem: ${item}`;
  }

  if (scaleTouched && currentPokemon) {
    const scale = scaleRange.value;
    text += `\n.Scale=${scale}`;
  }
  if (metDateTouched && currentPokemon && metDateInput && metDateInput.value) {
    const dateValue = metDateInput.value;
    if (dateValue >= "2016-01-01") {
      text += `\n.MetDate=${dateValue.replace(/-/g, '')}`;
    }
  }
  copyText.value = text.trim();
}

function formatState(state) {
  if (!state.id) return state.text;
  const img = $(state.element).data('image');
  if (img) {
    return $('<span><img src="' + img + '" class="img-flag" style="width:20px;"/> ' + state.text + '</span>');
  }
  return state.text;
}

function loadAbilities(pokemonId) {
  axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    .then(response => {
      const abilityData = response.data.abilities;
      abilitySelect.innerHTML = '<option value="">Selecciona una habilidad</option>';
      abilityMap = {}; // limpiar mapa

      Promise.all(abilityData.map(ab => axios.get(ab.ability.url))).then(responses => {
        responses.forEach((res, i) => {
          const englishName = res.data.name;
          const spanishEntry = res.data.names.find(n => n.language.name === "es");
          const spanishName = spanishEntry ? spanishEntry.name : englishName;

          abilityMap[spanishName] = englishName;

          const option = document.createElement('option');
          option.value = spanishName;
          option.textContent = `${spanishName}`;
          abilitySelect.appendChild(option);
        });
      });
    });
}


const scaleRange = document.getElementById('scaleRange');
const scaleValue = document.getElementById('scaleValue');
let scaleTouched = false;

if (scaleRange && scaleValue) {
  scaleRange.addEventListener('input', () => {
    scaleTouched = true;
    scaleValue.value = scaleRange.value;
    updateCopyText();
  });
}
