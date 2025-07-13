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

  if (game === 'scarlet-violet') {
    axios.get('/data/scarlet_violet_pokemon.json') // ruta corregida
      .then(response => {
        const pokemons = response.data[game];
        $(pokemonSelect).empty();
        pokemons.forEach((poke, index) => {
          const option = new Option(poke.name, poke.name, false, false);
          $(option).attr('data-id', poke.name.toLowerCase()); // temporalmente asigna un id falso
          $(pokemonSelect).append(option);
        });
        $(pokemonSelect).prop('disabled', false);
        $(pokemonSelect).select2({
          templateResult: formatState,
          templateSelection: formatState
        });
      });
  } else {
    $(pokemonSelect).empty().prop('disabled', true);
  }

  updateCopyText();
});

$(pokemonSelect).on('select2:select', function (e) {
  const selectedName = e.params.data.id;

  // Obtener sprite y tipos desde PokéAPI
  axios.get(`https://pokeapi.co/api/v2/pokemon/${selectedName.toLowerCase()}`)
    .then(response => {
      const data = response.data;
      currentPokemon = {
        id: data.id,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        stats: {
          hp: data.stats[0].base_stat,
          atk: data.stats[1].base_stat,
          def: data.stats[2].base_stat,
          spAtk: data.stats[3].base_stat,
          spDef: data.stats[4].base_stat,
          speed: data.stats[5].base_stat
        },
        types: data.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1))
      };

      renderPokemonInfo();
      loadAbilities(currentPokemon.id);
      loadMoves(currentPokemon.id);
      updateCopyText();
    });
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

    if (gender && gender !== "Aleatorio") {
      const initial = gender === "Male" ? "M" : gender === "Female" ? "F" : "";
      if (initial) line += " (" + initial + ")";
    }

    if (item) {
      line += " @ " + item;
    }

    text += ` ${line}`;
    

    if (isShiny) text += `\nShiny: Yes`;
    if (language) text += `\nLanguage: ${language}`;
    if (level) text += `\nLevel: ${level}`;
    if (abilityEs) text += `\nAbility: ${abilityEn.split(" ")[0]}`;
if (nature) {
  text += `\n${nature} Nature`;
}

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
  
  const selectedMoves = moveDropdowns.map(d => d.value).filter(v => v);
  if (selectedMoves.length > 0) {
    selectedMoves.forEach(mov => {
      const eng = moveNameMap[mov] || mov;
      const formatted = eng.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      text += `\n- ${formatted}`;
    });
  }

  const evText = getEVs();
  const ivText = getIVs();
  if (evText) text += "\n" + evText;
  if (ivText) text += "\n" + ivText;
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


const moveDropdowns = [
  document.getElementById('move1'),
  document.getElementById('move2'),
  document.getElementById('move3'),
  document.getElementById('move4')
];
let allMoves = [];
let moveNameMap = {};

moveDropdowns.forEach(dropdown => {
  dropdown.addEventListener('change', updateMoveDropdowns);
});

function loadMoves(pokemonId) {
  axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    .then(res => {
      const movePromises = res.data.moves.map(m => axios.get(m.move.url));
      return Promise.all(movePromises);
    })
    .then(responses => {
      allMoves = [];
      moveNameMap = {};
      responses.forEach(response => {
        const englishName = response.data.name;
        const spanishEntry = response.data.names.find(n => n.language.name === "es");
        const spanishName = spanishEntry ? spanishEntry.name : englishName;
        moveNameMap[spanishName] = englishName;
        if (!allMoves.includes(spanishName)) allMoves.push(spanishName);
      });
      updateMoveDropdowns();
    });
}

function updateMoveDropdowns() {
  const selected = moveDropdowns.map(d => d.value).filter(v => v);
  moveDropdowns.forEach(dropdown => {
    const currentValue = dropdown.value;
    dropdown.innerHTML = `<option value="">Selecciona un movimiento</option>`;
    allMoves.forEach(mov => {
      if (!selected.includes(mov) || mov === currentValue) {
        const opt = document.createElement("option");
        opt.value = mov;
        opt.textContent = mov;
        dropdown.appendChild(opt);
      }
    });
    dropdown.value = currentValue;
  });
  updateCopyText();
}



// Captura de valores de EVs e IVs
function getEVs() {
  const statMap = {
    hp: "HP",
    atk: "Atk",
    def: "Def",
    spAtk: "SpA",
    spDef: "SpD",
    speed: "Spe"
  };
  const sliders = document.querySelectorAll(".ev-slider");
  let evs = [];
  sliders.forEach(slider => {
    const value = parseInt(slider.value);
    const stat = statMap[slider.dataset.stat];
    if (value > 0 && stat) {
      evs.push(value + " " + stat);
    }
  });
  return evs.length > 0 ? "EVs: " + evs.join(" / ") : "";
}

function getIVs() {
  const statMap = {
    hp: "HP",
    atk: "Atk",
    def: "Def",
    spAtk: "SpA",
    spDef: "SpD",
    speed: "Spe"
  };
  const inputs = document.querySelectorAll(".iv-input");
  let ivs = [];
  inputs.forEach(input => {
    const stat = statMap[input.dataset.stat];
    if ((input.dataset.touched === "true" || input.value != "31") && stat) {
      ivs.push(input.value + " " + stat);
    }
  });
  return ivs.length > 0 ? "IVs: " + ivs.join(" / ") : "";
}

// Escuchar cambios
document.querySelectorAll(".iv-input").forEach(input => {
  input.addEventListener("input", () => {
    input.dataset.touched = "true";
  });
  updateCopyText();
  updateCopyText();
});


// Código anterior omitido por brevedad...
// --- INICIO CAMBIOS ---
document.querySelectorAll(".ev-slider").forEach(slider => {
  const output = slider.nextElementSibling;
  slider.addEventListener("input", () => {
    const sliders = document.querySelectorAll(".ev-slider");
    let total = 0;
    sliders.forEach(s => {
      total += parseInt(s.value);
    });

    if (total > 508) {
      // Si excede, revertimos el valor al anterior
      slider.value = slider.dataset.lastValid || 0;
    } else {
      slider.dataset.lastValid = slider.value;
    }

    output.textContent = slider.value;

    // Mostrar advertencia si excede
    const warning = document.getElementById("evWarning");
    if (total > 508) {
      warning.style.display = "block";
    } else {
      warning.style.display = "none";
    }

    updateCopyText(); // Refrescar el texto de resumen
  });
});
// --- FIN CAMBIOS ---




// Cargar objetos desde JSON
function cargarItemsDesdeJson() {
  if (!itemSelect) return;
  fetch("data/all_items_sv.json")
    .then(response => response.json())
    .then(data => {
      itemSelect.innerHTML = '<option value="">(ninguno)</option>';
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        itemSelect.appendChild(option);
      });
    })
    .catch(err => console.error("Error cargando items:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  cargarItemsDesdeJson();
  cargarItemsDesdeJson();
cargarNaturalezasDesdeJson();
renderEVsAndIVs();


  // Cargar naturalezas desde JSON
function cargarNaturalezasDesdeJson() {
  fetch("data/natures.json")
    .then(response => response.json())
    .then(data => {
      natureSelect.innerHTML = '<option value="">Selecciona una naturaleza</option>';
      data.forEach(nature => {
        const option = document.createElement("option");
        option.value = nature.value; // ejemplo: "Hasty"
        option.textContent = nature.label; // ejemplo: "Activa (+Vel -Def)"
        natureSelect.appendChild(option);
      });
    })
    .catch(err => console.error("Error cargando naturalezas:", err));
}
});



document.addEventListener("DOMContentLoaded", () => {
  /* 1. Código Intercambio: solo números y máx 8 dígitos */
  const tradeCode = document.getElementById("tradeCode");
  if (tradeCode) {
    tradeCode.addEventListener("input", () => {
      tradeCode.value = tradeCode.value.replace(/\D/g, "").slice(0, 8);
    });
  }

  /* 2. Idiomas disponibles */
  const languageSelect = document.getElementById("languageSelect");
  if (languageSelect) {
    const idiomas = ["English", "French", "Spanish", "Italian", "Japanese", "German", "Korean", "ChineseS", "ChineseT"];
    languageSelect.innerHTML = '<option value="">Selecciona un idioma</option>';
    idiomas.forEach(lang => {
      const opt = document.createElement("option");
      opt.value = lang;
      opt.textContent = lang;
      languageSelect.appendChild(opt);
    });
  }

  /* 3. Niveles 1 al 100 */
  const levelSelect = document.getElementById("levelSelect");
  if (levelSelect) {
    levelSelect.innerHTML = '<option value="">Selecciona un nivel</option>';
    for (let i = 1; i <= 100; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      levelSelect.appendChild(opt);
    }
  }

  /* 4. Fecha mínima/máxima desde 2016 a hoy */
  const metDate = document.getElementById("metDate");
  if (metDate) {
    metDate.min = "2016-01-01";
    metDate.max = "2025-12-31";
  }
});

/* 5. Ajustar formato del texto final para objeto */
function buildShowdownText(data) {
  const lines = [];

  let encabezado = `%trade ${data.tradeCode} ${data.nickname} (${data.pokemon})`;
  if (data.item) {
    encabezado += ` @ ${data.item}`;
  }
  lines.push(encabezado);

  if (data.shiny) lines.push("Shiny: Yes");
  if (data.language) lines.push(`Language: ${data.language}`);
  if (data.level) lines.push(`Level: ${data.level}`);
  if (data.gender) lines.push(`Gender: ${data.gender}`);
  if (data.ability) lines.push(`Ability: ${data.ability}`);
  if (data.nature) lines.push(`Nature: ${data.nature}`);

  return lines.join("\n");
}

function renderEVsAndIVs() {
  const stats = ["hp", "atk", "def", "spAtk", "spDef", "speed"];
  const statLabels = {
    hp: "HP",
    atk: "Atk",
    def: "Def",
    spAtk: "SpA",
    spDef: "SpD",
    speed: "Spe"
  };

  const evContainer = document.getElementById("evSliders");
  const ivContainer = document.getElementById("ivInputs");

  evContainer.innerHTML = "";
  ivContainer.innerHTML = "";

  stats.forEach(stat => {
    // EV Slider
    const evDiv = document.createElement("div");
    evDiv.classList.add("slider-container");

    const evLabel = document.createElement("label");
    evLabel.textContent = statLabels[stat];
    evLabel.setAttribute("for", `ev-${stat}`);

    const evSlider = document.createElement("input");
    evSlider.type = "range";
    evSlider.min = 0;
    evSlider.max = 252;
    evSlider.value = 0;
    evSlider.classList.add("ev-slider");
    evSlider.setAttribute("data-stat", stat);
    evSlider.id = `ev-${stat}`;

    const evValue = document.createElement("span");
    evValue.classList.add("ev-value");
    evValue.textContent = "0";

    evSlider.addEventListener("input", () => {
      const total = Array.from(document.querySelectorAll(".ev-slider"))
        .map(s => parseInt(s.value))
        .reduce((a, b) => a + b, 0);

      if (total > 508) {
        evSlider.value = evSlider.dataset.lastValid || 0;
      } else {
        evSlider.dataset.lastValid = evSlider.value;
        evValue.textContent = evSlider.value;
      }

      const warning = document.getElementById("evWarning");
      if (total > 508) {
        warning.style.display = "block";
      } else {
        warning.style.display = "none";
      }

      updateCopyText();
    });

    evDiv.appendChild(evLabel);
    evDiv.appendChild(evSlider);
    evDiv.appendChild(evValue);
    evContainer.appendChild(evDiv);

    // IV Input
    const ivDiv = document.createElement("div");
    ivDiv.classList.add("iv-container");

    const ivLabel = document.createElement("label");
    ivLabel.textContent = statLabels[stat];
    ivLabel.setAttribute("for", `iv-${stat}`);

    const ivInput = document.createElement("input");
    ivInput.type = "number";
    ivInput.min = 0;
    ivInput.max = 31;
    ivInput.value = 31;
    ivInput.classList.add("iv-input");
    ivInput.setAttribute("data-stat", stat);
    ivInput.id = `iv-${stat}`;

    ivInput.addEventListener("input", () => {
      ivInput.dataset.touched = "true";
      updateCopyText();
    });

    ivDiv.appendChild(ivLabel);
    ivDiv.appendChild(ivInput);
    ivContainer.appendChild(ivDiv);
  });
}
