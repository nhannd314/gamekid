import './style.css';
import { endGame, playTone } from '../../js/app.js';

const GRID_SIZE = 3;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const TILE_FREQUENCIES = Array.from({ length: TILE_COUNT }, (_, index) => 220 + index * 55);
const BEST_SCORE_KEY = 'positionMemoryBestScore';
const SEQUENCE_STEP_MS = 650;
const SEQUENCE_LIT_MS = 400;

function createSoundEffects() {
    return {
        tile(index) {
            playTone(TILE_FREQUENCIES[index], 0, 0.3, 'triangle', 0.3);
        },
        wrong() {
            playTone(160, 0, 0.35, 'sawtooth', 0.3);
        },
    };
}

function randomTile() {
    return Math.floor(Math.random() * TILE_COUNT);
}

function initPositionMemoryGame(container) {
    const sound = createSoundEffects();
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let sequence = [];
    let playerStep = 0;
    let lockBoard = true;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'posmem-game';

    const stats = document.createElement('div');
    stats.className = 'posmem-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'posmem-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'posmem-game-board-wrap';

    const board = document.createElement('div');
    board.className = 'posmem-game-board';
    board.style.setProperty('--grid-size', String(GRID_SIZE));

    const tiles = Array.from({ length: TILE_COUNT }, (_, index) => {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'posmem-tile';
        tile.dataset.index = String(index);
        tile.setAttribute('aria-label', `Ô số ${index + 1}`);
        tile.addEventListener('click', () => handleTileClick(index, tile));
        board.appendChild(tile);
        return tile;
    });

    const startOverlay = document.createElement('div');
    startOverlay.className = 'posmem-game-start';
    startOverlay.innerHTML = `<button type="button" class="posmem-game-start-btn">▶ Bắt đầu</button>`;

    const countdownOverlay = document.createElement('div');
    countdownOverlay.className = 'posmem-game-countdown';
    countdownOverlay.hidden = true;
    countdownOverlay.innerHTML = `<span data-role="countdown-number"></span>`;

    boardWrap.append(board, startOverlay, countdownOverlay);

    const message = document.createElement('div');
    message.className = 'posmem-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="posmem-game-message-card">
            <div class="posmem-game-message-emoji">😅</div>
            <div class="posmem-game-message-text" data-role="message-text"></div>
            <button type="button" class="posmem-game-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.posmem-game-start-btn');
    const countdownNumberEl = countdownOverlay.querySelector('[data-role="countdown-number"]');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.posmem-game-message-ok');

    function updateStats() {
        levelEl.textContent = String(sequence.length);
        bestEl.textContent = String(bestScore);
    }

    function litTile(index, duration) {
        const tile = tiles[index];
        tile.classList.add('active', 'show-light');
        sound.tile(index);
        setTimeout(() => tile.classList.remove('active', 'show-light'), duration);
    }

    function playSequence() {
        lockBoard = true;

        sequence.forEach((tileIndex, index) => {
            setTimeout(() => litTile(tileIndex, SEQUENCE_LIT_MS), index * SEQUENCE_STEP_MS);
        });

        setTimeout(() => {
            lockBoard = false;
        }, sequence.length * SEQUENCE_STEP_MS);
    }

    function nextRound() {
        sequence.push(randomTile());
        playerStep = 0;
        updateStats();
        playSequence();
    }

    function handleTileClick(index, tile) {
        if (lockBoard || isGameOver) {
            return;
        }

        tile.classList.add('active');
        sound.tile(index);
        setTimeout(() => tile.classList.remove('active'), 200);

        if (index === sequence[playerStep]) {
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
    initPositionMemoryGame(container);
}
