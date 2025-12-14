// Estágios simplificados da soja para o protótipo
// Depois vamos alinhar com os dados reais de V4, R1, R3 e R5.5. [file:33]
const soyStages = [
  { id: 0, code: "V0", label: "Plantio" },
  { id: 1, code: "V2", label: "Vegetativo inicial" },
  { id: 2, code: "V4", label: "Crescimento forte" },
  { id: 3, code: "R1", label: "Início da floração" },
  { id: 4, code: "R3", label: "Formação de vagens" },
  { id: 5, code: "R6", label: "Grãos cheios" }
];

let currentDay = 0;
let currentStageIndex = 0;

// Estado básico do Bulbasauro
let bulba = {
  energy: 100,
  mood: 100
};

const dayCounterEl = document.getElementById("day-counter");
const soyStageEl = document.getElementById("soy-stage");
const cropLayerEl = document.getElementById("crop-layer");
const energyBarEl = document.getElementById("energy-bar");
const moodBarEl = document.getElementById("mood-bar");
const logListEl = document.getElementById("log-list");

const advanceBtn = document.getElementById("advance-day-btn");
const feedBtn = document.getElementById("feed-btn");
const playBtn = document.getElementById("play-btn");

function logMessage(text) {
  const li = document.createElement("li");
  li.textContent = text;
  logListEl.prepend(li);
}

function updateSoyStageUI() {
  const stage = soyStages[currentStageIndex];
  soyStageEl.textContent = `${stage.code} - ${stage.label}`;
  cropLayerEl.className = "field-layer crop";

  // Mapear alguns estágios para classes visuais simples
  if (stage.id === 0) {
    cropLayerEl.classList.add("crop-stage-0");
  } else if (stage.id === 1) {
    cropLayerEl.classList.add("crop-stage-1");
  } else if (stage.id === 2) {
    cropLayerEl.classList.add("crop-stage-2");
  } else if (stage.id === 3) {
    cropLayerEl.classList.add("crop-stage-3");
  } else {
    cropLayerEl.classList.add("crop-stage-4");
  }
}

function clampPercent(v) {
  return Math.max(0, Math.min(100, v));
}

function updateBulbasaurUI() {
  energyBarEl.style.width = `${bulba.energy}%`;
  moodBarEl.style.width = `${bulba.mood}%`;

  moodBarEl.classList.remove("bar-fill--good", "bar-fill--bad");
  if (bulba.mood >= 60) {
    moodBarEl.classList.add("bar-fill--good");
  } else if (bulba.mood <= 30) {
    moodBarEl.classList.add("bar-fill--bad");
  }
}

function advanceDay() {
  currentDay += 1;
  dayCounterEl.textContent = currentDay.toString();

  // A cada 2 “dias de jogo”, avança um estágio de soja
  if (currentDay % 2 === 0 && currentStageIndex < soyStages.length - 1) {
    currentStageIndex += 1;
    const stage = soyStages[currentStageIndex];
    updateSoyStageUI();
    logMessage(`A soja avançou para ${stage.code} - ${stage.label}.`);
  }

  // Cansaço básico do Bulbasauro
  bulba.energy = clampPercent(bulba.energy - 5);
  bulba.mood = clampPercent(bulba.mood - 3);
  updateBulbasaurUI();

  if (bulba.energy <= 30) {
    logMessage("Bulbasauro está cansado, precisa de cuidado.");
  }
  if (bulba.mood <= 30) {
    logMessage("Bulbasauro está meio triste, tente brincar ou alimentar.");
  }
}

function feedBulbasaur() {
  bulba.energy = clampPercent(bulba.energy + 15);
  bulba.mood = clampPercent(bulba.mood + 5);
  updateBulbasaurUI();
  logMessage("Você alimentou o Bulbasauro. Ele recuperou energia.");
}

function playWithBulbasaur() {
  bulba.mood = clampPercent(bulba.mood + 15);
  bulba.energy = clampPercent(bulba.energy - 5);
  updateBulbasaurUI();
  logMessage("Você brincou com o Bulbasauro. Ele ficou mais feliz.");
}

advanceBtn.addEventListener("click", advanceDay);
feedBtn.addEventListener("click", feedBulbasaur);
playBtn.addEventListener("click", playWithBulbasaur);

// Inicialização
updateSoyStageUI();
updateBulbasaurUI();
logMessage("Bem-vindo à fazenda do produtor e do Bulbasauro!");
