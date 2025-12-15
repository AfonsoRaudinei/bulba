# 🌱 Fazenda do Produtor - Jogo Educativo de Soja

Um jogo web educativo que simula o manejo da cultura da soja, combinando decisões técnicas com o cuidado de um Bulbasauro como mascote da fazenda.

## 📋 Sobre o Projeto

Este jogo foi desenvolvido para ensinar conceitos de manejo agrícola (nutrição, pragas, doenças) de forma lúdica e acessível. O jogador assume o papel de um produtor rural que cuida da lavoura de soja e do seu companheiro Bulbasauro.

## 🎮 Como Jogar

1. **Avançar o tempo**: Clique em "Avançar tempo" para progredir no ciclo da soja
2. **Cuidar do Bulbasauro**: 
   - 🍎 Alimentar: Restaura energia
   - 🎮 Brincar: Aumenta humor e confiança
   - 🔍 Inspecionar: Analisa a lavoura e identifica problemas
3. **Monitorar a lavoura**: Acompanhe as barras de Nutrição, Doenças e Pragas
4. **Atingir alta produtividade**: Mantenha a lavoura saudável para maximizar sacas/ha

## 📊 Mecânicas do Jogo

### Saúde da Lavoura
- **Nutrição (0-100%)**: Diminui conforme a planta absorve nutrientes. Baixa nutrição = baixa produtividade
- **Doenças (0-100%)**: Aumenta conforme o estádio. Controle é essencial em R3-R6
- **Pragas (0-100%)**: Segue padrão Tripes → Lagartas → Percevejos

### Estádios Fenológicos
O jogo segue os estádios reais da soja:
- **V0**: Plantio
- **V2**: Primeira folha trifoliolada
- **V4**: 🚨 Janela crítica de nutrição
- **R1**: 🚨 Início do florescimento - explosão de demanda
- **R3**: 🚨 Formação de vagens - última chance de correção
- **R5**: Enchimento de grãos
- **R6**: Grãos cheios
- **R7**: Início da maturação
- **R8**: Maturação plena

### Bulbasauro
- **Energia**: Consumida por ações, restaurada alimentando
- **Humor**: Afetado pela saúde da lavoura e brincadeiras
- **Confiança**: Cresce com inspeções e boas decisões, dá bônus de produtividade

## 🗂️ Estrutura de Arquivos

```
fazenda-produtor/
├── index.html          # Estrutura HTML
├── styles.css          # Estilos flat design
├── game.js             # Lógica do jogo
├── data/
│   ├── soy_nutrients.json   # Dados de absorção de nutrientes
│   ├── soy_diseases.json    # Intensidade de doenças por estádio
│   └── soy_pests.json       # Dinâmica de pragas
└── README.md
```

## 🎨 Design

O jogo usa **flat design ilustrado** com:
- Paleta de cores inspirada em fazendas modernas
- Formas geométricas simples
- Visual limpo e minimalista
- Animações suaves

### Paleta de Cores
- Verde principal: `#3e8c4f`
- Solo: `#8b4513`
- Céu: `#87ceeb`
- Amarelo sol: `#f5c84c`

## 🔮 Versões Futuras

### Versão 0.3 - Missões e Visitas
- Sistema de semanas e talhões
- Checklist de visitas
- Bônus por visitas no momento certo

### Versão 0.4 - Produtos e Nutrientes
- Escolha entre fontes de nutrientes (Sulfato vs Acetato, etc.)
- Decisões de aplicação foliar vs solo
- Risco de fitotoxidade

### Versão 0.5 - Mobile e PWA
- Layout otimizado para mobile
- Progressive Web App
- Modo offline

## 🛠️ Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Flat design, gradientes, animações
- **JavaScript (Vanilla)**: Lógica do jogo
- **JSON**: Banco de dados dos parâmetros técnicos

## 📱 Compatibilidade

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (iOS/Android)

## 🎯 Objetivos Educacionais

1. **Janelas críticas**: Ensinar V4, R1, R3 como momentos de intervenção
2. **Dinâmica de pragas**: Tripes → Lagartas → Percevejos
3. **Padrão de doenças**: Míldio/Oídio → Ferrugem → Mancha Parda
4. **Impacto do manejo**: Decisões afetam produtividade final

## 🚀 Como Rodar

1. Clone ou baixe os arquivos
2. Abra `index.html` em um navegador moderno
3. Não precisa de servidor - roda localmente!

Para desenvolvimento com live reload:
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js
npx http-server
```

## 📄 Licença

Este projeto é educacional e pode ser usado livremente para fins de aprendizado.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! Este é um projeto em desenvolvimento contínuo.

---

**Desenvolvido com 🌱 para produtores rurais e entusiastas da agricultura**
