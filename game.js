// ============================================
// ESTADO DO JOGO
// ============================================
const gameState = {
  currentDay: 0,
  currentStage: 'V0',
  stageIndex: 0,
  
  // Saúde da lavoura (0-100)
  cropHealth: {
    nutrition: 100,      // Quanto maior, melhor
    disease: 0,          // Quanto maior, pior
    pest: 0              // Quanto maior, pior
  },
  
  // Bulbasauro
  bulbasaur: {
    energy: 100,
    mood: 100,
    trust: 50
  },
  
  // Produtividade estimada
  productivity: 0,
  
  // Dados carregados
  nutrients: null,
  diseases: null,
  pests: null
};

// Ordem dos estádios
const stageOrder = ['V0', 'V2', 'V4', 'R1', 'R3', 'R5', 'R6', 'R7', 'R8'];

// Mapeamento de dias por estádio (simplificado para o jogo)
const stageDays = {
  'V0': 0,
  'V2': 10,
  'V4': 20,
  'R1': 40,
  'R3': 55,
  'R5': 70,
  'R6': 85,
  'R7': 100,
  'R8': 115
};

// Classes visuais para os estádios
const stageClasses = {
  'V0': 'crop-stage-0',
  'V2': 'crop-stage-1',
  'V4': 'crop-stage-2',
  'R1': 'crop-stage-3',
  'R3': 'crop-stage-4',
  'R5': 'crop-stage-4',
  'R6': 'crop-stage-5',
  'R7': 'crop-stage-5',
  'R8': 'crop-stage-5'
};

// ============================================
// ELEMENTOS DO DOM
// ============================================
const elements = {
  // Header
  dayCounter: document.getElementById('day-counter'),
  soyStage: document.getElementById('soy-stage'),
  productivity: document.getElementById('productivity'),
  
  // Campo
  cropLayer: document.getElementById('crop-layer'),
  
  // Saúde da lavoura
  nutritionBar: document.getElementById('nutrition-bar'),
  nutritionValue: document.getElementById('nutrition-value'),
  diseaseBar: document.getElementById('disease-bar'),
  diseaseValue: document.getElementById('disease-value'),
  pestBar: document.getElementById('pest-bar'),
  pestValue: document.getElementById('pest-value'),
  warningPanel: document.getElementById('warning-panel'),
  
  // Bulbasauro
  energyBar: document.getElementById('energy-bar'),
  energyValue: document.getElementById('energy-value'),
  moodBar: document.getElementById('mood-bar'),
  moodValue: document.getElementById('mood-value'),
  trustBar: document.getElementById('trust-bar'),
  trustValue: document.getElementById('trust-value'),
  bulbaMoodText: document.getElementById('bulba-mood-text'),
  
  // Botões
  advanceBtn: document.getElementById('advance-day-btn'),
  feedBtn: document.getElementById('feed-btn'),
  playBtn: document.getElementById('play-btn'),
  inspectBtn: document.getElementById('inspect-btn'),
  
  // Log
  logList: document.getElementById('log-list')
};

// ============================================
// CARREGAR DADOS JSON
// ============================================
async function loadGameData() {
  try {
    const [nutrientsRes, diseasesRes, pestsRes] = await Promise.all([
      fetch('soy_nutrients.json'),
      fetch('soy_diseases.json'),
      fetch('soy_pests.json')
    ]);
    
    gameState.nutrients = await nutrientsRes.json();
    gameState.diseases = await diseasesRes.json();
    gameState.pests = await pestsRes.json();
    
    logMessage('🎮 Sistema iniciado com sucesso!');
    logMessage('🌱 Bem-vindo à Fazenda do Produtor!');
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    logMessage('⚠️ Erro ao carregar dados. Verifique os arquivos JSON.');
  }
}

// ============================================
// FUNÇÕES DE UTILIDADE
// ============================================
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getCurrentStageData(dataSource) {
  if (!dataSource || !dataSource.stages) return null;
  return dataSource.stages[gameState.currentStage];
}

function logMessage(text, type = 'info') {
  const li = document.createElement('li');
  li.textContent = text;
  li.className = `log-${type}`;
  elements.logList.prepend(li);
  
  // Manter apenas últimas 20 mensagens
  while (elements.logList.children.length > 20) {
    elements.logList.removeChild(elements.logList.lastChild);
  }
}

// ============================================
// ATUALIZAÇÃO DE UI
// ============================================
function updateUI() {
  // Header
  elements.dayCounter.textContent = gameState.currentDay;
  
  const stageData = getCurrentStageData(gameState.nutrients);
  if (stageData) {
    elements.soyStage.textContent = `${stageData.code} - ${stageData.label}`;
  }
  
  elements.productivity.textContent = `${gameState.productivity.toFixed(1)} sc/ha`;
  
  // Atualizar visual do campo
  updateCropVisual();
  
  // Saúde da lavoura
  updateHealthBars();
  
  // Bulbasauro
  updateBulbasaurUI();
  
  // Avisos
  updateWarnings();
}

function updateCropVisual() {
  const cropClass = stageClasses[gameState.currentStage] || 'crop-stage-0';
  elements.cropLayer.className = `field-layer crop ${cropClass}`;
}

function updateHealthBars() {
  const { nutrition, disease, pest } = gameState.cropHealth;
  
  // Nutrição
  elements.nutritionBar.style.width = `${nutrition}%`;
  elements.nutritionValue.textContent = `${Math.round(nutrition)}%`;
  
  // Doenças
  elements.diseaseBar.style.width = `${disease}%`;
  elements.diseaseValue.textContent = `${Math.round(disease)}%`;
  
  // Pragas
  elements.pestBar.style.width = `${pest}%`;
  elements.pestValue.textContent = `${Math.round(pest)}%`;
}

function updateBulbasaurUI() {
  const { energy, mood, trust } = gameState.bulbasaur;
  
  // Barras
  elements.energyBar.style.width = `${energy}%`;
  elements.energyValue.textContent = `${Math.round(energy)}%`;
  
  elements.moodBar.style.width = `${mood}%`;
  elements.moodValue.textContent = `${Math.round(mood)}%`;
  
  // Atualizar classe da barra de humor
  elements.moodBar.className = 'status-bar mood-bar';
  if (mood >= 70) {
    elements.moodBar.classList.add('happy');
  } else if (mood <= 30) {
    elements.moodBar.classList.add('sad');
  }
  
  elements.trustBar.style.width = `${trust}%`;
  elements.trustValue.textContent = `${Math.round(trust)}%`;
  
  // Texto de humor
  updateBulbasaurMood();
}

function updateBulbasaurMood() {
  const { energy, mood, trust } = gameState.bulbasaur;
  const { nutrition, disease, pest } = gameState.cropHealth;
  
  let moodText = '';
  let moodClass = '';
  
  // Verificar condições críticas
  if (disease > 70 || pest > 70) {
    moodText = '😰 Bulbasauro está muito preocupado com a lavoura!';
    moodClass = 'stressed';
  } else if (nutrition < 30) {
    moodText = '😟 Bulbasauro sente que a lavoura precisa de nutrientes...';
    moodClass = 'worried';
  } else if (energy < 20) {
    moodText = '😴 Bulbasauro está exausto, precisa descansar!';
    moodClass = 'worried';
  } else if (mood < 30) {
    moodText = '😢 Bulbasauro está triste... que tal brincar um pouco?';
    moodClass = 'worried';
  } else if (mood >= 80 && trust >= 70 && nutrition >= 70) {
    moodText = '🌟 Bulbasauro está radiante! A fazenda vai bem!';
    moodClass = 'happy';
  } else if (mood >= 60) {
    moodText = '😊 Bulbasauro está feliz e confiante!';
    moodClass = 'happy';
  } else {
    moodText = '🙂 Bulbasauro está observando a lavoura atentamente.';
    moodClass = '';
  }
  
  elements.bulbaMoodText.textContent = moodText;
  elements.bulbaMoodText.className = `bulba-mood ${moodClass}`;
}

function updateWarnings() {
  const stageData = getCurrentStageData(gameState.nutrients);
  const diseaseData = getCurrentStageData(gameState.diseases);
  
  let warnings = [];
  
  // Avisos de janelas críticas
  if (stageData && stageData.warning) {
    warnings.push(`⚠️ ${stageData.warning}`);
  }
  
  // Avisos de doenças críticas
  if (diseaseData && diseaseData.pattern) {
    warnings.push(`🦠 ${diseaseData.pattern}`);
  }
  
  // Avisos baseados em valores
  if (gameState.cropHealth.nutrition < 40) {
    warnings.push('💚 Nutrição baixa! A planta está sofrendo.');
  }
  
  if (gameState.cropHealth.disease > 60) {
    warnings.push('🚨 Pressão de doenças alta! Ação urgente necessária.');
  }
  
  if (gameState.cropHealth.pest > 60) {
    warnings.push('🐛 Ataque severo de pragas! Controle imediato!');
  }
  
  // Exibir avisos
  if (warnings.length > 0) {
    elements.warningPanel.innerHTML = warnings.join('<br>');
    elements.warningPanel.classList.remove('hidden', 'success');
    
    if (gameState.cropHealth.disease > 70 || gameState.cropHealth.pest > 70) {
      elements.warningPanel.classList.add('critical');
    }
  } else {
    elements.warningPanel.classList.add('hidden');
  }
}

// ============================================
// LÓGICA DO CICLO DA CULTURA
// ============================================
function advanceDay() {
  gameState.currentDay += 3; // Avança 3 dias de uma vez para acelerar
  
  // Verificar mudança de estádio
  checkStageAdvancement();
  
  // Atualizar saúde da lavoura baseado nos dados
  updateCropHealthFromData();
  
  // Desgaste natural do Bulbasauro
  gameState.bulbasaur.energy = clamp(gameState.bulbasaur.energy - 8);
  gameState.bulbasaur.mood = clamp(gameState.bulbasaur.mood - 5);
  
  // Influência da lavoura no Bulbasauro
  updateBulbasaurFromCrop();
  
  // Calcular produtividade
  calculateProductivity();
  
  // Atualizar UI
  updateUI();
  
  // Log de avanço
  logMessage(`📅 Dia ${gameState.currentDay} - ${gameState.currentStage}`);
  
  // Verificar fim do ciclo
  if (gameState.currentStage === 'R8' && gameState.currentDay >= 120) {
    endCycle();
  }
}

function checkStageAdvancement() {
  const currentIndex = stageOrder.indexOf(gameState.currentStage);
  const nextStage = stageOrder[currentIndex + 1];
  
  if (nextStage && gameState.currentDay >= stageDays[nextStage]) {
    gameState.currentStage = nextStage;
    gameState.stageIndex = currentIndex + 1;
    
    const stageData = getCurrentStageData(gameState.nutrients);
    if (stageData) {
      logMessage(`🌱 A soja avançou para ${stageData.code} - ${stageData.label}!`, 'success');
      
      if (stageData.critical) {
        logMessage(`⚠️ JANELA CRÍTICA: ${stageData.warning}`, 'warning');
      }
    }
  }
}

function updateCropHealthFromData() {
  // Atualizar nutrição (decresce com a absorção)
  const nutrientData = getCurrentStageData(gameState.nutrients);
  if (nutrientData && nutrientData.nutrients) {
    // Pegar média dos principais nutrientes
    const avgAbsorption = (
      nutrientData.nutrients.nitrogen +
      nutrientData.nutrients.phosphorus +
      nutrientData.nutrients.potassium +
      nutrientData.nutrients.calcium
    ) / 4;
    
    // Nutrição diminui conforme aumenta a absorção necessária
    gameState.cropHealth.nutrition = clamp(100 - avgAbsorption);
  }
  
  // Atualizar doenças
  const diseaseData = getCurrentStageData(gameState.diseases);
  if (diseaseData && diseaseData.diseases) {
    // Pegar a doença dominante
    const diseases = diseaseData.diseases;
    const maxDisease = Math.max(...Object.values(diseases));
    gameState.cropHealth.disease = clamp(maxDisease);
  }
  
  // Atualizar pragas
  const pestData = getCurrentStageData(gameState.pests);
  if (pestData && pestData.pests) {
    // Pegar a praga dominante
    const pests = pestData.pests;
    const maxPest = Math.max(...Object.values(pests));
    gameState.cropHealth.pest = clamp(maxPest);
  }
}

function updateBulbasaurFromCrop() {
  const { nutrition, disease, pest } = gameState.cropHealth;
  
  // Lavoura saudável aumenta humor e confiança
  if (nutrition > 70 && disease < 30 && pest < 30) {
    gameState.bulbasaur.mood = clamp(gameState.bulbasaur.mood + 2);
    gameState.bulbasaur.trust = clamp(gameState.bulbasaur.trust + 1);
  }
  
  // Lavoura doente diminui humor
  if (disease > 60 || pest > 60) {
    gameState.bulbasaur.mood = clamp(gameState.bulbasaur.mood - 3);
  }
  
  // Nutrição muito baixa preocupa o Bulbasauro
  if (nutrition < 40) {
    gameState.bulbasaur.mood = clamp(gameState.bulbasaur.mood - 2);
  }
}

function calculateProductivity() {
  // Fórmula simplificada de produtividade
  const { nutrition, disease, pest } = gameState.cropHealth;
  const { trust } = gameState.bulbasaur;
  
  // Base: 60 sc/ha
  let productivity = 60;
  
  // Nutrição contribui positivamente (0-30 sc/ha)
  productivity += (nutrition / 100) * 30;
  
  // Doenças reduzem (-0 a -20 sc/ha)
  productivity -= (disease / 100) * 20;
  
  // Pragas reduzem (-0 a -15 sc/ha)
  productivity -= (pest / 100) * 15;
  
  // Confiança do Bulbasauro dá bônus (0-10 sc/ha)
  productivity += (trust / 100) * 10;
  
  // Estádios críticos com problemas penalizam mais
  if (['R3', 'R4', 'R5', 'R6'].includes(gameState.currentStage)) {
    if (disease > 70) productivity -= 10;
    if (pest > 70) productivity -= 10;
  }
  
  gameState.productivity = clamp(productivity, 0, 120);
}

function endCycle() {
  logMessage('🎉 CICLO COMPLETO!', 'success');
  logMessage(`🏆 Produtividade final: ${gameState.productivity.toFixed(1)} sc/ha`, 'success');
  
  if (gameState.productivity >= 90) {
    logMessage('⭐⭐⭐ EXCELENTE MANEJO!', 'success');
  } else if (gameState.productivity >= 70) {
    logMessage('⭐⭐ BOM TRABALHO!', 'success');
  } else if (gameState.productivity >= 50) {
    logMessage('⭐ PODE MELHORAR!', 'warning');
  } else {
    logMessage('💡 Estude mais sobre o manejo da soja!', 'warning');
  }
  
  elements.advanceBtn.disabled = true;
  elements.advanceBtn.textContent = '✅ Ciclo Finalizado';
}

// ============================================
// AÇÕES DO BULBASAURO
// ============================================
function feedBulbasaur() {
  gameState.bulbasaur.energy = clamp(gameState.bulbasaur.energy + 20);
  gameState.bulbasaur.mood = clamp(gameState.bulbasaur.mood + 5);
  
  updateUI();
  logMessage('🍎 Você alimentou o Bulbasauro! Energia restaurada.');
}

function playWithBulbasaur() {
  gameState.bulbasaur.mood = clamp(gameState.bulbasaur.mood + 18);
  gameState.bulbasaur.trust = clamp(gameState.bulbasaur.trust + 3);
  gameState.bulbasaur.energy = clamp(gameState.bulbasaur.energy - 8);
  
  updateUI();
  logMessage('🎮 Você brincou com o Bulbasauro! Ele está mais feliz e confiante.');
}

function inspectCrop() {
  const diseaseData = getCurrentStageData(gameState.diseases);
  const pestData = getCurrentStageData(gameState.pests);
  
  logMessage('🔍 Bulbasauro inspecionou a lavoura...');
  
  if (diseaseData && diseaseData.dominant) {
    const diseaseName = gameState.diseases.disease_info[diseaseData.dominant]?.name || 'Doença não identificada';
    logMessage(`🦠 Principal doença: ${diseaseName} (${Math.round(gameState.cropHealth.disease)}%)`);
  }
  
  if (pestData && pestData.dominant) {
    const pestName = gameState.pests.pest_info[pestData.dominant]?.name || 'Praga não identificada';
    logMessage(`🐛 Principal praga: ${pestName} (${Math.round(gameState.cropHealth.pest)}%)`);
  }
  
  if (gameState.cropHealth.nutrition < 50) {
    logMessage('💚 Nutrição deficiente! Considere aplicação foliar.');
  }
  
  gameState.bulbasaur.trust = clamp(gameState.bulbasaur.trust + 2);
  gameState.bulbasaur.energy = clamp(gameState.bulbasaur.energy - 5);
  
  updateUI();
}

// ============================================
// EVENT LISTENERS
// ============================================
elements.advanceBtn.addEventListener('click', advanceDay);
elements.feedBtn.addEventListener('click', feedBulbasaur);
elements.playBtn.addEventListener('click', playWithBulbasaur);
elements.inspectBtn.addEventListener('click', inspectCrop);

// ============================================
// INICIALIZAÇÃO
// ============================================
async function init() {
  await loadGameData();
  updateUI();
}

// Iniciar o jogo quando a página carregar
init();
