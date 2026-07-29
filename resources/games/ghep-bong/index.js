import './style.css';
import { endGame, playTone } from '../../js/app.js';

const ANIMALS = [
    { key: 'dog', emoji: '🐶' },
    { key: 'cat', emoji: '🐱' },
    { key: 'rabbit', emoji: '🐰' },
    { key: 'bear', emoji: '🐻' },
    { key: 'lion', emoji: '🦁' },
    { key: 'tiger', emoji: '🐯' },
    { key: 'panda', emoji: '🐼' },
    { key: 'koala', emoji: '🐨' },
    { key: 'frog', emoji: '🐸' },
    { key: 'pig', emoji: '🐷' },
    { key: 'monkey', emoji: '🐵' },
    { key: 'chicken', emoji: '🐔' },
    { key: 'cow', emoji: '🐮' },
    { key: 'duck', emoji: '🦆' },
    { key: 'horse', emoji: '🐴' },
    { key: 'sheep', emoji: '🐑' },
    { key: 'elephant', emoji: '🐘' },
    { key: 'zebra', emoji: '🦓' },
    { key: 'owl', emoji: '🦉' },
    { key: 'fox', emoji: '🦊' },
    { key: 'turtle', emoji: '🐢' },
    { key: 'fish', emoji: '🐟' },
    { key: 'bird', emoji: '🐦' },
    { key: 'snake', emoji: '🐍' },
    { key: 'bee', emoji: '🐝' },
    { key: 'butterfly', emoji: '🦋' },
    { key: 'whale', emoji: '🐳' },
    { key: 'dolphin', emoji: '🐬' },
    { key: 'crab', emoji: '🦀' },
    { key: 'penguin', emoji: '🐧' },
];

const STARTING_COUNT = 2;
const MAX_COUNT = 8;
const TIME_LIMIT_MS = 7000;
const CORRECT_PAUSE_MS = 800;

function createSoundEffects() {
    return {
        correct() {
            playTone(880, 0, 0.15, 'sine', 0.35);
            playTone(1174.66, 0.12, 0.18, 'sine', 0.35);
        },
        wrong() {
            playTone(160, 0, 0.35, 'sawtooth', 0.3);
        },
    };
}

function shuffle(items) {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function randomDecoys(excludeKey, count) {
    const pool = ANIMALS.filter((animal) => animal.key !== excludeKey);
    return shuffle(pool).slice(0, count);
}

function buildShadows(target, count) {
    const decoys = randomDecoys(target.key, count - 1);
    return shuffle([target, ...decoys]);
}

function initShadowGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'shadowMatchBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let targetKey = null;
    let acceptingAnswer = false;
    let isGameOver = false;
    let timer = null;
    let timeLeft = 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'shadow-game';

    const stats = document.createElement('div');
    stats.className = 'shadow-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'shadow-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'shadow-game-board-wrap';

    const timerWrap = document.createElement('div');
    timerWrap.className = 'shadow-game-timer-wrap';
    const timerBar = document.createElement('div');
    timerBar.className = 'shadow-game-timer-bar';
    timerWrap.appendChild(timerBar);

    const statusText = document.createElement('div');
    statusText.className = 'shadow-game-status';
    statusText.textContent = 'Tìm đúng chiếc bóng của con vật nhé!';

    const targetCard = document.createElement('div');
    targetCard.className = 'shadow-target-card';
    targetCard.innerHTML = `<span class="shadow-target-emoji" data-role="target"></span>`;

    const options = document.createElement('div');
    options.className = 'shadow-options';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'shadow-game-start';
    startOverlay.innerHTML = `<button type="button" class="shadow-game-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(timerWrap, statusText, targetCard, options, startOverlay);

    const message = document.createElement('div');
    message.className = 'shadow-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="shadow-message-card">
            <div class="shadow-message-emoji">👻</div>
            <div class="shadow-message-text" data-role="message-text"></div>
            <button type="button" class="shadow-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const targetEl = targetCard.querySelector('[data-role="target"]');
    const startButton = startOverlay.querySelector('.shadow-game-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.shadow-message-ok');

    function updateStats() {
        levelEl.textContent = String(round);
        bestEl.textContent = String(bestScore);
    }

    function startTimer() {
        clearInterval(timer);
        timeLeft = TIME_LIMIT_MS;
        updateTimerBar();

        timer = setInterval(() => {
            timeLeft -= 100;
            updateTimerBar();

            if (timeLeft <= 0) {
                clearInterval(timer);
                handleGameOver('Hết giờ mất rồi!');
            }
        }, 100);
    }

    function updateTimerBar() {
        const percentage = Math.max(0, (timeLeft / TIME_LIMIT_MS) * 100);
        timerBar.style.width = `${percentage}%`;

        timerBar.classList.remove('warning', 'danger');
        if (percentage < 30) {
            timerBar.classList.add('danger');
        } else if (percentage < 60) {
            timerBar.classList.add('warning');
        }
    }

    function renderOptions(shadows) {
        options.innerHTML = '';
        shadows.forEach((animal) => {
            const shadow = document.createElement('button');
            shadow.type = 'button';
            shadow.className = 'shadow-option';
            shadow.dataset.key = animal.key;
            shadow.setAttribute('aria-label', 'Chiếc bóng con vật');
            shadow.textContent = animal.emoji;
            shadow.addEventListener('click', () => handleChoice(animal.key, shadow));
            options.appendChild(shadow);
        });
    }

    function startRound() {
        round += 1;
        acceptingAnswer = true;
        updateStats();

        const target = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        targetKey = target.key;
        targetEl.textContent = target.emoji;

        const shadowCount = Math.min(STARTING_COUNT + round - 1, MAX_COUNT);
        renderOptions(buildShadows(target, shadowCount));

        statusText.textContent = 'Chiếc bóng nào là của con vật này?';
        startTimer();
    }

    function handleChoice(key, shadow) {
        if (!acceptingAnswer || isGameOver) {
            return;
        }

        if (key === targetKey) {
            acceptingAnswer = false;
            clearInterval(timer);
            sound.correct();
            shadow.classList.add('correct');
            statusText.textContent = '🎉 Chính xác!';
            setTimeout(startRound, CORRECT_PAUSE_MS);
            return;
        }

        acceptingAnswer = false;
        clearInterval(timer);
        shadow.classList.add('wrong');
        sound.wrong();
        handleGameOver();
    }

    function handleGameOver(reason = '') {
        isGameOver = true;
        acceptingAnswer = false;
        clearInterval(timer);

        const roundsCompleted = round - 1;

        if (roundsCompleted > bestScore) {
            bestScore = roundsCompleted;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        endGame(roundsCompleted);
        updateStats();

        const targetAnimal = ANIMALS.find((animal) => animal.key === targetKey);
        const prefix = reason ? `${reason} ` : '';
        messageTextEl.textContent = `${prefix}Đó là bóng của ${targetAnimal.emoji}. Bạn đã qua ${roundsCompleted} vòng!`;
        message.hidden = false;
    }

    function beginGame() {
        round = 0;
        isGameOver = false;
        updateStats();
        startRound();
    }

    startButton.addEventListener('click', () => {
        startOverlay.hidden = true;
        beginGame();
    });

    restartButton.addEventListener('click', () => {
        message.hidden = true;
        beginGame();
    });

    messageOkButton.addEventListener('click', () => {
        message.hidden = true;
        startOverlay.hidden = false;
        options.innerHTML = '';
        targetEl.textContent = '';
        statusText.textContent = 'Tìm đúng chiếc bóng của con vật nhé!';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');

if (container) {
    initShadowGame(container);
}
