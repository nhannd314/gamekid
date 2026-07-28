import './style.css';
import { endGame, playTone } from '../../js/app.js';

const ITEMS = [
    { key: 'ball', emoji: '⚽' },
    { key: 'balloon', emoji: '🎈' },
    { key: 'gift', emoji: '🎁' },
    { key: 'car', emoji: '🚗' },
    { key: 'paint', emoji: '🎨' },
    { key: 'teddy', emoji: '🧸' },
];

const ITEM_FREQUENCIES = {
    ball: 261.63,
    balloon: 329.63,
    gift: 392.00,
    car: 440.00,
    paint: 523.25,
    teddy: 587.33,
};

const BEST_SCORE_KEY = 'itemOrderBestScore';
const SEQUENCE_STEP_MS = 700;
const SEQUENCE_LIT_MS = 450;

function createSoundEffects() {
    return {
        item(itemKey) {
            playTone(ITEM_FREQUENCIES[itemKey], 0, 0.3, 'triangle', 0.3);
        },
        wrong() {
            playTone(160, 0, 0.35, 'sawtooth', 0.3);
        },
    };
}

function randomItem() {
    return ITEMS[Math.floor(Math.random() * ITEMS.length)];
}

function initItemOrderGame(container) {
    const sound = createSoundEffects();
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let sequence = [];
    let playerStep = 0;
    let lockBoard = true;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'itemseq-game';

    const stats = document.createElement('div');
    stats.className = 'itemseq-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'itemseq-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'itemseq-game-board-wrap';

    const board = document.createElement('div');
    board.className = 'itemseq-game-board';

    const pads = ITEMS.map((item) => {
        const pad = document.createElement('button');
        pad.type = 'button';
        pad.className = 'itemseq-pad';
        pad.dataset.item = item.key;
        pad.innerHTML = `<span class="itemseq-pad-emoji">${item.emoji}</span>`;
        pad.setAttribute('aria-label', `Đồ vật ${item.key}`);
        pad.addEventListener('click', () => handlePadClick(item.key, pad));
        board.appendChild(pad);
        return pad;
    });

    const startOverlay = document.createElement('div');
    startOverlay.className = 'itemseq-game-start';
    startOverlay.innerHTML = `<button type="button" class="itemseq-game-start-btn">▶ Bắt đầu</button>`;

    const countdownOverlay = document.createElement('div');
    countdownOverlay.className = 'itemseq-game-countdown';
    countdownOverlay.hidden = true;
    countdownOverlay.innerHTML = `<span data-role="countdown-number"></span>`;

    boardWrap.append(board, startOverlay, countdownOverlay);

    const message = document.createElement('div');
    message.className = 'itemseq-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="itemseq-game-message-card">
            <div class="itemseq-game-message-emoji">😅</div>
            <div class="itemseq-game-message-text" data-role="message-text"></div>
            <button type="button" class="itemseq-game-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.itemseq-game-start-btn');
    const countdownNumberEl = countdownOverlay.querySelector('[data-role="countdown-number"]');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.itemseq-game-message-ok');

    function updateStats() {
        levelEl.textContent = String(sequence.length);
        bestEl.textContent = String(bestScore);
    }

    function litPad(itemKey, duration) {
        const pad = pads.find((item) => item.dataset.item === itemKey);
        pad.classList.add('active', 'show-light');
        sound.item(itemKey);
        setTimeout(() => pad.classList.remove('active', 'show-light'), duration);
    }

    function playSequence() {
        lockBoard = true;

        sequence.forEach((itemKey, index) => {
            setTimeout(() => litPad(itemKey, SEQUENCE_LIT_MS), index * SEQUENCE_STEP_MS);
        });

        setTimeout(() => {
            lockBoard = false;
        }, sequence.length * SEQUENCE_STEP_MS);
    }

    function nextRound() {
        sequence.push(randomItem().key);
        playerStep = 0;
        updateStats();
        playSequence();
    }

    function handlePadClick(itemKey, pad) {
        if (lockBoard || isGameOver) {
            return;
        }

        pad.classList.add('active');
        sound.item(itemKey);
        setTimeout(() => pad.classList.remove('active'), 200);

        if (itemKey === sequence[playerStep]) {
            playerStep += 1;

            if (playerStep === sequence.length) {
                setTimeout(nextRound, 800);
            }

            return;
        }

        handleGameOver();
    }

    function handleGameOver() {
        isGameOver = true;
        lockBoard = true;
        sound.wrong();

        const roundsCompleted = sequence.length - 1;

        if (roundsCompleted > bestScore) {
            bestScore = roundsCompleted;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        endGame(roundsCompleted);

        updateStats();
        messageTextEl.textContent = `Bạn đã nhớ đúng ${roundsCompleted} vòng!`;
        message.hidden = false;
    }

    function beginGame() {
        sequence = [];
        playerStep = 0;
        isGameOver = false;
        updateStats();
        nextRound();
    }

    function runCountdown(onFinished) {
        const steps = ['3', '2', '1'];
        let index = 0;

        lockBoard = true;
        startButton.disabled = true;
        restartButton.disabled = true;
        startOverlay.hidden = true;
        message.hidden = true;
        countdownOverlay.hidden = false;
        countdownNumberEl.textContent = steps[index];

        const timer = setInterval(() => {
            index += 1;

            if (index >= steps.length) {
                clearInterval(timer);
                countdownOverlay.hidden = true;
                startButton.disabled = false;
                restartButton.disabled = false;
                onFinished();
                return;
            }

            countdownNumberEl.textContent = steps[index];
        }, 1000);
    }

    function startGame() {
        runCountdown(beginGame);
    }

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    messageOkButton.addEventListener('click', () => {
        message.hidden = true;
        startOverlay.hidden = false;
    });

    updateStats();
}

const container = document.getElementById('game-container');

if (container) {
    initItemOrderGame(container);
}
