import './style.css';
import { endGame, playTone } from '../../js/app.js';

const ITEMS = [
    { key: 'dog', emoji: '🐶' },
    { key: 'cat', emoji: '🐱' },
    { key: 'rabbit', emoji: '🐰' },
    { key: 'bear', emoji: '🐻' },
    { key: 'lion', emoji: '🦁' },
    { key: 'panda', emoji: '🐼' },
    { key: 'koala', emoji: '🐨' },
    { key: 'frog', emoji: '🐸' },
    { key: 'pig', emoji: '🐷' },
    { key: 'monkey', emoji: '🐵' },
    { key: 'chicken', emoji: '🐔' },
    { key: 'cow', emoji: '🐮' },
    { key: 'duck', emoji: '🦆' },
    { key: 'elephant', emoji: '🐘' },
    { key: 'giraffe', emoji: '🦒' },
    { key: 'penguin', emoji: '🐧' },
    { key: 'car', emoji: '🚗' },
    { key: 'ball', emoji: '⚽' },
];

const ANSWER_COUNT = 4;
const BASE_DURATION_MS = 5500;
const DURATION_STEP_MS = 200;
const MIN_DURATION_MS = 2800;
const CORRECT_PAUSE_MS = 1000;

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

function pickRoundItems() {
    const target = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const decoys = shuffle(ITEMS.filter((item) => item.key !== target.key)).slice(0, ANSWER_COUNT - 1);
    return { target, candidates: shuffle([target, ...decoys]) };
}

function roundDuration(round) {
    return Math.max(MIN_DURATION_MS, BASE_DURATION_MS - (round - 1) * DURATION_STEP_MS);
}

function initShadowGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'shadowMatchBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let targetKey = null;
    let acceptingAnswer = false;
    let isGameOver = false;
    let roundTimer = null;
    let timeLeft = 0;
    let timeTotal = 0;

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
    statusText.textContent = 'Đây là bóng của con/đồ vật nào?';

    const stage = document.createElement('div');
    stage.className = 'shadow-stage';
    stage.innerHTML = `
        <div class="shadow-spotlight"></div>
        <div class="shadow-silhouette" data-role="silhouette"></div>
    `;

    const lanes = document.createElement('div');
    lanes.className = 'shadow-lanes';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'shadow-start';
    startOverlay.innerHTML = `<button type="button" class="shadow-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(timerWrap, statusText, stage, lanes, startOverlay);

    const message = document.createElement('div');
    message.className = 'shadow-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="shadow-message-card">
            <div class="shadow-message-emoji">🔦</div>
            <div class="shadow-message-text" data-role="message-text"></div>
            <button type="button" class="shadow-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const silhouetteEl = stage.querySelector('[data-role="silhouette"]');
    const startButton = startOverlay.querySelector('.shadow-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.shadow-message-ok');

    function updateStats() {
        levelEl.textContent = String(round);
        bestEl.textContent = String(bestScore);
    }

    function startTimer(duration) {
        clearInterval(roundTimer);
        timeTotal = duration;
        timeLeft = duration;
        updateTimerBar();

        roundTimer = setInterval(() => {
            timeLeft -= 100;
            updateTimerBar();

            if (timeLeft <= 0) {
                clearInterval(roundTimer);
                handleGameOver('Hết giờ mất rồi!');
            }
        }, 100);
    }

    function updateTimerBar() {
        const percentage = Math.max(0, (timeLeft / timeTotal) * 100);
        timerBar.style.width = `${percentage}%`;

        timerBar.classList.remove('warning', 'danger');
        if (percentage < 30) {
            timerBar.classList.add('danger');
        } else if (percentage < 60) {
            timerBar.classList.add('warning');
        }
    }

    function renderLanes(candidates, duration) {
        lanes.innerHTML = '';
        candidates.forEach((item) => {
            const lane = document.createElement('div');
            lane.className = 'shadow-lane';

            const runner = document.createElement('button');
            runner.type = 'button';
            runner.className = 'shadow-runner';
            runner.dataset.item = item.key;
            runner.textContent = item.emoji;
            runner.style.animationDuration = `${duration}ms`;
            runner.setAttribute('aria-label', `Con/đồ vật ${item.key}`);
            runner.addEventListener('click', () => handleRunnerClick(item.key, runner));

            lane.appendChild(runner);
            lanes.appendChild(lane);
        });
    }

    function startRound() {
        round += 1;
        acceptingAnswer = true;
        updateStats();

        const { target, candidates } = pickRoundItems();
        targetKey = target.key;

        silhouetteEl.textContent = target.emoji;
        statusText.textContent = 'Đây là bóng của con/đồ vật nào?';

        const duration = roundDuration(round);
        renderLanes(candidates, duration);
        startTimer(duration);
    }

    function pauseRunners() {
        lanes.querySelectorAll('.shadow-runner').forEach((el) => {
            el.style.animationPlayState = 'paused';
        });
    }

    function handleRunnerClick(itemKey, runner) {
        if (!acceptingAnswer || isGameOver) {
            return;
        }

        acceptingAnswer = false;
        clearInterval(roundTimer);
        pauseRunners();

        if (itemKey === targetKey) {
            sound.correct();
            runner.classList.add('correct');
            statusText.textContent = '🎉 Chính xác!';
            setTimeout(startRound, CORRECT_PAUSE_MS);
            return;
        }

        runner.classList.add('wrong');
        sound.wrong();
        handleGameOver();
    }

    function handleGameOver(reason = '') {
        isGameOver = true;
        acceptingAnswer = false;
        clearInterval(roundTimer);
        pauseRunners();

        const roundsCompleted = round - 1;

        if (roundsCompleted > bestScore) {
            bestScore = roundsCompleted;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        endGame(roundsCompleted);
        updateStats();

        const targetItem = ITEMS.find((item) => item.key === targetKey);
        const prefix = reason ? `${reason} ` : '';
        messageTextEl.textContent = `${prefix}Đó là bóng của ${targetItem.emoji}. Bạn đã qua ${roundsCompleted} vòng!`;
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
        lanes.innerHTML = '';
        silhouetteEl.textContent = '';
        statusText.textContent = 'Đây là bóng của con/đồ vật nào?';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');

if (container) {
    initShadowGame(container);
}
