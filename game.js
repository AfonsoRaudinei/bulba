// =============================================
// FAZENDA BRASIL - GAME ENGINE
// Simulador Profissional de Soja Brasileira
// =============================================

// =============================================
// ESTADO DO JOGO
// =============================================
const gameState = {
  player: {
    name: 'Produtor',
    level: 1,
    xp: 0,
    xpToNext: 100,
    gold: 5000,
    premium: 50
  },
  
  farm: {
    name: 'Fazenda Brasil',
    size: 12,
    fields: [],
    buildings: []
  },
  
  time: {
    day: 0,
    season: 'primavera',
    weather: 'ensolarado',
    temperature: 28,
    speed: 1,
    paused: false
  },
  
  bulba: {
    energy: 100,
    mood: 100,
    trust: 50
  },
  
  resources: {
    seeds: 100,
    fertilizer: 50,
    pesticide: 30
  },
  
  economy: {
    totalProduction: 0,
    totalRevenue: 0,
    totalCost: 0,
    profit: 0
  },
  
  tasks: [],
  activityLog: [],
  
  // Dados de referência
  nutrients: null,
  diseases: null,
  pests: null
};

// =============================================
// CONFIGURAÇÕES DO JOGO
// =============================================
const CONFIG = {
  // Ciclo da Soja
  soyStages: {
    'V0': { days: 0, label: 'Plantio', visualClass: 'soil' },
    'V2': { days: 10, label: '1ª Folha Trifoliolada', visualClass: 'seedling' },
    'V4': { days: 20, label: '4ª Folha Trifoliolada', visualClass: 'vegetative' },
    'R1': { days: 40, label: 'Início Florescimento', visualClass: 'flowering' },
    'R3': { days: 55, label: 'Formação de Vagens', visualClass: 'pod-formation' },
    'R5': { days: 70, label: 'Enchimento de Grãos', visualClass: 'grain-filling' },
    'R6': { days: 85, label: 'Grãos Cheios', visualClass: 'mature' },
    'R7': { days: 100, label: 'Maturação', visualClass: 'mature' },
    'R8': { days: 115, label: 'Maturação Plena', visualClass: 'harvest-ready' }
  },
  
  // Preços e custos
  prices: {
    soySack: 120, // R$ por saca
    seeds: 150, // R$ por unidade de semente
    fertilizer: 80,
    pesticide: 100
  },
  
  // Clima brasileiro
  climates: [
    { type: 'ensolarado', icon: '☀️', temp: [25, 32] },
    { type: 'nublado', icon: '☁️', temp: [20, 26] },
    { type: 'chuvoso', icon: '🌧️', temp: [18, 24] }
  ],
  
  // Estações
  seasons: [
    { name: 'primavera', icon: '🌱', months: [9, 10, 11] },
    { name: 'verão', icon: '☀️', months: [12, 1, 2] },
    { name: 'outono', icon: '🍂', months: [3, 4, 5] },
    { name: 'inverno', icon: '❄️', months: [6, 7, 8] }
  ]
};

// =============================================
// ELEMENTOS DOM
// =============================================
const elements = {
  // Top Bar
  farmName: document.getElementById('farm-name'),
  playerLevel: document.getElementById('player-level'),
  goldAmount: document.getElementById('gold-amount'),
  premiumAmount: document.getElementById('premium-amount'),
  xpAmount: document.getElementById('xp-amount'),
  climate: document.getElementById('climate'),
  temperature: document.getElementById('temperature'),
  season: document.getElementById('season'),
  
  // Farm Canvas
  farmCanvas: document.getElementById('farm-canvas'),
  fieldsLayer: document.getElementById('fields-layer'),
  unitsLayer: document.getElementById('units-layer'),
  
  // Field Info Panel
  fieldInfo: document.getElementById('field-info'),
  fieldStatus: document.getElementById('field-status'),
  fieldCrop: document.getElementById('field-crop'),
  fieldStage: document.getElementById('field-stage'),
  fieldDays: document.getElementById('field-days'),
  
  // Bulba
  bulbaMessage: document.getElementById('bulba-message'),
  
  // Tasks & Log
  taskList: document.getElementById('task-list'),
  activityLog: document.getElementById('activity-log'),
  
  // Bottom Bar
  cycleDay: document.getElementById('cycle-day'),
  production: document.getElementById('production'),
  profit: document.getElementById('profit'),
  
  // Buttons
  pauseBtn: document.getElementById('pause-btn'),
  advanceBtn: document.getElementById('advance-btn'),
  speedBtn: document.getElementById('speed-btn'),
  plantBtn: document.getElementById('plant-btn'),
  harvestBtn: document.getElementById('harvest-btn'),
  fertilizeBtn: document.getElementById('fertilize-btn')
};

// =============================================
// CLASSE FIELD (Talhão)
// =============================================
class Field {
  constructor(id, row, col, size = 1) {
    this.id = id;
    this.row = row;
    this.col = col;
    this.size = size;
    this.status = 'empty'; // empty, planted, growing, ready, harvested
    this.crop = null;
    this.stage = 'V0';
    this.days = 0;
    this.health = {
      nutrition: 100,
      disease: 0,
      pest: 0
    };
    this.element = null;
    
    this.create();
  }
  
  create() {
    this.element = document.createElement('div');
    this.element.className = 'field';
    this.element.dataset.fieldId = this.id;
    this.element.style.gridArea = `${this.row} / ${this.col} / ${this.row + this.size} / ${this.col + this.size}`;
    
    // Status badge
    const badge = document.createElement('div');
    badge.className = 'field-status-badge';
    badge.textContent = this.getStatusLabel();
    this.element.appendChild(badge);
    
    // Events
    this.element.addEventListener('click', () => this.onClick());
    
    elements.fieldsLayer.appendChild(this.element);
  }
  
  onClick() {
    showFieldInfo(this);
  }
  
  plant(cropType = 'soja-rr') {
    if (this.status !== 'empty') return false;
    
    this.status = 'planted';
    this.crop = cropType;
    this.stage = 'V0';
    this.days = 0;
    this.updateVisual();
    
    logActivity('🌱', `Talhão ${this.id} plantado com ${cropType}`);
    return true;
  }
  
  advance(days = 1) {
    if (this.status !== 'planted' && this.status !== 'growing') return;
    
    this.days += days;
    this.updateStage();
    this.updateHealth();
    this.updateVisual();
  }
  
  updateStage() {
    const stages = Object.keys(CONFIG.soyStages);
    for (let i = stages.length - 1; i >= 0; i--) {
      if (this.days >= CONFIG.soyStages[stages[i]].days) {
        const newStage = stages[i];
        if (newStage !== this.stage) {
          this.stage = newStage;
          logActivity('📊', `Talhão ${this.id}: ${CONFIG.soyStages[newStage].label}`);
        }
        break;
      }
    }
    
    this.status = (this.stage === 'R8') ? 'ready' : 'growing';
  }
  
  updateHealth() {
    // Integrar com dados de nutrientes, doenças e pragas
    if (!gameState.nutrients) return;
    
    const stageData = gameState.nutrients.stages[this.stage];
    if (!stageData) return;
    
    // Nutrição decresce com absorção
    const avgAbsorption = (
      stageData.nutrients.nitrogen +
      stageData.nutrients.phosphorus +
      stageData.nutrients.potassium +
      stageData.nutrients.calcium
    ) / 4;
    
    this.health.nutrition = Math.max(0, 100 - avgAbsorption);
    
    // Doenças
    const diseaseData = gameState.diseases?.stages[this.stage];
    if (diseaseData) {
      const maxDisease = Math.max(...Object.values(diseaseData.diseases));
      this.health.disease = Math.min(100, maxDisease);
    }
    
    // Pragas
    const pestData = gameState.pests?.stages[this.stage];
    if (pestData) {
      const maxPest = Math.max(...Object.values(pestData.pests));
      this.health.pest = Math.min(100, maxPest);
    }
  }
  
  harvest() {
    if (this.status !== 'ready') return 0;
    
    // Calcular produtividade baseada na saúde
    const baseProduction = 60; // sc/ha
    let production = baseProduction;
    
    production += (this.health.nutrition / 100) * 30;
    production -= (this.health.disease / 100) * 20;
    production -= (this.health.pest / 100) * 15;
    
    production = Math.max(0, Math.min(120, production));
    
    const revenue = production * CONFIG.prices.soySack;
    
    this.status = 'empty';
    this.crop = null;
    this.stage = 'V0';
    this.days = 0;
    this.health = { nutrition: 100, disease: 0, pest: 0 };
    this.updateVisual();
    
    logActivity('🚜', `Talhão ${this.id} colhido: ${production.toFixed(1)} sc/ha - R$ ${revenue.toFixed(2)}`);
    
    return { production, revenue };
  }
  
  updateVisual() {
    const statusClass = this.status === 'planted' || this.status === 'growing' ? 'planted' : '';
    const matureClass = this.status === 'ready' ? 'mature' : '';
    
    this.element.className = `field ${statusClass} ${matureClass}`;
    
    const badge = this.element.querySelector('.field-status-badge');
    badge.textContent = this.getStatusLabel();
  }
  
  getStatusLabel() {
    const labels = {
      'empty': '🔲 Vazio',
      'planted': `🌱 ${this.stage}`,
      'growing': `🌾 ${this.stage}`,
      'ready': '✅ Pronto'
    };
    return labels[this.status] || this.status;
  }
}

// =============================================
// FUNÇÕES DE INICIALIZAÇÃO
// =============================================
async function loadGameData() {
  try {
    const [nutrientsRes, diseasesRes, pestsRes] = await Promise.all([
      fetch('data/soy_nutrients.json'),
      fetch('data/soy_diseases.json'),
      fetch('data/soy_pests.json')
    ]);
    
    gameState.nutrients = await nutrientsRes.json();
    gameState.diseases = await diseasesRes.json();
    gameState.pests = await pestsRes.json();
    
    logActivity('🎮', 'Sistema carregado com sucesso!');
    logActivity('🇧🇷', 'Bem-vindo à Fazenda Brasil - Simulador de Soja!');
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    logActivity('⚠️', 'Modo offline - usando dados padrão');
  }
}

function initializeFields() {
  // Criar 6 talhões em grid
  const fieldConfigs = [
    { id: 'A', row: 5, col: 2, size: 2 },
    { id: 'B', row: 5, col: 5, size: 2 },
    { id: 'C', row: 5, col: 8, size: 2 },
    { id: 'D', row: 7, col: 2, size: 2 },
    { id: 'E', row: 7, col: 5, size: 2 },
    { id: 'F', row: 7, col: 8, size: 2 }
  ];
  
  fieldConfigs.forEach(config => {
    const field = new Field(config.id, config.row, config.col, config.size);
    gameState.farm.fields.push(field);
  });
  
  logActivity('🏡', `${gameState.farm.fields.length} talhões preparados`);
}

function initializeTasks() {
  gameState.tasks = [
    {
      id: 'first-plant',
      title: 'Primeira Plantação',
      description: 'Plante soja no Talhão A',
      icon: '🌱',
      progress: 0,
      target: 1,
      reward: { xp: 50, gold: 100 },
      completed: false
    },
    {
      id: 'advance-10-days',
      title: 'Avançar 10 Dias',
      description: 'Complete um ciclo de crescimento',
      icon: '⏱️',
      progress: 0,
      target: 10,
      reward: { xp: 100, gold: 200 },
      completed: false
    }
  ];
  
  updateTasksUI();
}

// =============================================
// FUNÇÕES DE UI
// =============================================
function updateUI() {
  // Top Bar
  elements.farmName.textContent = gameState.farm.name;
  elements.playerLevel.textContent = `Nível ${gameState.player.level}`;
  elements.goldAmount.textContent = gameState.player.gold.toLocaleString('pt-BR');
  elements.premiumAmount.textContent = gameState.player.premium;
  elements.xpAmount.textContent = `${gameState.player.xp} / ${gameState.player.xpToNext}`;
  elements.temperature.textContent = `${gameState.time.temperature}°C`;
  
  // Bottom Bar
  elements.cycleDay.textContent = gameState.time.day;
  
  // Calcular produção total
  let totalProduction = 0;
  gameState.farm.fields.forEach(field => {
    if (field.status === 'ready') {
      totalProduction += 60; // Estimativa simplificada
    }
  });
  elements.production.textContent = `${totalProduction.toFixed(1)} sc/ha`;
  
  elements.profit.textContent = `R$ ${gameState.economy.profit.toLocaleString('pt-BR')}`;
  
  // Bulba message
  updateBulbaMessage();
}

function updateBulbaMessage() {
  const messages = [
    '🌟 A fazenda está prosperando!',
    '🌱 Hora de plantar mais soja!',
    '💧 Não esqueça a nutrição das plantas!',
    '🦠 Fique atento às doenças!',
    '🐛 Monitore as pragas regularmente!',
    '🚜 Está quase na hora da colheita!'
  ];
  
  const randomMsg = messages[Math.floor(Math.random() * messages.length)];
  elements.bulbaMessage.textContent = `💬 ${randomMsg}`;
}

function updateTasksUI() {
  elements.taskList.innerHTML = '';
  
  gameState.tasks.forEach(task => {
    if (task.completed) return;
    
    const taskEl = document.createElement('div');
    taskEl.className = 'task-item';
    taskEl.innerHTML = `
      <div class="task-icon">${task.icon}</div>
      <div class="task-info">
        <div class="task-title">${task.title}</div>
        <div class="task-desc">${task.description}</div>
        <div class="task-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(task.progress / task.target) * 100}%"></div>
          </div>
          <span>${task.progress}/${task.target}</span>
        </div>
      </div>
      <div class="task-reward">+${task.reward.xp} XP</div>
    `;
    
    elements.taskList.appendChild(taskEl);
  });
}

function showFieldInfo(field) {
  elements.fieldStatus.textContent = field.getStatusLabel();
  elements.fieldCrop.textContent = field.crop || 'Nenhuma';
  elements.fieldStage.textContent = `${field.stage} - ${CONFIG.soyStages[field.stage].label}`;
  elements.fieldDays.textContent = field.days;
  
  // Atualizar barras de saúde
  const nutritionBar = elements.fieldInfo.querySelector('.mini-fill.nutrition');
  const diseaseBar = elements.fieldInfo.querySelector('.mini-fill.disease');
  const pestBar = elements.fieldInfo.querySelector('.mini-fill.pest');
  
  nutritionBar.style.width = `${field.health.nutrition}%`;
  diseaseBar.style.width = `${field.health.disease}%`;
  pestBar.style.width = `${field.health.pest}%`;
  
  // Atualizar textos
  nutritionBar.parentElement.nextElementSibling.textContent = `${Math.round(field.health.nutrition)}%`;
  diseaseBar.parentElement.nextElementSibling.textContent = `${Math.round(field.health.disease)}%`;
  pestBar.parentElement.nextElementSibling.textContent = `${Math.round(field.health.pest)}%`;
  
  elements.fieldInfo.classList.remove('hidden');
}

function logActivity(icon, text) {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `
    <span class="log-icon">${icon}</span>
    <span class="log-text">${text}</span>
  `;
  
  elements.activityLog.prepend(entry);
  
  // Manter apenas 20 entradas
  while (elements.activityLog.children.length > 20) {
    elements.activityLog.removeChild(elements.activityLog.lastChild);
  }
  
  gameState.activityLog.push({ icon, text, time: gameState.time.day });
}

// =============================================
// FUNÇÕES DE GAMEPLAY
// =============================================
function advanceTime() {
  if (gameState.time.paused) return;
  
  const days = 3; // Avançar 3 dias
  gameState.time.day += days;
  
  // Atualizar todos os talhões
  gameState.farm.fields.forEach(field => field.advance(days));
  
  // Atualizar clima
  updateWeather();
  
  // Atualizar tasks
  updateTaskProgress('advance-10-days', days);
  
  // Atualizar UI
  updateUI();
  
  logActivity('📅', `Avançado para o dia ${gameState.time.day}`);
}

function updateWeather() {
  const climates = CONFIG.climates;
  const randomClimate = climates[Math.floor(Math.random() * climates.length)];
  
  gameState.time.weather = randomClimate.type;
  gameState.time.temperature = Math.floor(
    Math.random() * (randomClimate.temp[1] - randomClimate.temp[0]) + randomClimate.temp[0]
  );
  
  const weatherIcon = elements.climate.querySelector('.weather-icon');
  weatherIcon.textContent = randomClimate.icon;
}

function plantField() {
  const emptyField = gameState.farm.fields.find(f => f.status === 'empty');
  if (!emptyField) {
    logActivity('⚠️', 'Nenhum talhão vazio disponível!');
    return;
  }
  
  if (gameState.player.gold < 200) {
    logActivity('⚠️', 'Ouro insuficiente para plantar!');
    return;
  }
  
  if (emptyField.plant('Soja RR')) {
    gameState.player.gold -= 200;
    updateTaskProgress('first-plant', 1);
    updateUI();
  }
}

function harvestField() {
  const readyField = gameState.farm.fields.find(f => f.status === 'ready');
  if (!readyField) {
    logActivity('⚠️', 'Nenhum talhão pronto para colheita!');
    return;
  }
  
  const result = readyField.harvest();
  gameState.player.gold += result.revenue;
  gameState.economy.totalRevenue += result.revenue;
  gameState.economy.profit = gameState.economy.totalRevenue - gameState.economy.totalCost;
  
  // Ganhar XP
  gainXP(50);
  
  updateUI();
}

function updateTaskProgress(taskId, amount) {
  const task = gameState.tasks.find(t => t.id === taskId);
  if (!task || task.completed) return;
  
  task.progress = Math.min(task.target, task.progress + amount);
  
  if (task.progress >= task.target) {
    completeTask(task);
  }
  
  updateTasksUI();
}

function completeTask(task) {
  task.completed = true;
  
  // Dar recompensas
  gainXP(task.reward.xp);
  gameState.player.gold += task.reward.gold;
  
  logActivity('🎯', `Missão completa: ${task.title} - +${task.reward.xp} XP, +R$${task.reward.gold}`);
  updateUI();
}

function gainXP(amount) {
  gameState.player.xp += amount;
  
  while (gameState.player.xp >= gameState.player.xpToNext) {
    gameState.player.xp -= gameState.player.xpToNext;
    gameState.player.level++;
    gameState.player.xpToNext = Math.floor(gameState.player.xpToNext * 1.5);
    
    logActivity('⭐', `Level UP! Você atingiu o nível ${gameState.player.level}!`);
  }
}

// =============================================
// EVENT LISTENERS
// =============================================
elements.advanceBtn.addEventListener('click', advanceTime);
elements.plantBtn.addEventListener('click', plantField);
elements.harvestBtn.addEventListener('click', harvestField);

elements.pauseBtn.addEventListener('click', () => {
  gameState.time.paused = !gameState.time.paused;
  elements.pauseBtn.textContent = gameState.time.paused ? '▶️ Continuar' : '⏸️ Pausar';
});

// Fechar painel de info
const closeBtn = elements.fieldInfo.querySelector('.close-btn');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    elements.fieldInfo.classList.add('hidden');
  });
}

// =============================================
// INICIALIZAÇÃO
// =============================================
async function init() {
  await loadGameData();
  initializeFields();
  initializeTasks();
  updateUI();
  updateWeather();
}

// Iniciar o jogo
init();
