import './style.css';
import { endGame, playTone } from '../../js/app.js';

const COLORS = ['green', 'red', 'yellow', 'blue'];

const COLOR_FREQUENCIES = {
    green: 392.00,
    red: 329.63,
    yellow: 261.63,
    blue: 220.00,
};

const BEST_SCORE_KEY = 'simonBestScore';
const SEQUENCE_STEP_MS = 650;
const SEQUENCE_LIT_MS = 400;

function createSoundEffects() {
    return {
        color(colorName) {
            playTone(COLOR_FREQUENCIES[colorName], 0, 0.3, 'triangle', 0.3);
        },
        wrong() {
            playTone(160, 0, 0.35, 'sawtooth', 0.3);
        },
    };
}

function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function initSimonGame(container) {
    const sound = createSoundEffects();
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let sequence = [];
    let playerStep = 0;
    let lockBoard = true;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'simon-game';

    const stats = document.createElement('div');
    stats.className = 'simon-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'simon-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'simon-game-board-wrap';

    const board = document.createElement('div');
    board.className = 'simon-game-board';

    const pads = COLORS.map((colorName) => {
        const pad = document.createElement('button');
        pad.type = 'button';
        pad.className = `simon-pad simon-pad-${colorName}`;
        pad.dataset.color = colorName;
        pad.setAttribute('aria-label', `Ô màu ${colorName}`);
        pad.addEventListener('click', () => handlePadClick(colorName, pad));
        board.appendChild(pad);
        return pad;
    });

    const startOverlay = document.createElement('div');
    startOverlay.className = 'simon-game-start';
    startOverlay.innerHTML = `<button type="button" class="simon-game-start-btn">▶ Bắt đầu</button>`;

    const countdownOverlay = document.createElement('div');
    countdownOverlay.className = 'simon-game-countdown';
    countdownOverlay.hidden = true;
    countdownOverlay.innerHTML = `<span data-role="countdown-number"></span>`;

    boardWrap.append(board, startOverlay, countdownOverlay);

    const message = document.createElement('div');
    message.className = 'simon-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="simon-game-message-card">
            <div class="simon-game-message-emoji">😅</div>
            <div class="simon-game-message-text" data-role="message-text"></div>
            <button type="button" class="simon-game-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.simon-game-start-btn');
    const countdownNumberEl = countdownOverlay.querySelector('[data-role="countdown-number"]');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.simon-game-message-ok');

    function updateStats() {
        levelEl.textContent = String(sequence.length);
        bestEl.textContent = String(bestScore);
    }

    function litPad(colorName, duration) {
        const pad = pads.find((item) => item.dataset.color === colorName);
        pad.classList.add('active', 'show-light');
        sound.color(colorName);
        setTimeout(() => pad.classList.remove('active', 'show-light'), duration);
    }

    function playSequence() {
        lockBoard = true;

        sequence.forEach((colorName, index) => {
            setTimeout(() => litPad(colorName, SEQUENCE_LIT_MS), index * SEQUENCE_STEP_MS);
        });

        setTimeout(() => {
            lockBoard = false;
        }, sequence.length * SEQUENCE_STEP_MS);
    }

    function nextRound() {
        sequence.push(randomColor());
        playerStep = 0;
        updateStats();
        playSequence();
    }

    function handlePadClick(colorName, pad) {
        if (lockBoard || isGameOver) {
            return;
        }

        pad.classList.add('active');
        sound.color(colorName);
        setTimeout(() => pad.classList.remove('active'), 200);

        if (colorName === sequence[playerStep]) {
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
    initSimonGame(container);
}
