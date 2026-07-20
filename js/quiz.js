const QUIZ_STEPS = [
  {
    question: 'Что вас сейчас больше всего привлекает?',
    options: [
      { text: 'Понять своё предназначение и жизненный код', value: 'matrix' },
      { text: 'Снять тревогу и обрести покой через творчество', value: 'neuro' },
      { text: 'Глубокая работа на всех уровнях — мысли, эмоции, тело', value: 'integrative' },
    ],
  },
  {
    question: 'Как вы предпочитаете работать с собой?',
    options: [
      { text: 'Через числа, анализ и расшифровку матрицы', value: 'matrix' },
      { text: 'Через рисование и творческие практики', value: 'neuro' },
      { text: 'Через синтез разных методов — рисунок, символы, коучинг', value: 'integrative' },
    ],
  },
  {
    question: 'Какой результат для вас важнее?',
    options: [
      { text: 'Ясность пути, талантов и жизненных задач', value: 'matrix' },
      { text: 'Внутреннее расслабление и новые нейронные связи', value: 'neuro' },
      { text: 'Целостная трансформация и устойчивые изменения', value: 'integrative' },
    ],
  },
];

const RESULTS = {
  matrix: {
    title: 'Вам ближе Матрица Судьбы',
    text: 'Вы интуитивно тянетесь к пониманию своего кода и предназначения. Матрица Судьбы поможет расшифровать таланты, задачи и жизненный путь.',
    page: 'matrica-sudby.html',
    cta: 'Узнать о Матрице',
    destination: 'telegram',
  },
  neuro: {
    title: 'Вам ближе Нейрографика',
    text: 'Творческий путь — ваш естественный способ трансформации. Нейрографика мягко перестраивает мышление через осознанное рисование.',
    page: 'neyrografika.html',
    cta: 'О нейрографике',
    destination: 'channel',
  },
  integrative: {
    title: 'Вам ближе Интегративный подход',
    text: 'Вы ищете целостную работу на всех уровнях. MAGICART объединяет арт-терапию, нейрографику, коучинг и сакральную геометрию.',
    page: 'integrativny-podhod.html',
    cta: 'Об интегративном подходе',
    destination: 'vk',
  },
};

const DESTINATIONS = {
  telegram: {
    label: 'Написать в Telegram',
    url: 'https://t.me/anna_yakubova79',
  },
  channel: {
    label: 'Подписаться на канал',
    url: 'https://t.me/madam79kotineiro',
  },
  vk: {
    label: 'Группа ВКонтакте',
    url: 'https://vk.ru/club236251530',
  },
  diary: {
    label: 'Личный дневник',
    url: 'dnevnik.html',
  },
};

let currentStep = 0;
let answers = [];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('quiz-step-container');
  if (!container) return;

  document.getElementById('quiz-prev').addEventListener('click', goPrev);
  document.getElementById('quiz-next').addEventListener('click', goNext);

  renderStep();
});

function renderStep() {
  const container = document.getElementById('quiz-step-container');
  const progressBar = document.getElementById('quiz-progress-bar');
  const nav = document.getElementById('quiz-nav');
  const prevBtn = document.getElementById('quiz-prev');
  const nextBtn = document.getElementById('quiz-next');

  if (currentStep >= QUIZ_STEPS.length) {
    renderResult();
    nav.style.display = 'none';
    progressBar.style.width = '100%';
    return;
  }

  nav.style.display = 'flex';
  const step = QUIZ_STEPS[currentStep];
  const progress = ((currentStep + 1) / QUIZ_STEPS.length) * 100;
  progressBar.style.width = `${progress}%`;

  prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = currentStep === QUIZ_STEPS.length - 1 ? 'Результат' : 'Далее';
  nextBtn.disabled = !answers[currentStep];

  container.innerHTML = `
    <div class="quiz-step">
      <p class="quiz-step__num">Вопрос ${currentStep + 1} из ${QUIZ_STEPS.length}</p>
      <h2 class="quiz-step__question">${step.question}</h2>
      <div class="quiz-options">
        ${step.options
          .map(
            (opt, i) => `
          <label class="quiz-option ${answers[currentStep] === opt.value ? 'quiz-option--selected' : ''}">
            <input type="radio" name="quiz-answer" value="${opt.value}" ${answers[currentStep] === opt.value ? 'checked' : ''}>
            <span class="quiz-option__text">${opt.text}</span>
          </label>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('input[name="quiz-answer"]').forEach((input) => {
    input.addEventListener('change', (e) => {
      answers[currentStep] = e.target.value;
      container.querySelectorAll('.quiz-option').forEach((el) => {
        el.classList.remove('quiz-option--selected');
      });
      e.target.closest('.quiz-option').classList.add('quiz-option--selected');
      nextBtn.disabled = false;
    });
  });
}

function renderResult() {
  const container = document.getElementById('quiz-step-container');
  const scores = { matrix: 0, neuro: 0, integrative: 0 };

  answers.forEach((a) => {
    if (scores[a] !== undefined) scores[a]++;
  });

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const result = RESULTS[winner];
  const dest = DESTINATIONS[result.destination];

  container.innerHTML = `
    <div class="quiz-result">
      <div class="ornament"><span class="ornament__symbol">✧</span></div>
      <h2 class="quiz-result__title">${result.title}</h2>
      <p class="quiz-result__text">${result.text}</p>
      <div class="quiz-result__actions">
        <a href="${result.page}" class="btn btn--primary">${result.cta}</a>
        <a href="${dest.url}" class="btn btn--accent" ${dest.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${dest.label}</a>
      </div>
      <div class="quiz-result__links">
        <p>Также загляните:</p>
        <ul>
          <li><a href="https://t.me/anna_yakubova79" target="_blank" rel="noopener noreferrer">Telegram — @anna_yakubova79</a></li>
          <li><a href="https://t.me/madam79kotineiro" target="_blank" rel="noopener noreferrer">Канал в Telegram</a></li>
          <li><a href="https://vk.ru/club236251530" target="_blank" rel="noopener noreferrer">Группа ВКонтакте</a></li>
          <li><a href="dnevnik.html">Личный дневник</a></li>
        </ul>
      </div>
      <button type="button" class="btn btn--secondary quiz-result__restart" id="quiz-restart">Пройти заново</button>
    </div>
  `;

  document.getElementById('quiz-restart').addEventListener('click', () => {
    currentStep = 0;
    answers = [];
    document.getElementById('quiz-nav').style.display = 'flex';
    renderStep();
  });
}

function goPrev() {
  if (currentStep > 0) {
    currentStep--;
    renderStep();
  }
}

function goNext() {
  if (!answers[currentStep]) return;

  if (currentStep < QUIZ_STEPS.length - 1) {
    currentStep++;
    renderStep();
  } else {
    currentStep = QUIZ_STEPS.length;
    renderStep();
  }
}
