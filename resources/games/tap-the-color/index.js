import './style.css';
import { endGame, playTone } from '../../js/app.js';

const COLORS = [
    { key: 'red', name: 'red', hex: '#e53935' },
    { key: 'blue', name: 'blue', hex: '#1e88e5' },
    { key: 'green', name: 'green', hex: '#43a047' },
    { key: 'yellow', name: 'yellow', hex: '#fdd835' },
    { key: 'orange', name: 'orange', hex: '#fb8c00' },
    { key: 'purple', name: 'purple', hex: '#8e24aa' },
    { key: 'pink', name: 'pink', hex: '#ec407a' },
    { key: 'brown', name: 'brown', hex: '#6d4c41' },
    { key: 'black', name: 'black', hex: '#263238' },
    { key: 'gray', name: 'gray', hex: '#9e9e9e' },
    { key: 'white', name: 'white', hex: '#ffffff' },
    { key: 'sky-blue', name: 'sky blue', hex: '#4fc3f7' },
    { key: 'beige', name: 'beige', hex: '#d2b48c' },
];

const STARTING_CIRCLE_COUNT = 4;
const MAX_CIRCLE_COUNT = 30;
const TIME_LIMIT_MS = 5000;
const CORRECT_PAUSE_MS = 700;

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

function randomDecoy(excludeKey) {
    const pool = COLORS.filter((color) => color.key !== excludeKey);
    return pool[Math.floor(Math.random() * pool.length)];
}

function buildCircles(target, count) {
    const circles = [target];
    for (let i = 1; i < count; i++) {
        circles.push(randomDecoy(target.key));
    }
    return shuffle(circles);
}

function initTapColorGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'tapColorEnBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let targetKey = null;
    let acceptingAnswer = false;
    let isGameOver = false;
    let timer = null;
    let timeLeft = 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'tapcolor-game';

    const stats = document.createElement('div');
    stats.className = 'tapcolor-game-stats';
    stats.innerHTML = `
        <div class="stat">Round: <span data-role="level">0</span></div>
        <div class="stat">Best: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'tapcolor-game-restart';
    restartButton.textContent = 'Play Again';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'tapcolor-game-board-wrap';

    const timerWrap = document.createElement('div');
    timerWrap.className = 'tapcolor-game-timer-wrap';
    const timerBar = document.createElement('div');
    timerBar.className = 'tapcolor-game-timer-bar';
    timerWrap.appendChild(timerBar);

    const statusText = document.createElement('div');
    statusText.className = 'tapcolor-game-status';
    statusText.textContent = 'Ready?';

    const board = document.createElement('div');
    board.className = 'tapcolor-board';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'tapcolor-start';
    startOverlay.innerHTML = `<button type="button" class="tapcolor-start-btn">▶ Start</button>`;

    boardWrap.append(timerWrap, statusText, board, startOverlay);

    const message = document.createElement('div');
    message.className = 'tapcolor-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="tapcolor-message-card">
            <div class="tapcolor-message-emoji">🎨</div>
            <div class="tapcolor-message-text" data-role="message-text"></div>
            <button type="button" class="tapcolor-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.tapcolor-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.tapcolor-message-ok');

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
                handleGameOver("Time's up!");
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

    function renderBoard(circles) {
        board.innerHTML = '';
        circles.forEach((color) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'tapcolor-dot';
            dot.style.backgroundColor = color.hex;
            dot.dataset.color = color.key;
            dot.setAttribute('aria-label', `${color.name} color`);
            dot.addEventListener('click', () => handleDotClick(color.key, dot));
            board.appendChild(dot);
        });
    }

    function startRound() {
        round += 1;
        acceptingAnswer = true;
        updateStats();

        const target = COLORS[Math.floor(Math.random() * COLORS.length)];
        targetKey = target.key;

        const circleCount = Math.min(STARTING_CIRCLE_COUNT + round - 1, MAX_CIRCLE_COUNT);
        renderBoard(buildCircles(target, circleCount));

        statusText.textContent = `Tap ${target.name}!`;
        startTimer();
    }

    function handleDotClick(colorKey, dot) {
        if (!acceptingAnswer || isGameOver) {
            return;
        }

        if (colorKey === targetKey) {
            acceptingAnswer = false;
            clearInterval(timer);
            sound.correct();
            dot.classList.add('correct');
            statusText.textContent = '🎉 Correct!';
            setTimeout(startRound, CORRECT_PAUSE_MS);
            return;
        }

        acceptingAnswer = false;
        clearInterval(timer);
        dot.classList.add('wrong');
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

        const targetColor = COLORS.find((color) => color.key === targetKey);
        const prefix = reason ? `${reason} ` : '';
        messageTextEl.textContent = `${prefix}The color was ${targetColor.name}. You cleared ${roundsCompleted} rounds!`;
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
        board.innerHTML = '';
        statusText.textContent = 'Ready?';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');

if (container) {
    initTapColorGame(container);
}
