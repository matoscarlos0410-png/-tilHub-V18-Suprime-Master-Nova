/* =========================================================
   ÚTILHUB V18 — NOVA FLOW
   SCRIPT.JS
========================================================= */

"use strict";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const STORAGE_KEY = "utilhub-v18";
const OLD_KEYS = [
  "utilhub-v17",
  "utilhub-v15-advanced",
  "utilhub-v15",
  "utilhub-v14"
];

const NOVA_MODES = {
  cosmic: "COSMIC",
  aurora: "AURORA",
  pulse: "PULSE",
  matrix: "MATRIX",
  nebula: "NEBULA",
  waves: "WAVES",
  starfield: "STARFIELD",
  vortex: "VORTEX",
  firefly: "FIREFLY",
  rain: "RAIN",
  grid: "GRID",
  spiral: "SPIRAL",
  orbit: "ORBIT",
  plasma: "PLASMA",
  dna: "DNA",
  snow: "SNOW",
  lightning: "LIGHTNING",
  galaxy: "GALAXY",
  comet: "COMET",
  quantum: "QUANTUM"
};

const defaultState = {
  theme: "dark",
  motion: true,
  performance: "balanced",
  effects: true,
  focus: false,

  novaMode: "cosmic",
  novaIntensity: 0.8,

  favorites: [],
  recent: [],

  notes: "",
  tasks: [],
  shopping: [],

  dictionaryRecent: [],

  timer: {
    remaining: 0,
    running: false
  },

  stopwatch: {
    elapsed: 0,
    running: false
  }
};


/* =========================================================
   UTILIDADES GENERALES
========================================================= */

function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatNumber(value, decimals = 8) {
  if (!Number.isFinite(Number(value))) {
    return "0";
  }

  const number = Number(value);

  return number
    .toFixed(decimals)
    .replace(/\.?0+$/, "");
}

function formatTime(totalSeconds) {
  totalSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function safeJSONParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch {
    showToast("No se pudo guardar la configuración.");
  }
}

function mergeState(base, extra) {
  if (!extra || typeof extra !== "object") {
    return base;
  }

  const result = {
    ...base,
    ...extra
  };

  result.favorites = Array.isArray(extra.favorites)
    ? extra.favorites
    : base.favorites;

  result.recent = Array.isArray(extra.recent)
    ? extra.recent
    : base.recent;

  result.tasks = Array.isArray(extra.tasks)
    ? extra.tasks
    : base.tasks;

  result.shopping = Array.isArray(extra.shopping)
    ? extra.shopping
    : base.shopping;

  result.dictionaryRecent = Array.isArray(extra.dictionaryRecent)
    ? extra.dictionaryRecent
    : base.dictionaryRecent;

  result.timer = {
    ...base.timer,
    ...(extra.timer || {})
  };

  result.stopwatch = {
    ...base.stopwatch,
    ...(extra.stopwatch || {})
  };

  return result;
}

function loadState() {
  let saved = null;

  try {
    saved = safeJSONParse(
      localStorage.getItem(STORAGE_KEY),
      null
    );

    if (!saved) {
      for (const key of OLD_KEYS) {
        const old = safeJSONParse(
          localStorage.getItem(key),
          null
        );

        if (old) {
          saved = old;
          break;
        }
      }
    }
  } catch {
    saved = null;
  }

  return mergeState(defaultState, saved);
}

let state = loadState();


/* =========================================================
   DOM
========================================================= */

const body = document.body;

const novaCanvas = $("#nova");
const glow = $("#glow");

const themeBtn = $("#themeBtn");
const motionBtn = $("#motionBtn");
const focusBtn = $("#focusBtn");

const toolSearch = $("#toolSearch");
const clearSearch = $("#clearSearch");
const searchFocusBtn = $("#searchFocusBtn");

const toolsGrid = $("#toolsGrid");
const categories = $("#categories");
const noResults = $("#noResults");

const quickTools = $("#quickTools");
const clearRecentBtn = $("#clearRecent");

const toolPanel = $("#toolPanel");
const toolPanelIcon = $("#toolPanelIcon");
const toolPanelCategory = $("#toolPanelCategory");
const toolPanelTitle = $("#toolPanelTitle");
const closeTool = $("#closeTool");
const toolContent = $("#toolContent");

const modal = $("#modal");
const modalContent = $("#modalContent");

const toast = $("#toast");

const novaModeName = $("#novaModeName");
const novaIntensity = $("#novaIntensity");
const novaIntensityValue = $("#novaIntensityValue");
const performanceSelect = $("#performanceSelect");

let activeCategory = "all";
let activeTool = null;
let toastTimer = null;


/* =========================================================
   TOAST
========================================================= */

function showToast(message, duration = 2500) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}


/* =========================================================
   TEMA
========================================================= */

function applyTheme() {
  body.classList.toggle(
    "light",
    state.theme === "light"
  );

  if (themeBtn) {
    themeBtn.textContent =
      state.theme === "dark" ? "☀" : "☾";

    themeBtn.title =
      state.theme === "dark"
        ? "Cambiar a modo claro"
        : "Cambiar a modo oscuro";
  }
}

themeBtn?.addEventListener("click", () => {
  state.theme =
    state.theme === "dark"
      ? "light"
      : "dark";

  applyTheme();
  saveState();

  showToast(
    state.theme === "dark"
      ? "Modo oscuro activado."
      : "Modo claro activado."
  );
});


/* =========================================================
   MOVIMIENTO
========================================================= */

function applyMotion() {
  body.classList.toggle(
    "motion-off",
    !state.motion
  );

  if (motionBtn) {
    motionBtn.textContent =
      state.motion ? "✦" : "○";

    motionBtn.title =
      state.motion
        ? "Desactivar animaciones"
        : "Activar animaciones";
  }
}

motionBtn?.addEventListener("click", () => {
  state.motion = !state.motion;

  applyMotion();
  saveState();

  showToast(
    state.motion
      ? "Animaciones activadas."
      : "Animaciones reducidas."
  );
});


/* =========================================================
   MODO CONCENTRACIÓN
========================================================= */

function applyFocus() {
  body.classList.toggle(
    "focus-mode",
    state.focus
  );

  if (focusBtn) {
    focusBtn.textContent =
      state.focus ? "◎" : "◉";

    focusBtn.title =
      state.focus
        ? "Salir del modo concentración"
        : "Activar modo concentración";
  }
}

focusBtn?.addEventListener("click", () => {
  state.focus = !state.focus;

  applyFocus();
  saveState();

  showToast(
    state.focus
      ? "Modo concentración activado."
      : "Modo concentración desactivado."
  );
});


/* =========================================================
   NOVA FLOW
========================================================= */

let novaMode = state.novaMode || "cosmic";
let novaIntensityValue =
  Number(state.novaIntensity) || 0.8;

let performanceMode =
  state.performance || "balanced";

const novaButtons = $$(".novaModes .mode");

function updateNovaUI() {
  novaButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.mode === novaMode
    );
  });

  if (novaModeName) {
    novaModeName.textContent =
      NOVA_MODES[novaMode] ||
      "COSMIC";
  }

  if (novaIntensity) {
    novaIntensity.value =
      novaIntensityValue;
  }

  if (novaIntensityValue) {
    novaIntensityValue.textContent =
      `${Math.round(novaIntensityValue * 100)}%`;
  }

  if (performanceSelect) {
    performanceSelect.value =
      performanceMode;
  }
}

novaButtons.forEach(button => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode;

    if (!NOVA_MODES[mode]) {
      return;
    }

    novaMode = mode;
    state.novaMode = mode;

    updateNovaUI();
    saveState();

    novaReset();

    showToast(
      `NOVA FLOW: ${NOVA_MODES[mode]}`
    );
  });
});

novaIntensity?.addEventListener("input", event => {
  novaIntensityValue =
    Number(event.target.value);

  state.novaIntensity =
    novaIntensityValue;

  updateNovaUI();
  saveState();
});

performanceSelect?.addEventListener("change", event => {
  performanceMode =
    event.target.value;

  state.performance =
    performanceMode;

  saveState();

  novaReset();

  showToast(
    `Rendimiento: ${performanceMode}`
  );
});


/* =========================================================
   BÚSQUEDA DE HERRAMIENTAS
========================================================= */

function filterTools() {
  const query =
    String(toolSearch?.value || "")
      .trim()
      .toLowerCase();

  const cards = $$(".tool-card");

  let visible = 0;

  cards.forEach(card => {
    const name =
      `${card.dataset.name || ""} ${card.textContent || ""}`
        .toLowerCase();

    const category =
      card.dataset.category || "";

    const matchesSearch =
      !query || name.includes(query);

    const matchesCategory =
      activeCategory === "all" ||
      category === activeCategory;

    const show =
      matchesSearch &&
      matchesCategory;

    card.classList.toggle(
      "hidden",
      !show
    );

    if (show) {
      visible++;
    }
  });

  noResults?.classList.toggle(
    "hidden",
    visible !== 0
  );
}

toolSearch?.addEventListener(
  "input",
  filterTools
);

clearSearch?.addEventListener(
  "click",
  () => {
    if (!toolSearch) return;

    toolSearch.value = "";

    filterTools();

    toolSearch.focus();
  }
);

searchFocusBtn?.addEventListener(
  "click",
  () => {
    toolSearch?.focus();

    toolSearch?.scrollIntoView({
      behavior: state.motion
        ? "smooth"
        : "auto",
      block: "center"
    });
  }
);

categories?.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest(".category");

    if (!button) return;

    activeCategory =
      button.dataset.category || "all";

    $$(".category").forEach(item => {
      item.classList.toggle(
        "active",
        item === button
      );
    });

    filterTools();
  }
);


/* =========================================================
   ATAJO CTRL + K
========================================================= */

document.addEventListener(
  "keydown",
  event => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k"
    ) {
      event.preventDefault();

      toolSearch?.focus();
    }

    if (event.key === "Escape") {
      closeToolPanel();
      closeModal();
    }
  }
);


/* =========================================================
   FAVORITOS Y RECIENTES
========================================================= */

function addRecent(toolId) {
  state.recent =
    state.recent.filter(
      id => id !== toolId
    );

  state.recent.unshift(toolId);

  state.recent =
    state.recent.slice(0, 8);

  saveState();

  renderQuickTools();
}

function isFavorite(toolId) {
  return state.favorites.includes(toolId);
}

function toggleFavorite(toolId) {
  if (isFavorite(toolId)) {
    state.favorites =
      state.favorites.filter(
        id => id !== toolId
      );

    showToast("Quitado de favoritos.");
  } else {
    state.favorites.push(toolId);

    showToast("Añadido a favoritos.");
  }

  saveState();

  updateToolCards();
  renderQuickTools();
}

function updateToolCards() {
  $$(".tool-card").forEach(card => {
    const id = card.dataset.open;

    card.classList.toggle(
      "favorite",
      isFavorite(id)
    );
  });
}

const TOOL_META = {
  calculator: ["🧮", "Calculadora", "Cálculo"],
  percentage: ["％", "Porcentajes", "Cálculo"],
  discount: ["🏷", "Descuento", "Cálculo"],
  rule3: ["⚖", "Regla de 3", "Cálculo"],
  length: ["📏", "Longitud", "Conversor"],
  weight: ["⚖️", "Peso", "Conversor"],
  volume: ["🧪", "Volumen", "Conversor"],
  temperature: ["🌡", "Temperatura", "Conversor"],
  timeconvert: ["⏱", "Tiempo", "Conversor"],
  currency: ["💱", "Moneda", "Conversor"],
  datediff: ["📅", "Días entre fechas", "Tiempo"],
  age: ["🎂", "Edad", "Tiempo"],
  timer: ["⏳", "Temporizador", "Tiempo"],
  stopwatch: ["⏱️", "Cronómetro", "Tiempo"],
  clock: ["🕐", "Reloj", "Tiempo"],
  focus: ["🎯", "Concentración", "Productividad"],
  text: ["✍", "Herramientas de texto", "Texto"],
  dictionary: ["📖", "Diccionario", "Texto"],
  notes: ["📝", "Notas", "Productividad"],
  tasks: ["☑", "Tareas", "Productividad"],
  shopping: ["🛒", "Lista de compras", "Compras"],
  food: ["🍔", "Comidas", "Compras"],
  buy: ["🛍", "Compras", "Compras"],
  password: ["🔐", "Contraseña", "Seguridad"],
  random: ["🎲", "Aleatorio", "Productividad"],
  qr: ["▦", "Código QR", "Productividad"]
};

function renderQuickTools() {
  if (!quickTools) return;

  if (!state.recent.length) {
    quickTools.innerHTML = `
      <p class="empty-state">
        Todavía no tienes herramientas recientes.
      </p>
    `;

    return;
  }

  quickTools.innerHTML =
    state.recent.map(id => {
      const meta =
        TOOL_META[id];

      if (!meta) return "";

      const [icon, title, category] =
        meta;

      return `
        <button
          class="quick-item"
          data-quick-open="${escapeHTML(id)}"
          type="button"
        >
          <span class="quick-item-icon">
            ${icon}
          </span>

          <span class="quick-item-info">
            <b>${escapeHTML(title)}</b>
            <small>${escapeHTML(category)}</small>
          </span>
        </button>
      `;
    }).join("");

  $$("[data-quick-open]", quickTools)
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          openTool(
            button.dataset.quickOpen
          );
        }
      );
    });
}

clearRecentBtn?.addEventListener(
  "click",
  () => {
    state.recent = [];

    saveState();
    renderQuickTools();

    showToast(
      "Historial reciente limpiado."
    );
  }
);

function setupToolCards() {
  $$(".tool-card").forEach(card => {

    card.addEventListener(
      "click",
      event => {

        if (
          event.shiftKey ||
          event.ctrlKey
        ) {
          toggleFavorite(
            card.dataset.open
          );

          return;
        }

        openTool(
          card.dataset.open
        );
      }
    );

    card.addEventListener(
      "contextmenu",
      event => {
        event.preventDefault();

        toggleFavorite(
          card.dataset.open
        );
      }
    );
  });
}


/* =========================================================
   PANEL DE HERRAMIENTAS
========================================================= */

const TOOL_RENDERERS = {};

function registerTool(id, renderer) {
  TOOL_RENDERERS[id] = renderer;
}

function openTool(toolId) {
  if (!toolId) return;

  const renderer =
    TOOL_RENDERERS[toolId];

  const meta =
    TOOL_META[toolId];

  if (!renderer || !meta) {
    showToast(
      "Esta herramienta todavía no está disponible."
    );

    return;
  }

  activeTool = toolId;

  addRecent(toolId);

  if (toolPanel) {
    toolPanel.classList.remove("hidden");
  }

  if (toolPanelIcon) {
    toolPanelIcon.textContent =
      meta[0];
  }

  if (toolPanelTitle) {
    toolPanelTitle.textContent =
      meta[1];
  }

  if (toolPanelCategory) {
    toolPanelCategory.textContent =
      meta[2].toUpperCase();
  }

  if (toolContent) {
    toolContent.innerHTML =
      renderer();
  }

  if (toolPanel) {
    toolPanel.scrollIntoView({
      behavior: state.motion
        ? "smooth"
        : "auto",
      block: "start"
    });
  }

  setupActiveTool(toolId);
}

function closeToolPanel() {
  if (!toolPanel) return;

  toolPanel.classList.add("hidden");

  activeTool = null;
}

closeTool?.addEventListener(
  "click",
  closeToolPanel
);

function setupActiveTool(toolId) {

  const setup =
    TOOL_SETUP[toolId];

  if (typeof setup === "function") {
    setup();
  }
}

const TOOL_SETUP = {};


/* =========================================================
   1. CALCULADORA
========================================================= */

registerTool(
  "calculator",
  () => `
    <div class="calculator">

      <div
        id="calcDisplay"
        class="calc-display"
      >0</div>

      <div class="calc-grid">

        <button data-calc="clear">C</button>
        <button data-calc="back">⌫</button>
        <button data-calc="percent">%</button>
        <button class="operator" data-calc="/">÷</button>

        <button data-calc="7">7</button>
        <button data-calc="8">8</button>
        <button data-calc="9">9</button>
        <button class="operator" data-calc="*">×</button>

        <button data-calc="4">4</button>
        <button data-calc="5">5</button>
        <button data-calc="6">6</button>
        <button class="operator" data-calc="-">−</button>

        <button data-calc="1">1</button>
        <button data-calc="2">2</button>
        <button data-calc="3">3</button>
        <button class="operator" data-calc="+">+</button>

        <button data-calc="0">0</button>
        <button data-calc=".">.</button>
        <button class="equals" data-calc="=">=</button>

      </div>

    </div>
  `
);

TOOL_SETUP.calculator = () => {
  const display =
    $("#calcDisplay");

  let expression = "";

  function update() {
    display.textContent =
      expression || "0";
  }

  $$(".calc-grid button").forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const value =
            button.dataset.calc;

          if (value === "clear") {
            expression = "";
            update();
            return;
          }

          if (value === "back") {
            expression =
              expression.slice(0, -1);

            update();
            return;
          }

          if (value === "percent") {
            expression += "/100";
            update();
            return;
          }

          if (value === "=") {

            const result =
              safeCalculate(expression);

            if (result === null) {
              display.textContent =
                "Error";

              expression = "";

              return;
            }

            expression =
              String(result);

            update();

            return;
          }

          expression += value;

          update();
        }
      );
    }
  );
};

function safeCalculate(expression) {

  if (!expression) {
    return null;
  }

  let exp =
    String(expression)
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/,/g, ".")
      .trim();

  if (!/^[0-9+\-*/().%\s]+$/.test(exp)) {
    return null;
  }

  exp =
    exp.replace(
      /(\d+(?:\.\d+)?)%/g,
      "($1/100)"
    );

  if (
    /(?:^|[+\-*/])\s*[*/]/.test(exp) ||
    /[+\-*/]\s*$/.test(exp)
  ) {
    return null;
  }

  try {
    const tokens =
      exp.match(
        /(?:\d+(?:\.\d+)?|\+|\-|\*|\/|\(|\))/g
      );

    if (!tokens) {
      return null;
    }

    let index = 0;

    function parseExpression() {
      let value =
        parseTerm();

      while (
        tokens[index] === "+" ||
        tokens[index] === "-"
      ) {
        const operator =
          tokens[index++];

        const right =
          parseTerm();

        value =
          operator === "+"
            ? value + right
            : value - right;
      }

      return value;
    }

    function parseTerm() {
      let value =
        parseFactor();

      while (
        tokens[index] === "*" ||
        tokens[index] === "/"
      ) {
        const operator =
          tokens[index++];

        const right =
          parseFactor();

        if (
          operator === "/" &&
          right === 0
        ) {
          throw new Error();
        }

        value =
          operator === "*"
            ? value * right
            : value / right;
      }

      return value;
    }

    function parseFactor() {

      if (tokens[index] === "+") {
        index++;
        return parseFactor();
      }

      if (tokens[index] === "-") {
        index++;
        return -parseFactor();
      }

      if (tokens[index] === "(") {
        index++;

        const value =
          parseExpression();

        if (tokens[index] !== ")") {
          throw new Error();
        }

        index++;

        return value;
      }

      const token =
        tokens[index++];

      if (!token || !/^\d/.test(token)) {
        throw new Error();
      }

      return Number(token);
    }

    const result =
      parseExpression();

    if (
      index !== tokens.length ||
      !Number.isFinite(result)
    ) {
      return null;
    }

    return result;

  } catch {
    return null;
  }
}


/* =========================================================
   2. PORCENTAJES
========================================================= */

registerTool(
  "percentage",
  () => `
    <div class="tool-grid">

      <label>
        Porcentaje
        <input id="percentValue" type="number" step="any" placeholder="20">
      </label>

      <label>
        Número
        <input id="percentBase" type="number" step="any" placeholder="500">
      </label>

    </div>

    <button id="percentCalc" class="action-btn" type="button">
      Calcular
    </button>

    <div id="percentResult" class="tool-result hidden"></div>
  `
);

TOOL_SETUP.percentage = () => {
  $("#percentCalc")?.addEventListener(
    "click",
    () => {

      const percent =
        Number($("#percentValue")?.value);

      const base =
        Number($("#percentBase")?.value);

      if (
        !Number.isFinite(percent) ||
        !Number.isFinite(base)
      ) {
        showToolError(
          "percentResult",
          "Introduce ambos números."
        );

        return;
      }

      const result =
        base * percent / 100;

      showToolResult(
        "percentResult",
        `<strong>${formatNumber(result)}</strong>
         <p>${formatNumber(percent)}% de ${formatNumber(base)}.</p>`
      );
    }
  );
};


/* =========================================================
   3. DESCUENTO
========================================================= */

registerTool(
  "discount",
  () => `
    <div class="tool-grid">

      <label>
        Precio
        <input id="discountPrice" type="number" step="any">
      </label>

      <label>
        Descuento (%)
        <input id="discountPercent" type="number" step="any">
      </label>

    </div>

    <button id="discountCalc" class="action-btn" type="button">
      Calcular precio final
    </button>

    <div id="discountResult" class="tool-result hidden"></div>
  `
);

TOOL_SETUP.discount = () => {
  $("#discountCalc")?.addEventListener(
    "click",
    () => {

      const price =
        Number($("#discountPrice")?.value);

      const percent =
        Number($("#discountPercent")?.value);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(percent)
      ) {
        showToolError(
          "discountResult",
          "Introduce el precio y el descuento."
        );

        return;
      }

      const saved =
        price * percent / 100;

      const finalPrice =
        price - saved;

      showToolResult(
        "discountResult",
        `<strong>${formatNumber(finalPrice)}</strong>
         <p>Ahorro: ${formatNumber(saved)}.</p>`
      );
    }
  );
};


/* =========================================================
   4. REGLA DE TRES
========================================================= */

registerTool(
  "rule3",
  () => `
    <div class="tool-grid">

      <label>
        A
        <input id="ruleA" type="number" step="any">
      </label>

      <label>
        B
        <input id="ruleB" type="number" step="any">
      </label>

      <label>
        C
        <input id="ruleC" type="number" step="any">
      </label>

    </div>

    <button id="ruleCalc" class="action-btn" type="button">
      Resolver A : B = C : X
    </button>

    <div id="ruleResult" class="tool-result hidden"></div>
  `
);

TOOL_SETUP.rule3 = () => {
  $("#ruleCalc")?.addEventListener(
    "click",
    () => {

      const a =
        Number($("#ruleA")?.value);

      const b =
        Number($("#ruleB")?.value);

      const c =
        Number($("#ruleC")?.value);

      if (
        !Number.isFinite(a) ||
        !Number.isFinite(b) ||
        !Number.isFinite(c) ||
        a === 0
      ) {
        showToolError(
          "ruleResult",
          "Introduce valores válidos y A no puede ser 0."
        );

        return;
      }

      const x =
        b * c / a;

      showToolResult(
        "ruleResult",
        `<strong>X = ${formatNumber(x)}</strong>`
      );
    }
  );
};


/* =========================================================
   CONVERSORES
========================================================= */

const UNIT_DATA = {

  length: {
    units: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      mi: 1609.344,
      yd: 0.9144,
      ft: 0.3048,
      in: 0.0254
    },
    labels: {
      m: "Metros",
      km: "Kilómetros",
      cm: "Centímetros",
      mm: "Milímetros",
      mi: "Millas",
      yd: "Yardas",
      ft: "Pies",
      in: "Pulgadas"
    }
  },

  weight: {
    units: {
      kg: 1,
      g: 0.001,
      mg: 0.000001,
      lb: 0.45359237,
      oz: 0.028349523125,
      t: 1000
    },
    labels: {
      kg: "Kilogramos",
      g: "Gramos",
      mg: "Miligramos",
      lb: "Libras",
      oz: "Onzas",
      t: "Toneladas"
    }
  },

  volume: {
    units: {
      l: 1,
      ml: 0.001,
      cl: 0.01,
      dl: 0.1,
      m3: 1000,
      gal: 3.785411784
    },
    labels: {
      l: "Litros",
      ml: "Mililitros",
      cl: "Centilitros",
      dl: "Decilitros",
      m3: "Metros cúbicos",
      gal: "Galones"
    }
  },

  timeconvert: {
    units: {
      s: 1,
      min: 60,
      h: 3600,
      d: 86400
    },
    labels: {
      s: "Segundos",
      min: "Minutos",
      h: "Horas",
      d: "Días"
    }
  }
};

function converterHTML(type) {

  const data =
    UNIT_DATA[type];

  const options =
    Object.entries(data.labels)
      .map(
        ([value, label]) =>
          `<option value="${value}">${label}</option>`
      )
      .join("");

  return `
    <div class="tool-grid">

      <label>
        Valor
        <input
          id="convertValue"
          type="number"
          step="any"
          placeholder="100"
        >
      </label>

      <label>
        Desde
        <select id="convertFrom">
          ${options}
        </select>
      </label>

      <label>
        Hasta
        <select id="convertTo">
          ${options}
        </select>
      </label>

    </div>

    <button id="convertCalc" class="action-btn" type="button">
      Convertir
    </button>

    <div id="convertResult" class="tool-result hidden"></div>
  `;
}

function setupConverter(type) {

  $("#convertCalc")?.addEventListener(
    "click",
    () => {

      const value =
        Number($("#convertValue")?.value);

      const from =
        $("#convertFrom")?.value;

      const to =
        $("#convertTo")?.value;

      const data =
        UNIT_DATA[type];

      if (
        !Number.isFinite(value) ||
        !data.units[from] ||
        !data.units[to]
      ) {
        showToolError(
          "convertResult",
          "Introduce un valor válido."
        );

        return;
      }

      const base =
        value * data.units[from];

      const result =
        base / data.units[to];

      showToolResult(
        "convertResult",
        `<strong>${formatNumber(result)}</strong>
         <p>Conversión realizada correctamente.</p>`
      );
    }
  );
}

["length", "weight", "volume", "timeconvert"]
  .forEach(type => {

    registerTool(
      type,
      () => converterHTML(type)
    );

    TOOL_SETUP[type] = () =>
      setupConverter(type);
  });


/* =========================================================
   TEMPERATURA
========================================================= */

registerTool(
  "temperature",
  () => `
    <div class="tool-grid">

      <label>
        Temperatura
        <input id="tempValue" type="number" step="any">
      </label>

      <label>
        Desde
        <select id="tempFrom">
          <option value="c">Celsius</option>
          <option value="f">Fahrenheit</option>
          <option value="k">Kelvin</option>
        </select>
      </label>

      <label>
        Hasta
        <select id="tempTo">
          <option value="c">Celsius</option>
          <option value="f">Fahrenheit</option>
          <option value="k">Kelvin</option>
        </select>
      </label>

    </div>

    <button id="tempCalc" class="action-btn" type="button">
      Convertir
    </button>

    <div id="tempResult" class="tool-result hidden"></div>
  `
);

TOOL_SETUP.temperature = () => {
  $("#tempCalc")?.addEventListener(
    "click",
    () => {

      const value =
        Number($("#tempValue")?.value);

      const from =
        $("#tempFrom")?.value;

      const to =
        $("#tempTo")?.value;

      if (!Number.isFinite(value)) {
        showToolError(
          "tempResult",
          "Introduce una temperatura."
        );

        return;
      }

      let celsius;

      if (from === "c") {
        celsius = value;
      } else if (from === "f") {
        celsius =
          (value - 32) * 5 / 9;
      } else {
        celsius =
          value - 273.15;
      }

      let result;

      if (to === "c") {
        result = celsius;
      } else if (to === "f") {
        result =
          celsius * 9 / 5 + 32;
      } else {
        result =
          celsius + 273.15;
      }

      showToolResult(
        "tempResult",
        `<strong>${formatNumber(result)}°</strong>`
      );
    }
  );
};


/* =========================================================
   MONEDA
========================================================= */

registerTool(
  "currency",
  () => `
    <div class="tool-grid">

      <label>
        Cantidad
        <input
          id="currencyAmount"
          type="number"
          step="any"
          placeholder="100"
        >
      </label>

      <label>
        Desde
        <select id="currencyFrom">
          <option value="PEN">PEN — Sol peruano</option>
          <option value="USD">USD — Dólar</option>
          <option value="EUR">EUR — Euro</option>
          <option value="GBP">GBP — Libra</option>
          <option value="JPY">JPY — Yen</option>
          <option value="BRL">BRL — Real</option>
          <option value="MXN">MXN — Peso mexicano</option>
        </select>
      </label>

      <label>
        Hasta
        <select id="currencyTo">
          <option value="USD">USD — Dólar</option>
          <option value="PEN">PEN — Sol peruano</option>
          <option value="EUR">EUR — Euro</option>
          <option value="GBP">GBP — Libra</option>
          <option value="JPY">JPY — Yen</option>
          <option value="BRL">BRL — Real</option>
          <option value="MXN">MXN — Peso mexicano</option>
        </select>
      </label>

    </div>

    <button id="currencyCalc" class="action-btn" type="button">
      Consultar conversión
    </button>

    <div id="currencyResult" class="tool-result hidden"></div>
  `
);

TOOL_SETUP.currency = () => {

  $("#currencyCalc")?.addEventListener(
    "click",
    async () => {

      const amount =
        Number($("#currencyAmount")?.value);

      const from =
        $("#currencyFrom")?.value;

      const to =
        $("#currencyTo")?.value;

      if (
        !Number.isFinite(amount) ||
        amount < 0
      ) {
        showToolError(
          "currencyResult",
          "Introduce una cantidad válida."
        );

        return;
      }

      showToolResult(
        "currencyResult",
        `<p>Consultando tasa actual...</p>`
      );

      try {

        const controller =
          new AbortController();

        const timeout =
          setTimeout(
            () => controller.abort(),
            8000
          );

        const response =
          await fetch(
            `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`,
            {
              signal: controller.signal,
              cache: "no-store"
            }
          );

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error();
        }

        const data =
          await response.json();

        if (
          data.result !== "success" ||
          !data.rates ||
          !Number.isFinite(
            Number(data.rates[to])
          )
        ) {
          throw new Error();
        }

        const rate =
          Number(data.rates[to]);

        const result =
          amount * rate;

        showToolResult(
          "currencyResult",
          `<strong>${formatNumber(result)} ${escapeHTML(to)}</strong>
           <p>1 ${escapeHTML(from)} ≈ ${formatNumber(rate, 6)} ${escapeHTML(to)}</p>
           <p><small>La tasa puede variar con el mercado.</small></p>`
        );

        state.lastCurrency = {
          amount,
          from,
          to,
          result,
          date: Date.now()
        };

        saveState();

      } catch {

        showToolError(
          "currencyResult",
          "No se pudo consultar la tasa. Revisa tu conexión e inténtalo nuevamente."
        );
      }
    }
  );
};


/* =========================================================
   DIFERENCIA DE FECHAS
========================================================= */

registerTool(
  "datediff",
  () => `
    <div class="tool-grid">

      <label>
        Fecha inicial
        <input id="dateStart" type="date">
      </label>

      <label>
        Fecha final
        <input id="dateEnd" type="date">
      </label>

    </div>

    <button id="dateDiffCalc" class="action-btn" type="button">
      Calcular
    </button>

    <div id="dateDiffResult" class="tool-result hidden"></div>
  `
);

TOOL_SETUP.datediff = () => {

  const today =
    new Date();

  const todayISO =
    today.toISOString()
      .slice(0, 10);

  $("#dateStart").value =
    todayISO;

  $("#dateEnd").value =
    todayISO;

  $("#dateDiffCalc")?.addEventListener(
    "click",
    () => {

      const start =
        $("#dateStart")?.value;

      const end =
        $("#dateEnd")?.value;

      if (!start || !end) {
        showToolError(
          "dateDiffResult",
          "Selecciona las dos fechas."
        );

        return;
      }

      const a =
        new Date(`${start}T00:00:00`);

      const b =
        new Date(`${end}T00:00:00`);

      const days =
        Math.round(
          Math.abs(
            b - a
          ) / 86400000
        );

      showToolResult(
        "dateDiffResult",
        `<strong>${days} días</strong>
         <p>Entre las fechas seleccionadas.</p>`
      );
    }
  );
};


/* =========================================================
   EDAD
========================================================= */

registerTool(
  "age",
  () => `
    <label>
      Fecha de nacimiento
      <input id="birthDate" type="date">
    </label>

    <button id="ageCalc" class="action-btn" type="button">
      Calcular edad
    </button>

    <div id="ageResult" class="tool-result hidden"></div>
  `
);

TOOL_SETUP.age = () => {

  $("#ageCalc")?.addEventListener(
    "click",
    () => {

      const value =
        $("#birthDate")?.value;

      if (!value) {
        showToolError(
          "ageResult",
          "Selecciona tu fecha de nacimiento."
        );

        return;
      }

      const birth =
        new Date(`${value}T00:00:00`);

      const today =
        new Date();

      if (
        Number.isNaN(birth.getTime()) ||
        birth > today
      ) {
        showToolError(
          "ageResult",
          "La fecha no es válida."
        );

        return;
      }

      let years =
        today.getFullYear() -
        birth.getFullYear();

      const monthDifference =
        today.getMonth() -
        birth.getMonth();

      if (
        monthDifference < 0 ||
        (
          monthDifference === 0 &&
          today.getDate() < birth.getDate()
        )
      ) {
        years--;
      }

      showToolResult(
        "ageResult",
        `<strong>${years} años</strong>`
      );
    }
  );
};


/* =========================================================
   TEMPORIZADOR
========================================================= */

let timerInterval = null;

registerTool(
  "timer",
  () => `
    <div class="tool-grid">

      <label>
        Minutos
        <input
          id="timerMinutes"
          type="number"
          min="0"
          max="999"
          value="5"
        >
      </label>

      <label>
        Segundos
        <input
          id="timerSeconds"
          type="number"
          min="0"
          max="59"
          value="0"
        >
      </label>

    </div>

    <div
      id="timerDisplay"
      class="tool-result"
      style="text-align:center;"
    >
      <strong>05:00</strong>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">

      <button id="timerStart" class="action-btn" type="button">
        Iniciar
      </button>

      <button id="timerPause" class="secondary-action" type="button">
        Pausar
      </button>

      <button id="timerReset" class="secondary-action" type="button">
        Reiniciar
      </button>

    </div>
  `
);

function updateTimerDisplay() {
  const display =
    $("#timerDisplay");

  if (!display) return;

  display.innerHTML =
    `<strong>${formatTime(state.timer.remaining)}</strong>`;
}

TOOL_SETUP.timer = () => {

  updateTimerDisplay();

  $("#timerStart")?.addEventListener(
    "click",
    () => {

      if (state.timer.remaining <= 0) {

        const minutes =
          Number($("#timerMinutes")?.value) || 0;

        const seconds =
          Number($("#timerSeconds")?.value) || 0;

        state.timer.remaining =
          Math.max(
            0,
            minutes * 60 + seconds
          );
      }

      if (state.timer.remaining <= 0) {
        showToast(
          "Configura primero el tiempo."
        );

        return;
      }

      if (state.timer.running) {
        return;
      }

      state.timer.running = true;

      clearInterval(timerInterval);

      timerInterval =
        setInterval(() => {

          if (
            !state.timer.running
          ) {
            return;
          }

          state.timer.remaining--;

          updateTimerDisplay();

          if (
            state.timer.remaining <= 0
          ) {
            state.timer.remaining = 0;

            state.timer.running = false;

            clearInterval(
              timerInterval
            );

            updateTimerDisplay();

            showToast(
              "⏰ ¡Temporizador terminado!",
              4000
            );

            try {
              navigator.vibrate?.(
                [150, 80, 150]
              );
            } catch {}
          }

          saveState();

        }, 1000);

      saveState();
    }
  );

  $("#timerPause")?.addEventListener(
    "click",
    () => {

      state.timer.running = false;

      clearInterval(timerInterval);

      saveState();

      showToast("Temporizador pausado.");
    }
  );

  $("#timerReset")?.addEventListener(
    "click",
    () => {

      state.timer.running = false;

      clearInterval(timerInterval);

      state.timer.remaining = 0;

      updateTimerDisplay();

      saveState();

      showToast(
        "Temporizador reiniciado."
      );
    }
  );
};


/* =========================================================
   CRONÓMETRO
========================================================= */

let stopwatchInterval = null;
let stopwatchStartedAt = 0;

registerTool(
  "stopwatch",
  () => `
    <div
      id="stopwatchDisplay"
      class="tool-result"
      style="text-align:center;"
    >
      <strong>00:00</strong>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">

      <button id="stopwatchStart" class="action-btn" type="button">
        Iniciar
      </button>

      <button id="stopwatchPause" class="secondary-action" type="button">
        Pausar
      </button>

      <button id="stopwatchReset" class="secondary-action" type="button">
        Reiniciar
      </button>

    </div>
  `
);

function updateStopwatchDisplay() {
  const display =
    $("#stopwatchDisplay");

  if (!display) return;

  const seconds =
    Math.floor(
      state.stopwatch.elapsed / 1000
    );

  display.innerHTML =
    `<strong>${formatTime(seconds)}</strong>`;
}

TOOL_SETUP.stopwatch = () => {

  updateStopwatchDisplay();

  $("#stopwatchStart")?.addEventListener(
    "click",
    () => {

      if (state.stopwatch.running) {
        return;
      }

      state.stopwatch.running = true;

      stopwatchStartedAt =
        Date.now() -
        state.stopwatch.elapsed;

      clearInterval(stopwatchInterval);

      stopwatchInterval =
        setInterval(() => {

          if (!state.stopwatch.running) {
            return;
          }

          state.stopwatch.elapsed =
            Date.now() -
            stopwatchStartedAt;

          updateStopwatchDisplay();

        }, 100);

      saveState();
    }
  );

  $("#stopwatchPause")?.addEventListener(
    "click",
    () => {

      if (!state.stopwatch.running) {
        return;
      }

      state.stopwatch.elapsed =
        Date.now() -
        stopwatchStartedAt;

      state.stopwatch.running = false;

      clearInterval(
        stopwatchInterval
      );

      updateStopwatchDisplay();

      saveState();
    }
  );

  $("#stopwatchReset")?.addEventListener(
    "click",
    () => {

      state.stopwatch.elapsed = 0;

      state.stopwatch.running = false;

      clearInterval(
        stopwatchInterval
      );

      updateStopwatchDisplay();

      saveState();
    }
  );
};


/* =========================================================
   RELOJ
========================================================= */

let clockInterval = null;

registerTool(
  "clock",
  () => `
    <div
      id="clockDisplay"
      class="tool-result"
      style="text-align:center;"
    >
      <strong>--:--:--</strong>
      <p>--/--/----</p>
    </div>
  `
);

TOOL_SETUP.clock = () => {

  function updateClock() {

    const display =
      $("#clockDisplay");

    if (!display) return;

    const now =
      new Date();

    const time =
      now.toLocaleTimeString(
        "es-PE",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }
      );

    const date =
      now.toLocaleDateString(
        "es-PE",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      );

    display.innerHTML =
      `<strong>${escapeHTML(time)}</strong>
       <p>${escapeHTML(date)}</p>`;
  }

  clearInterval(clockInterval);

  updateClock();

  clockInterval =
    setInterval(
      updateClock,
      1000
    );
};


/* =========================================================
   CONCENTRACIÓN
========================================================= */

let focusInterval = null;
let focusRemaining = 25 * 60;
let focusRunning = false;

registerTool(
  "focus",
  () => `
    <div class="tool-grid">

      <label>
        Minutos
        <input
          id="focusMinutes"
          type="number"
          min="1"
          max="180"
          value="25"
        >
      </label>

    </div>

    <div
      id="focusDisplay"
      class="tool-result"
      style="text-align:center;"
    >
      <strong>25:00</strong>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">

      <button id="focusStart" class="action-btn" type="button">
        Iniciar
      </button>

      <button id="focusPause" class="secondary-action" type="button">
        Pausar
      </button>

      <button id="focusReset" class="secondary-action" type="button">
        Reiniciar
      </button>

    </div>
  `
);

TOOL_SETUP.focus = () => {

  const display =
    $("#focusDisplay");

  function update() {

    if (!display) return;

    display.innerHTML =
      `<strong>${formatTime(focusRemaining)}</strong>`;
  }

  update();

  $("#focusStart")?.addEventListener(
    "click",
    () => {

      if (!focusRunning) {

        if (
          focusRemaining <= 0 ||
          focusRemaining === 25 * 60
        ) {
          const minutes =
            Number($("#focusMinutes")?.value) || 25;

          focusRemaining =
            minutes * 60;
        }

        focusRunning = true;

        clearInterval(
          focusInterval
        );

        focusInterval =
          setInterval(() => {

            focusRemaining--;

            update();

            if (
              focusRemaining <= 0
            ) {
              focusRemaining = 0;

              focusRunning = false;

              clearInterval(
                focusInterval
              );

              showToast(
                "🎯 Sesión de concentración terminada.",
                4000
              );
            }

          }, 1000);
      }
    }
  );

  $("#focusPause")?.addEventListener(
    "click",
    () => {

      focusRunning = false;

      clearInterval(
        focusInterval
      );
    }
  );

  $("#focusReset")?.addEventListener(
    "click",
    () => {

      focusRunning = false;

      clearInterval(
        focusInterval
      );

      const minutes =
        Number($("#focusMinutes")?.value) || 25;

      focusRemaining =
        minutes * 60;

      update();
    }
  );
};


/* =========================================================
   TEXTO
========================================================= */

registerTool(
  "text",
  () => `
    <label>
      Escribe o pega tu texto
      <textarea
        id="textInput"
        placeholder="Escribe aquí..."
      ></textarea>
    </label>

    <div class="tool-grid">

      <div class="tool-result">
        <strong id="textChars">0</strong>
        <p>Caracteres</p>
      </div>

      <div class="tool-result">
        <strong id="textWords">0</strong>
        <p>Palabras</p>
      </div>

      <div class="tool-result">
        <strong id="textLines">0</strong>
        <p>Líneas</p>
      </div>

      <div class="tool-result">
        <strong id="textRead">0 min</strong>
        <p>Lectura aproximada</p>
      </div>

    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">

      <button id="textUpper" class="secondary-action" type="button">
        MAYÚSCULAS
      </button>

      <button id="textLower" class="secondary-action" type="button">
        minúsculas
      </button>

      <button id="textCopy" class="action-btn" type="button">
        Copiar
      </button>

    </div>
  `
);

TOOL_SETUP.text = () => {

  const input =
    $("#textInput");

  function update() {

    const value =
      input?.value || "";

    const words =
      value.trim()
        ? value.trim().split(/\s+/).length
        : 0;

    const lines =
      value
        ? value.split(/\r?\n/).length
        : 0;

    const reading =
      words
        ? Math.max(
            1,
            Math.ceil(words / 200)
          )
        : 0;

    $("#textChars").textContent =
      value.length;

    $("#textWords").textContent =
      words;

    $("#textLines").textContent =
      lines;

    $("#textRead").textContent =
      `${reading} min`;
  }

  input?.addEventListener(
    "input",
    update
  );

  $("#textUpper")?.addEventListener(
    "click",
    () => {
      input.value =
        input.value.toUpperCase();

      update();
    }
  );

  $("#textLower")?.addEventListener(
    "click",
    () => {
      input.value =
        input.value.toLowerCase();

      update();
    }
  );

  $("#textCopy")?.addEventListener(
    "click",
    async () => {

      try {

        await navigator.clipboard.writeText(
          input.value
        );

        showToast(
          "Texto copiado."
        );

      } catch {

        showToast(
          "No se pudo copiar."
        );
      }
    }
  );
};


/* =========================================================
   DICCIONARIO
========================================================= */

registerTool(
  "dictionary",
  () => `
    <div class="tool-grid">

      <label>
        Palabra
        <input
          id="dictionaryWord"
          type="search"
          placeholder="Ejemplo: casa"
          autocomplete="off"
        >
      </label>

      <div style="display:flex;align-items:end;">
        <button
          id="dictionarySearch"
          class="action-btn"
          type="button"
        >
          Buscar
        </button>
      </div>

    </div>

    <div
      id="dictionaryResult"
      class="tool-result hidden"
    ></div>
  `
);

TOOL_SETUP.dictionary = () => {

  const input =
    $("#dictionaryWord");

  const button =
    $("#dictionarySearch");

  async function searchWord() {

    const word =
      input.value.trim();

    if (!word) {

      showToolError(
        "dictionaryResult",
        "Escribe una palabra."
      );

      return;
    }

    showToolResult(
      "dictionaryResult",
      `<p>Buscando "${escapeHTML(word)}"...</p>`
    );

    try {

      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          () => controller.abort(),
          9000
        );

      const response =
        await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(word)}`,
          {
            signal: controller.signal,
            cache: "no-store"
          }
        );

      clearTimeout(timeout);

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Respuesta inválida."
        );
      }

      if (
        !response.ok ||
        !Array.isArray(data)
      ) {
        throw new Error(
          data?.message ||
          "No encontrado."
        );
      }

      const entry =
        data[0];

      const meanings =
        Array.isArray(entry.meanings)
          ? entry.meanings
          : [];

      if (!meanings.length) {
        throw new Error(
          "No hay definiciones disponibles."
        );
      }

      let html = `
        <div class="dictionary-entry">

          <div class="dictionary-word">
            ${escapeHTML(entry.word || word)}
          </div>
      `;

      if (entry.phonetic) {
        html += `
          <div class="dictionary-phonetic">
            ${escapeHTML(entry.phonetic)}
          </div>
        `;
      }

      meanings.slice(0, 5)
        .forEach(meaning => {

          const definitions =
            Array.isArray(
              meaning.definitions
            )
              ? meaning.definitions
              : [];

          html += `
            <div class="dictionary-meaning">

              <h4>
                ${escapeHTML(
                  meaning.partOfSpeech ||
                  "Definición"
                )}
              </h4>
          `;

          definitions
            .slice(0, 3)
            .forEach((definition, index) => {

              html += `
                <p>
                  ${index + 1}.
                  ${escapeHTML(
                    definition.definition ||
                    ""
                  )}
                </p>
              `;

              if (definition.example) {
                html += `
                  <p>
                    <em>
                      Ejemplo:
                      ${escapeHTML(
                        definition.example
                      )}
                    </em>
                  </p>
                `;
              }
            });

          html += `
            </div>
          `;
        });

      html += `
        </div>
      `;

      showToolResult(
        "dictionaryResult",
        html
      );

      state.dictionaryRecent =
        state.dictionaryRecent.filter(
          item => item !== word.toLowerCase()
        );

      state.dictionaryRecent.unshift(
        word.toLowerCase()
      );

      state.dictionaryRecent =
        state.dictionaryRecent.slice(0, 8);

      saveState();

    } catch (error) {

      showToolError(
        "dictionaryResult",
        error?.name === "AbortError"
          ? "La búsqueda tardó demasiado. Inténtalo nuevamente."
          : `No encontramos una definición para "${escapeHTML(word)}".`
      );
    }
  }

  button?.addEventListener(
    "click",
    searchWord
  );

  input?.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        event.preventDefault();

        searchWord();
      }
    }
  );
};


/* =========================================================
   NOTAS
========================================================= */

registerTool(
  "notes",
  () => `
    <label>
      Tus notas
      <textarea
        id="notesInput"
        placeholder="Escribe aquí tus ideas, apuntes o recordatorios..."
      ></textarea>
    </label>

    <div style="display:flex;gap:8px;flex-wrap:wrap;">

      <button id="saveNotes" class="action-btn" type="button">
        Guardar notas
      </button>

      <button id="clearNotes" class="secondary-action" type="button">
        Limpiar
      </button>

    </div>

    <div id="notesStatus" class="tool-result hidden"></div>
  `
);

TOOL_SETUP.notes = () => {

  const input =
    $("#notesInput");

  input.value =
    state.notes || "";

  $("#saveNotes")?.addEventListener(
    "click",
    () => {

      state.notes =
        input.value;

      saveState();

      showToolResult(
        "notesStatus",
        "<strong>✓ Guardado</strong><p>Tus notas están guardadas en este dispositivo.</p>"
      );
    }
  );

  $("#clearNotes")?.addEventListener(
    "click",
    () => {

      input.value = "";

      state.notes = "";

      saveState();

      showToast(
        "Notas limpiadas."
      );
    }
  );
};


/* =========================================================
   TAREAS
========================================================= */

registerTool(
  "tasks",
  () => `
    <div style="display:flex;gap:8px;margin-bottom:15px;">

      <input
        id="taskInput"
        type="text"
        placeholder="Nueva tarea..."
      >

      <button
        id="taskAdd"
        class="action-btn"
        type="button"
      >
        Añadir
      </button>

    </div>

    <div id="taskList"></div>
  `
);

TOOL_SETUP.tasks = () => {

  const input =
    $("#taskInput");

  const list =
    $("#taskList");

  function render() {

    if (!state.tasks.length) {

      list.innerHTML =
        `<p class="empty-state">
          No tienes tareas pendientes.
        </p>`;

      return;
    }

    list.innerHTML =
      state.tasks.map(
        (task, index) => `
          <div class="task-item ${task.done ? "done" : ""}">

            <input
              type="checkbox"
              data-task-check="${index}"
              ${task.done ? "checked" : ""}
            >

            <span style="flex:1;">
              ${escapeHTML(task.text)}
            </span>

            <button
              class="secondary-action"
              data-task-delete="${index}"
              type="button"
            >
              ×
            </button>

          </div>
        `
      ).join("");

    $$("[data-task-check]", list)
      .forEach(button => {

        button.addEventListener(
          "change",
          () => {

            const index =
              Number(
                button.dataset.taskCheck
              );

            if (
              state.tasks[index]
            ) {
              state.tasks[index].done =
                button.checked;

              saveState();
              render();
            }
          }
        );
      });

    $$("[data-task-delete]", list)
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.taskDelete
              );

            state.tasks.splice(
              index,
              1
            );

            saveState();
            render();
          }
        );
      });
  }

  function addTask() {

    const text =
      input.value.trim();

    if (!text) return;

    state.tasks.push({
      text,
      done: false
    });

    input.value = "";

    saveState();

    render();
  }

  $("#taskAdd")?.addEventListener(
    "click",
    addTask
  );

  input?.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        event.preventDefault();

        addTask();
      }
    }
  );

  render();
};


/* =========================================================
   LISTA DE COMPRAS
========================================================= */

registerTool(
  "shopping",
  () => `
    <div style="display:flex;gap:8px;margin-bottom:15px;">

      <input
        id="shoppingInput"
        type="text"
        placeholder="Ejemplo: arroz..."
      >

      <button
        id="shoppingAdd"
        class="action-btn"
        type="button"
      >
        Añadir
      </button>

    </div>

    <div id="shoppingList"></div>
  `
);

TOOL_SETUP.shopping = () => {

  const input =
    $("#shoppingInput");

  const list =
    $("#shoppingList");

  function render() {

    if (!state.shopping.length) {

      list.innerHTML =
        `<p class="empty-state">
          Tu lista de compras está vacía.
        </p>`;

      return;
    }

    list.innerHTML =
      state.shopping.map(
        (item, index) => `
          <div class="task-item ${item.done ? "done" : ""}">

            <input
              type="checkbox"
              data-shop-check="${index}"
              ${item.done ? "checked" : ""}
            >

            <span style="flex:1;">
              ${escapeHTML(item.text)}
            </span>

            <button
              class="secondary-action"
              data-shop-delete="${index}"
              type="button"
            >
              ×
            </button>

          </div>
        `
      ).join("");

    $$("[data-shop-check]", list)
      .forEach(input => {

        input.addEventListener(
          "change",
          () => {

            const index =
              Number(
                input.dataset.shopCheck
              );

            state.shopping[index].done =
              input.checked;

            saveState();
            render();
          }
        );
      });

    $$("[data-shop-delete]", list)
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.shopDelete
              );

            state.shopping.splice(
              index,
              1
            );

            saveState();
            render();
          }
        );
      });
  }

  function addItem() {

    const text =
      input.value.trim();

    if (!text) return;

    state.shopping.push({
      text,
      done: false
    });

    input.value = "";

    saveState();

    render();
  }

  $("#shoppingAdd")?.addEventListener(
    "click",
    addItem
  );

  input?.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        event.preventDefault();

        addItem();
      }
    }
  );

  render();
};


/* =========================================================
   COMIDAS
========================================================= */

registerTool(
  "food",
  () => `
    <p>
      Busca restaurantes, comida o lugares donde comprar.
      ÚtilHub no realiza pedidos: tú eliges y haces el pedido directamente.
    </p>

    <div class="tool-grid">

      <label>
        ¿Qué buscas?
        <input
          id="foodQuery"
          type="search"
          placeholder="Pizza, pollo, hamburguesa..."
        >
      </label>

      <label>
        Lugar
        <input
          id="foodLocation"
          type="text"
          placeholder="Ciudad o distrito"
        >
      </label>

    </div>

    <button
      id="foodSearch"
      class="action-btn"
      type="button"
    >
      Buscar comida
    </button>

    <div id="foodLinks"></div>
  `
);

TOOL_SETUP.food = () => {

  $("#foodSearch")?.addEventListener(
    "click",
    () => {

      const query =
        $("#foodQuery")?.value.trim();

      const location =
        $("#foodLocation")?.value.trim();

      if (!query) {

        showToast(
          "Escribe qué comida buscas."
        );

        return;
      }

      const full =
        [query, location]
          .filter(Boolean)
          .join(" ");

      const encoded =
        encodeURIComponent(full);

      const mapsURL =
        `https://www.google.com/maps/search/${encoded}`;

      const searchURL =
        `https://www.google.com/search?q=${encodeURIComponent(
          `${full} restaurantes`
        )}`;

      $("#foodLinks").innerHTML = `
        <div class="external-links">

          <a
            class="external-link"
            href="${mapsURL}"
            target="_blank"
            rel="noopener noreferrer"
          >
            📍 Buscar en Google Maps
          </a>

          <a
            class="external-link"
            href="${searchURL}"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔎 Buscar en Google
          </a>

        </div>

        <div class="tool-result">
          <p>
            ÚtilHub te lleva al buscador.
            El pedido o compra lo realizas tú directamente.
          </p>
        </div>
      `;
    }
  );
};


/* =========================================================
   COMPRAS WEB
========================================================= */

registerTool(
  "buy",
  () => `
    <p>
      Busca productos en tiendas externas. ÚtilHub no realiza
      compras por ti.
    </p>

    <label>
      Producto que buscas
      <input
        id="buyQuery"
        type="search"
        placeholder="Audífonos, mochila, teclado..."
      >
    </label>

    <button
      id="buySearch"
      class="action-btn"
      type="button"
    >
      Buscar producto
    </button>

    <div id="buyLinks"></div>
  `
);

TOOL_SETUP.buy = () => {

  $("#buySearch")?.addEventListener(
    "click",
    () => {

      const query =
        $("#buyQuery")?.value.trim();

      if (!query) {

        showToast(
          "Escribe un producto."
        );

        return;
      }

      const encoded =
        encodeURIComponent(query);

      const google =
        `https://www.google.com/search?tbm=shop&q=${encoded}`;

      const mercadolibre =
        `https://listado.mercadolibre.com.pe/${encoded}`;

      $("#buyLinks").innerHTML = `
        <div class="external-links">

          <a
            class="external-link"
            href="${google}"
            target="_blank"
            rel="noopener noreferrer"
          >
            🛒 Google Shopping
          </a>

          <a
            class="external-link"
            href="${mercadolibre}"
            target="_blank"
            rel="noopener noreferrer"
          >
            🛍 Mercado Libre Perú
          </a>

        </div>
      `;
    }
  );
};


/* =========================================================
   CONTRASEÑA
========================================================= */

registerTool(
  "password",
  () => `
    <div class="tool-grid">

      <label>
        Longitud
        <input
          id="passwordLength"
          type="number"
          min="6"
          max="128"
          value="16"
        >
      </label>

      <label>
        Caracteres
        <select id="passwordType">
          <option value="all">Letras + números + símbolos</option>
          <option value="letters">Solo letras</option>
          <option value="numbers">Solo números</option>
          <option value="lettersnumbers">Letras + números</option>
        </select>
      </label>

    </div>

    <button id="passwordGenerate" class="action-btn" type="button">
      Generar
    </button>

    <div
      id="passwordResult"
      class="tool-result hidden"
    ></div>
  `
);

function secureRandom(max) {

  if (
    window.crypto &&
    crypto.getRandomValues
  ) {

    const array =
      new Uint32Array(1);

    crypto.getRandomValues(
      array
    );

    return array[0] % max;
  }

  return Math.floor(
    Math.random() * max
  );
}

TOOL_SETUP.password = () => {

  $("#passwordGenerate")?.addEventListener(
    "click",
    () => {

      const length =
        clamp(
          Number(
            $("#passwordLength")?.value
          ) || 16,
          6,
          128
        );

      const type =
        $("#passwordType")?.value ||
        "all";

      let chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

      if (
        type === "numbers"
      ) {
        chars =
          "0123456789";
      }

      if (
        type === "lettersnumbers"
      ) {
        chars +=
          "0123456789";
      }

      if (
        type === "all"
      ) {
        chars +=
          "0123456789!@#$%^&*()_+-=[]{}";
      }

      let password = "";

      for (
        let i = 0;
        i < length;
        i++
      ) {
        password +=
          chars[
            secureRandom(chars.length)
          ];
      }

      showToolResult(
        "passwordResult",
        `<strong style="word-break:break-all;">
          ${escapeHTML(password)}
        </strong>
        <p>
          No compartas tus contraseñas con otras personas.
        </p>
        <button
          id="copyPassword"
          class="action-btn"
          type="button"
        >
          Copiar
        </button>`
      );

      $("#copyPassword")?.addEventListener(
        "click",
        async () => {

          try {

            await navigator.clipboard.writeText(
              password
            );

            showToast(
              "Contraseña copiada."
            );

          } catch {

            showToast(
              "No se pudo copiar."
            );
          }
        }
      );
    }
  );
};


/* =========================================================
   ALEATORIO
========================================================= */

registerTool(
  "random",
  () => `
    <div class="tool-grid">

      <label>
        Mínimo
        <input
          id="randomMin"
          type="number"
          value="1"
        >
      </label>

      <label>
        Máximo
        <input
          id="randomMax"
          type="number"
          value="100"
        >
      </label>

    </div>

    <button id="randomGenerate" class="action-btn" type="button">
      Generar número
    </button>

    <div
      id="randomResult"
      class="tool-result hidden"
      style="text-align:center;"
    ></div>
  `
);

TOOL_SETUP.random = () => {

  $("#randomGenerate")?.addEventListener(
    "click",
    () => {

      let min =
        Number($("#randomMin")?.value);

      let max =
        Number($("#randomMax")?.value);

      if (
        !Number.isFinite(min) ||
        !Number.isFinite(max)
      ) {

        showToolError(
          "randomResult",
          "Introduce valores válidos."
        );

        return;
      }

      if (min > max) {
        [min, max] =
          [max, min];
      }

      const result =
        Math.floor(
          Math.random() *
          (max - min + 1)
        ) + min;

      showToolResult(
        "randomResult",
        `<strong>${result}</strong>`
      );
    }
  );
};


/* =========================================================
   QR
========================================================= */

registerTool(
  "qr",
  () => `
    <label>
      Texto o enlace
      <input
        id="qrText"
        type="text"
        placeholder="https://ejemplo.com"
      >
    </label>

    <button id="qrGenerate" class="action-btn" type="button">
      Crear código QR
    </button>

    <div
      id="qrResult"
      class="tool-result hidden"
      style="text-align:center;"
    ></div>
  `
);

TOOL_SETUP.qr = () => {

  $("#qrGenerate")?.addEventListener(
    "click",
    () => {

      const text =
        $("#qrText")?.value.trim();

      if (!text) {

        showToolError(
          "qrResult",
          "Escribe un texto o enlace."
        );

        return;
      }

      const url =
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;

      showToolResult(
        "qrResult",
        `
          <img
            src="${url}"
            alt="Código QR generado"
            width="300"
            height="300"
            loading="lazy"
            style="
              display:block;
              max-width:100%;
              height:auto;
              margin:0 auto 15px;
              border-radius:12px;
              background:white;
              padding:10px;
            "
          >

          <a
            class="external-link"
            href="${url}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir QR
          </a>
        `
      );
    }
  );
};


/* =========================================================
   RESULTADOS
========================================================= */

function showToolResult(id, html) {

  const element =
    document.getElementById(id);

  if (!element) return;

  element.classList.remove(
    "hidden",
    "error"
  );

  element.innerHTML =
    html;
}

function showToolError(id, message) {

  const element =
    document.getElementById(id);

  if (!element) return;

  element.classList.remove(
    "hidden"
  );

  element.classList.add(
    "error"
  );

  element.innerHTML =
    `<strong>⚠</strong>
     <p>${message}</p>`;
}


/* =========================================================
   MODAL
========================================================= */

function openModal(html) {

  if (!modal || !modalContent) {
    return;
  }

  modalContent.innerHTML =
    html;

  modal.classList.remove(
    "hidden"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );
}

function closeModal() {

  if (!modal) return;

  modal.classList.add(
    "hidden"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}

$$("[data-close-modal]")
  .forEach(element => {

    element.addEventListener(
      "click",
      closeModal
    );
  });


/* =========================================================
   NOVA FLOW — CANVAS ENGINE
========================================================= */

const ctx =
  novaCanvas?.getContext(
    "2d",
    {
      alpha: true
    }
  );

let canvasWidth = 0;
let canvasHeight = 0;
let dpr = 1;

let novaParticles = [];
let novaStars = [];
let novaDrops = [];
let novaBits = [];
let novaSnow = [];
let novaLightning = [];

let novaTime = 0;
let novaFrame = 0;

let mouseX = 0;
let mouseY = 0;
let mouseActive = false;

function getParticleCount(base) {

  let multiplier = 1;

  if (performanceMode === "quality") {
    multiplier = 1.45;
  }

  if (performanceMode === "performance") {
    multiplier = 0.55;
  }

  return Math.max(
    20,
    Math.floor(base * multiplier)
  );
}

function resizeNova() {

  if (!novaCanvas || !ctx) return;

  dpr =
    Math.min(
      window.devicePixelRatio || 1,
      performanceMode === "quality"
        ? 2
        : 1.5
    );

  canvasWidth =
    Math.max(
      1,
      window.innerWidth
    );

  canvasHeight =
    Math.max(
      1,
      window.innerHeight
    );

  novaCanvas.width =
    Math.floor(
      canvasWidth * dpr
    );

  novaCanvas.height =
    Math.floor(
      canvasHeight * dpr
    );

  novaCanvas.style.width =
    `${canvasWidth}px`;

  novaCanvas.style.height =
    `${canvasHeight}px`;

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  novaReset();
}

window.addEventListener(
  "resize",
  resizeNova,
  {
    passive: true
  }
);

window.addEventListener(
  "pointermove",
  event => {

    mouseX = event.clientX;
    mouseY = event.clientY;

    mouseActive = true;

  },
  {
    passive: true
  }
);

window.addEventListener(
  "pointerleave",
  () => {
    mouseActive = false;
  },
  {
    passive: true
  }
);

window.addEventListener(
  "touchmove",
  event => {

    const touch =
      event.touches[0];

    if (!touch) return;

    mouseX = touch.clientX;
    mouseY = touch.clientY;

    mouseActive = true;

  },
  {
    passive: true
  }
);


/* =========================================================
   PARTICLES
========================================================= */

function createParticles() {

  novaParticles = [];

  const count =
    getParticleCount(90);

  for (
    let i = 0;
    i < count;
    i++
  ) {

    novaParticles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2.2 + 0.4,
      a: Math.random() * 0.65 + 0.15,
      phase: Math.random() * Math.PI * 2
    });
  }
}

function drawParticles() {

  const intensity =
    novaIntensityValue;

  for (const p of novaParticles) {

    p.x += p.vx * intensity;
    p.y += p.vy * intensity;

    if (p.x < -10) p.x = canvasWidth + 10;
    if (p.x > canvasWidth + 10) p.x = -10;

    if (p.y < -10) p.y = canvasHeight + 10;
    if (p.y > canvasHeight + 10) p.y = -10;

    if (mouseActive) {

      const dx =
        mouseX - p.x;

      const dy =
        mouseY - p.y;

      const distance =
        Math.sqrt(
          dx * dx + dy * dy
        );

      if (
        distance < 150 &&
        distance > 1
      ) {

        p.x -=
          dx / distance * 0.15;

        p.y -=
          dy / distance * 0.15;
      }
    }

    const alpha =
      clamp(
        p.a +
        Math.sin(
          novaTime * 0.0015 +
          p.phase
        ) * 0.12,
        0.05,
        0.9
      );

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      p.r,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      `rgba(34,211,238,${alpha * intensity})`;

    ctx.fill();
  }
}

function drawConnections() {

  if (
    performanceMode === "performance"
  ) {
    return;
  }

  const maxDistance = 125;

  for (
    let i = 0;
    i < novaParticles.length;
    i++
  ) {

    for (
      let j = i + 1;
      j < novaParticles.length;
      j++
    ) {

      const a =
        novaParticles[i];

      const b =
        novaParticles[j];

      const dx =
        a.x - b.x;

      const dy =
        a.y - b.y;

      const distance =
        Math.sqrt(
          dx * dx + dy * dy
        );

      if (
        distance < maxDistance
      ) {

        const alpha =
          (1 - distance / maxDistance) *
          0.12 *
          novaIntensityValue;

        ctx.beginPath();

        ctx.moveTo(
          a.x,
          a.y
        );

        ctx.lineTo(
          b.x,
          b.y
        );

        ctx.strokeStyle =
          `rgba(59,130,246,${alpha})`;

        ctx.lineWidth = 0.7;

        ctx.stroke();
      }
    }
  }
}


/* =========================================================
   COSMIC
========================================================= */

function drawCosmic() {

  drawParticles();
  drawConnections();

  const cx =
    canvasWidth / 2;

  const cy =
    canvasHeight / 2;

  const rings = 5;

  for (
    let i = 0;
    i < rings;
    i++
  ) {

    const radius =
      80 +
      i * 90 +
      Math.sin(
        novaTime * 0.001 +
        i
      ) * 15;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      radius,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      `rgba(34,211,238,${0.035 * novaIntensityValue})`;

    ctx.lineWidth = 1;

    ctx.stroke();
  }
}


/* =========================================================
   AURORA
========================================================= */

function drawAurora() {

  const bands = 7;

  for (
    let b = 0;
    b < bands;
    b++
  ) {

    ctx.beginPath();

    const yBase =
      canvasHeight *
      (0.2 + b * 0.1);

    for (
      let x = 0;
      x <= canvasWidth;
      x += 18
    ) {

      const y =
        yBase +
        Math.sin(
          x * 0.006 +
          novaTime * 0.0012 +
          b
        ) * 45 +
        Math.sin(
          x * 0.013 -
          novaTime * 0.0007
        ) * 20;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      `rgba(${34 + b * 10},${211 - b * 10},${238},${0.06 * novaIntensityValue})`;

    ctx.lineWidth =
      18 - b;

    ctx.stroke();
  }

  drawParticles();
}


/* =========================================================
   PULSE
========================================================= */

function drawPulse() {

  const cx =
    canvasWidth / 2;

  const cy =
    canvasHeight / 2;

  const maxRadius =
    Math.max(
      canvasWidth,
      canvasHeight
    );

  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const progress =
      (
        novaTime * 0.00018 +
        i / 7
      ) % 1;

    const radius =
      progress * maxRadius;

    const alpha =
      (1 - progress) *
      0.12 *
      novaIntensityValue;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      radius,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      `rgba(34,211,238,${alpha})`;

    ctx.lineWidth =
      2 + (1 - progress) * 4;

    ctx.stroke();
  }
}


/* =========================================================
   MATRIX
========================================================= */

function createMatrix() {

  novaBits = [];

  const columns =
    Math.max(
      10,
      Math.floor(canvasWidth / 18)
    );

  for (
    let i = 0;
    i < columns;
    i++
  ) {

    novaBits.push({
      x: i * 18,
      y: Math.random() * canvasHeight,
      speed: 1 + Math.random() * 3,
      length:
        3 +
        Math.floor(
          Math.random() * 8
        )
    });
  }
}

function drawMatrix() {

  ctx.font =
    "12px monospace";

  for (const bit of novaBits) {

    bit.y +=
      bit.speed *
      novaIntensityValue;

    if (
      bit.y >
      canvasHeight + 100
    ) {
      bit.y = -50;
    }

    for (
      let i = 0;
      i < bit.length;
      i++
    ) {

      const char =
        Math.random() > 0.5
          ? "1"
          : "0";

      const alpha =
        (1 - i / bit.length) *
        0.28 *
        novaIntensityValue;

      ctx.fillStyle =
        `rgba(34,211,238,${alpha})`;

      ctx.fillText(
        char,
        bit.x,
        bit.y - i * 14
      );
    }
  }
}


/* =========================================================
   NEBULA
========================================================= */

function drawNebula() {

  const clouds = 18;

  for (
    let i = 0;
    i < clouds;
    i++
  ) {

    const x =
      canvasWidth *
      (
        0.1 +
        0.8 *
        (
          0.5 +
          0.5 *
          Math.sin(
            i * 2.31
          )
        )
      );

    const y =
      canvasHeight *
      (
        0.15 +
        0.7 *
        (
          0.5 +
          0.5 *
          Math.cos(
            i * 1.73
          )
        )
      );

    const radius =
      70 +
      (
        40 *
        Math.sin(
          novaTime * 0.0005 +
          i
        )
      );

    const gradient =
      ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        Math.abs(radius)
      );

    gradient.addColorStop(
      0,
      `rgba(139,92,246,${0.035 * novaIntensityValue})`
    );

    gradient.addColorStop(
      1,
      "rgba(139,92,246,0)"
    );

    ctx.fillStyle =
      gradient;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      Math.abs(radius),
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  drawParticles();
}


/* =========================================================
   WAVES
========================================================= */

function drawWaves() {

  const waveCount = 10;

  for (
    let w = 0;
    w < waveCount;
    w++
  ) {

    ctx.beginPath();

    for (
      let x = 0;
      x <= canvasWidth;
      x += 10
    ) {

      const y =
        canvasHeight / 2 +
        Math.sin(
          x * 0.008 +
          novaTime * 0.001 +
          w * 0.5
        ) *
        (
          35 +
          w * 4
        ) +
        Math.sin(
          x * 0.003 -
          novaTime * 0.0006
        ) * 20;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      `rgba(34,211,238,${0.035 * novaIntensityValue})`;

    ctx.lineWidth = 1.5;

    ctx.stroke();
  }
}


/* =========================================================
   STARFIELD
========================================================= */

function createStars() {

  novaStars = [];

  const count =
    getParticleCount(130);

  for (
    let i = 0;
    i < count;
    i++
  ) {

    novaStars.push({
      x:
        (Math.random() - 0.5) *
        canvasWidth,

      y:
        (Math.random() - 0.5) *
        canvasHeight,

      z:
        Math.random() *
        canvasWidth,

      speed:
        0.8 +
        Math.random() * 2
    });
  }
}

function drawStarfield() {

  const cx =
    canvasWidth / 2;

  const cy =
    canvasHeight / 2;

  for (const star of novaStars) {

    star.z -=
      star.speed *
      novaIntensityValue;

    if (star.z < 1) {

      star.z =
        canvasWidth;

      star.x =
        (Math.random() - 0.5) *
        canvasWidth;

      star.y =
        (Math.random() - 0.5) *
        canvasHeight;
    }

    const scale =
      220 / star.z;

    const x =
      cx +
      star.x * scale;

    const y =
      cy +
      star.y * scale;

    if (
      x < 0 ||
      x > canvasWidth ||
      y < 0 ||
      y > canvasHeight
    ) {
      continue;
    }

    const size =
      Math.max(
        0.4,
        2.8 * scale
      );

    ctx.fillStyle =
      `rgba(255,255,255,${clamp(scale, 0.1, 0.8)})`;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      size,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }
}


/* =========================================================
   VORTEX
========================================================= */

function drawVortex() {

  const cx =
    canvasWidth / 2;

  const cy =
    canvasHeight / 2;

  const count =
    getParticleCount(150);

  if (novaParticles.length !== count) {
    createParticles();
  }

  novaParticles.forEach(
    (p, index) => {

      const angle =
        Math.atan2(
          p.y - cy,
          p.x - cx
        );

      const distance =
        Math.hypot(
          p.x - cx,
          p.y - cy
        );

      const speed =
        0.0015 *
        novaIntensityValue *
        (
          1 +
          200 /
          Math.max(
            distance,
            20
          )
        );

      const nextAngle =
        angle + speed;

      p.x =
        cx +
        Math.cos(nextAngle) *
        distance;

      p.y =
        cy +
        Math.sin(nextAngle) *
        distance;

      if (
        distance >
        Math.max(
          canvasWidth,
          canvasHeight
        ) *
        0.65
      ) {
        p.x =
          cx +
          (
            Math.random() - 0.5
          ) *
          100;

        p.y =
          cy +
          (
            Math.random() - 0.5
          ) *
          100;
      }

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        1.2,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(139,92,246,${0.5 * novaIntensityValue})`;

      ctx.fill();
    }
  );
}


/* =========================================================
   FIREFLY
========================================================= */

function drawFirefly() {

  const count =
    getParticleCount(75);

  if (novaParticles.length !== count) {
    createParticles();
  }

  novaParticles.forEach(
    p => {

      p.x +=
        Math.sin(
          novaTime * 0.001 +
          p.phase
        ) * 0.3;

      p.y +=
        Math.cos(
          novaTime * 0.0013 +
          p.phase
        ) * 0.3;

      if (p.x < 0) p.x = canvasWidth;
      if (p.x > canvasWidth) p.x = 0;

      if (p.y < 0) p.y = canvasHeight;
      if (p.y > canvasHeight) p.y = 0;

      const glowAmount =
        0.2 +
        (
          Math.sin(
            novaTime * 0.004 +
            p.phase
          ) + 1
        ) * 0.25;

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        2.3,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(250,204,21,${glowAmount * novaIntensityValue})`;

      ctx.shadowBlur = 15;
      ctx.shadowColor = "#facc15";

      ctx.fill();

      ctx.shadowBlur = 0;
    }
  );
}


/* =========================================================
   RAIN
========================================================= */

function createRain() {

  novaDrops = [];

  const count =
    getParticleCount(180);

  for (
    let i = 0;
    i < count;
    i++
  ) {

    novaDrops.push({
      x:
        Math.random() *
        canvasWidth,

      y:
        Math.random() *
        canvasHeight,

      speed:
        5 +
        Math.random() * 9,

      length:
        8 +
        Math.random() * 20
    });
  }
}

function drawRain() {

  for (const drop of novaDrops) {

    drop.y +=
      drop.speed *
      novaIntensityValue;

    if (
      drop.y >
      canvasHeight + 30
    ) {
      drop.y = -30;

      drop.x =
        Math.random() *
        canvasWidth;
    }

    ctx.beginPath();

    ctx.moveTo(
      drop.x,
      drop.y
    );

    ctx.lineTo(
      drop.x - 2,
      drop.y + drop.length
    );

    ctx.strokeStyle =
      `rgba(34,211,238,${0.15 * novaIntensityValue})`;

    ctx.lineWidth = 1;

    ctx.stroke();
  }
}


/* =========================================================
   GRID
========================================================= */

function drawGrid() {

  const spacing = 50;

  const offset =
    (
      novaTime *
      0.025 *
      novaIntensityValue
    ) % spacing;

  ctx.lineWidth = 1;

  for (
    let x = -spacing;
    x < canvasWidth + spacing;
    x += spacing
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x + offset,
      0
    );

    ctx.lineTo(
      x + offset,
      canvasHeight
    );

    ctx.strokeStyle =
      "rgba(34,211,238,0.035)";

    ctx.stroke();
  }

  for (
    let y = -spacing;
    y < canvasHeight + spacing;
    y += spacing
  ) {

    ctx.beginPath();

    ctx.moveTo(
      0,
      y + offset
    );

    ctx.lineTo(
      canvasWidth,
      y + offset
    );

    ctx.strokeStyle =
      "rgba(59,130,246,0.035)";

    ctx.stroke();
  }
}


/* =========================================================
   SPIRAL
========================================================= */

function drawSpiral() {

  const cx =
    canvasWidth / 2;

  const cy =
    canvasHeight / 2;

  ctx.beginPath();

  for (
    let i = 0;
    i < 1300;
    i += 4
  ) {

    const angle =
      i * 0.045 +
      novaTime * 0.0008;

    const radius =
      i * 0.35;

    const x =
      cx +
      Math.cos(angle) *
      radius;

    const y =
      cy +
      Math.sin(angle) *
      radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.strokeStyle =
    `rgba(139,92,246,${0.14 * novaIntensityValue})`;

  ctx.lineWidth = 1.2;

  ctx.stroke();
}


/* =========================================================
   ORBIT
========================================================= */

function drawOrbit() {

  const cx =
    canvasWidth / 2;

  const cy =
    canvasHeight / 2;

  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const rx =
      80 + i * 80;

    const ry =
      35 + i * 40;

    const angle =
      novaTime *
      0.0005 *
      (i % 2 ? -1 : 1);

    ctx.beginPath();

    ctx.ellipse(
      cx,
      cy,
      rx,
      ry,
      angle,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      `rgba(34,211,238,${0.05 * novaIntensityValue})`;

    ctx.stroke();

    const px =
      cx +
      Math.cos(
        novaTime * 0.001 +
        i
      ) *
      rx;

    const py =
      cy +
      Math.sin(
        novaTime * 0.001 +
        i
      ) *
      ry;

    ctx.beginPath();

    ctx.arc(
      px,
      py,
      3,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      `rgba(34,211,238,${0.45 * novaIntensityValue})`;

    ctx.fill();
  }
}


/* =========================================================
   PLASMA
========================================================= */

function drawPlasma() {

  const step =
    performanceMode === "performance"
      ? 55
      : 38;

  for (
    let x = 0;
    x < canvasWidth;
    x += step
  ) {

    for (
      let y = 0;
      y < canvasHeight;
      y += step
    ) {

      const value =
        Math.sin(
          x * 0.01 +
          novaTime * 0.001
        ) +
        Math.sin(
          y * 0.013 -
          novaTime * 0.0008
        ) +
        Math.sin(
          (x + y) * 0.006
        );

      const radius =
        1 +
        (
          value + 3
        ) *
        0.8;

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(59,130,246,${0.045 * novaIntensityValue})`;

      ctx.fill();
    }
  }
}


/* =========================================================
   DNA
========================================================= */

function drawDNA() {

  const cx =
    canvasWidth / 2;

  const amplitude =
    Math.min(
      260,
      canvasWidth * 0.3
    );

  ctx.lineWidth = 1;

  for (
    let strand = 0;
    strand < 2;
    strand++
  ) {

    ctx.beginPath();

    for (
      let y = 0;
      y <= canvasHeight;
      y += 8
    ) {

      const phase =
        y * 0.018 +
        novaTime * 0.001;

      const x =
        cx +
        (
          strand === 0
            ? 1
            : -1
        ) *
        Math.sin(phase) *
        amplitude;

      if (y === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      `rgba(34,211,238,${0.09 * novaIntensityValue})`;

    ctx.stroke();
  }

  for (
    let y = 20;
    y < canvasHeight;
    y += 45
  ) {

    const phase =
      y * 0.018 +
      novaTime * 0.001;

    const x1 =
      cx +
      Math.sin(phase) *
      amplitude;

    const x2 =
      cx -
      Math.sin(phase) *
      amplitude;

    ctx.beginPath();

    ctx.moveTo(
      x1,
      y
    );

    ctx.lineTo(
      x2,
      y
    );

    ctx.strokeStyle =
      `rgba(139,92,246,${0.07 * novaIntensityValue})`;

    ctx.stroke();
  }
}


/* =========================================================
   SNOW
========================================================= */

function createSnow() {

  novaSnow = [];

  const count =
    getParticleCount(120);

  for (
    let i = 0;
    i < count;
    i++
  ) {

    novaSnow.push({
      x:
        Math.random() *
        canvasWidth,

      y:
        Math.random() *
        canvasHeight,

      speed:
        0.5 +
        Math.random() * 1.8,

      size:
        1 +
        Math.random() * 2.5,

      phase:
        Math.random() *
        Math.PI * 2
    });
  }
}

function drawSnow() {

  for (const flake of novaSnow) {

    flake.y +=
      flake.speed *
      novaIntensityValue;

    flake.x +=
      Math.sin(
        novaTime * 0.001 +
        flake.phase
      ) *
      0.25;

    if (
      flake.y >
      canvasHeight + 10
    ) {
      flake.y = -10;

      flake.x =
        Math.random() *
        canvasWidth;
    }

    ctx.beginPath();

    ctx.arc(
      flake.x,
      flake.y,
      flake.size,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      `rgba(255,255,255,${0.28 * novaIntensityValue})`;

    ctx.fill();
  }
}


/* =========================================================
   LIGHTNING
========================================================= */

function createLightning() {

  novaLightning = [];

  let x =
    Math.random() *
    canvasWidth;

  for (
    let y = -20;
    y < canvasHeight + 20;
    y += 25
  ) {

    x +=
      (Math.random() - 0.5) *
      55;

    novaLightning.push({
      x,
      y
    });
  }
}

function drawLightning() {

  if (
    novaLightning.length < 2
  ) {
    createLightning();
  }

  const chance =
    Math.random();

  if (chance < 0.008 * novaIntensityValue) {
    createLightning();
  }

  ctx.beginPath();

  novaLightning.forEach(
    (point, index) => {

      if (index === 0) {
        ctx.moveTo(
          point.x,
          point.y
        );
      } else {
        ctx.lineTo(
          point.x,
          point.y
        );
      }
    }
  );

  ctx.strokeStyle =
    `rgba(255,255,255,${0.5 * novaIntensityValue})`;

  ctx.shadowBlur = 20;

  ctx.shadowColor =
    "#22d3ee";

  ctx.lineWidth = 2;

  ctx.stroke();

  ctx.shadowBlur = 0;
}


/* =========================================================
   GALAXY
========================================================= */

function drawGalaxy() {

  const cx =
    canvasWidth / 2;

  const cy =
    canvasHeight / 2;

  const count =
    getParticleCount(500);

  if (
    novaParticles.length !== count
  ) {
    novaParticles = [];

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const angle =
        Math.random() *
        Math.PI *
        2;

      const radius =
        Math.pow(
          Math.random(),
          0.65
        ) *
        Math.min(
          canvasWidth,
          canvasHeight
        ) *
        0.48;

      novaParticles.push({
        angle,
        radius,
        speed:
          0.0002 +
          Math.random() * 0.0007
      });
    }
  }

  novaParticles.forEach(
    p => {

      p.angle +=
        p.speed *
        novaIntensityValue;

      const spiral =
        p.angle +
        p.radius * 0.012;

      const x =
        cx +
        Math.cos(spiral) *
        p.radius;

      const y =
        cy +
        Math.sin(spiral) *
        p.radius *
        0.45;

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        1.1,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(139,92,246,${0.35 * novaIntensityValue})`;

      ctx.fill();
    }
  );
}


/* =========================================================
   COMET
========================================================= */

function drawComet() {

  const count =
    5;

  for (
    let i = 0;
    i < count;
    i++
  ) {

    const progress =
      (
        novaTime * 0.00012 +
        i / count
      ) % 1;

    const x =
      progress *
      (
        canvasWidth + 300
      ) - 150;

    const y =
      canvasHeight *
      (
        0.2 +
        i * 0.15
      ) +
      Math.sin(
        progress * 10 +
        i
      ) * 80;

    const tail =
      100 +
      progress * 150;

    const gradient =
      ctx.createLinearGradient(
        x - tail,
        y,
        x,
        y
      );

    gradient.addColorStop(
      0,
      "rgba(34,211,238,0)"
    );

    gradient.addColorStop(
      1,
      `rgba(255,255,255,${0.35 * novaIntensityValue})`
    );

    ctx.strokeStyle =
      gradient;

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
      x - tail,
      y
    );

    ctx.lineTo(
      x,
      y
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      3,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#fff";

    ctx.fill();
  }
}


/* =========================================================
   QUANTUM
========================================================= */

function drawQuantum() {

  const cx =
    canvasWidth / 2;

  const cy =
    canvasHeight / 2;

  const rings = 10;

  for (
    let i = 0;
    i < rings;
    i++
  ) {

    const radius =
      40 +
      i * 45;

    const points =
      40 +
      i * 5;

    ctx.beginPath();

    for (
      let p = 0;
      p <= points;
      p++
    ) {

      const angle =
        (
          p / points
        ) *
        Math.PI *
        2;

      const distortion =
        Math.sin(
          angle * 7 +
          novaTime * 0.002 +
          i
        ) *
        8;

      const r =
        radius +
        distortion;

      const x =
        cx +
        Math.cos(angle) *
        r;

      const y =
        cy +
        Math.sin(angle) *
        r;

      if (p === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      `rgba(34,211,238,${0.045 * novaIntensityValue})`;

    ctx.stroke();
  }
}


/* =========================================================
   RESET NOVA
========================================================= */

function novaReset() {

  if (!novaCanvas || !ctx) {
    return;
  }

  createParticles();
  createStars();
  createMatrix();
  createRain();
  createSnow();
  createLightning();

  novaTime = 0;
}


/* =========================================================
   DIBUJO PRINCIPAL
========================================================= */

function clearNova() {

  ctx.clearRect(
    0,
    0,
    canvasWidth,
    canvasHeight
  );

  const gradient =
    ctx.createRadialGradient(
      canvasWidth / 2,
      canvasHeight / 2,
      0,
      canvasWidth / 2,
      canvasHeight / 2,
      Math.max(
        canvasWidth,
        canvasHeight
      ) * 0.7
    );

  gradient.addColorStop(
    0,
    "rgba(8,20,38,0.18)"
  );

  gradient.addColorStop(
    1,
    "rgba(5,9,20,0)"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    canvasWidth,
    canvasHeight
  );
}

function drawNova() {

  if (!ctx) return;

  clearNova();

  if (!state.motion) {
    drawParticles();
    return;
  }

  switch (novaMode) {

    case "aurora":
      drawAurora();
      break;

    case "pulse":
      drawPulse();
      break;

    case "matrix":
      drawMatrix();
      break;

    case "nebula":
      drawNebula();
      break;

    case "waves":
      drawWaves();
      break;

    case "starfield":
      drawStarfield();
      break;

    case "vortex":
      drawVortex();
      break;

    case "firefly":
      drawFirefly();
      break;

    case "rain":
      drawRain();
      break;

    case "grid":
      drawGrid();
      break;

    case "spiral":
      drawSpiral();
      break;

    case "orbit":
      drawOrbit();
      break;

    case "plasma":
      drawPlasma();
      break;

    case "dna":
      drawDNA();
      break;

    case "snow":
      drawSnow();
      break;

    case "lightning":
      drawLightning();
      break;

    case "galaxy":
      drawGalaxy();
      break;

    case "comet":
      drawComet();
      break;

    case "quantum":
      drawQuantum();
      break;

    case "cosmic":
    default:
      drawCosmic();
      break;
  }
}


/* =========================================================
   ANIMACIÓN NOVA
========================================================= */

function novaLoop(timestamp) {

  novaTime = timestamp;

  if (
    novaFrame % (
      performanceMode === "performance"
        ? 2
        : 1
    ) === 0
  ) {
    drawNova();
  }

  novaFrame++;

  requestAnimationFrame(
    novaLoop
  );
}


/* =========================================================
   ICONOS / FAVORITOS
========================================================= */

document.addEventListener(
  "contextmenu",
  event => {

    const card =
      event.target.closest(".tool-card");

    if (!card) return;

    event.preventDefault();
  }
);


/* =========================================================
   SERVICE WORKER
========================================================= */

async function registerServiceWorker() {

  if (
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  try {

    await navigator.serviceWorker.register(
      "./sw.js",
      {
        scope: "./"
      }
    );

  } catch (error) {

    console.warn(
      "Service Worker no disponible:",
      error
    );
  }
}


/* =========================================================
   INICIO
========================================================= */

function initializeApp() {

  applyTheme();
  applyMotion();
  applyFocus();

  updateNovaUI();

  setupToolCards();

  updateToolCards();

  renderQuickTools();

  filterTools();

  resizeNova();

  requestAnimationFrame(
    novaLoop
  );

  registerServiceWorker();

  console.log(
    "ÚtilHub V18 — NOVA FLOW iniciado correctamente."
  );
}

initializeApp();


/* =========================================================
   VISIBILIDAD DE PÁGINA
========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {
      return;
    }

    if (
      activeTool === "clock"
    ) {
      // El reloj se actualiza al volver
      // a la pestaña mediante su intervalo.
    }
  }
);


/* =========================================================
   GUARDADO PERIÓDICO
========================================================= */

setInterval(
  () => {
    saveState();
  },
  30000
);
