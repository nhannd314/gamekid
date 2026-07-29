import './style.css';
import { endGame, playTone } from '../../js/app.js';

const GRID_SIZE = 6;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const TILE_FREQUENCIES = Array.from({ length: TILE_COUNT }, (_, index) => 220 + index * 35);
const BEST_SCORE_KEY = 'mazePathBestScore';
const SEQUENCE_STEP_MS = 700;
const SEQUENCE_LIT_MS = 450;
const MOUSE_ICON = '🐭';

function createSoundEffects() {
    return {
        tile(index) {
            playTone(TILE_FREQUENCIES[index], 0, 0.3, 'triangle', 0.3);
        },
        wrong() {
            playTone(160, 0, 0.35, 'sawtooth', 0.3);
        },
        win() {
            playTone(660, 0, 0.15, 'sine', 0.25);
            playTone(880, 0.15, 0.25, 'sine', 0.25);
        },
    };
}

function rowOf(index) {
    return Math.floor(index / GRID_SIZE);
}

function colOf(index) {
    return index % GRID_SIZE;
}

function neighborsOf(index) {
    const row = rowOf(index);
    const col = colOf(index);

    return [
        row > 0 ? index - GRID_SIZE : null,
        row < GRID_SIZE - 1 ? index + GRID_SIZE : null,
        col > 0 ? index - 1 : null,
        col < GRID_SIZE - 1 ? index + 1 : null,
    ].filter((value) => value !== null);
}

/**
 * Extends the path with a step that is orthogonally adjacent to the last
 * tile, so the sequence always reads as a walkable maze route rather than
 * random jumps around the grid. Avoids doubling straight back on the
 * previous tile unless it's the only option (dead end).
 */
function nextPathStep(sequence) {
    if (sequence.length === 0) {
        return Math.floor(Math.random() * TILE_COUNT);
    }

    const last = sequence[sequence.length - 1];
    const previous = sequence.length >= 2 ? sequence[sequence.length - 2] : null;
    const neighbors = neighborsOf(last);
    const candidates = neighbors.filter((value) => value !== previous);
    const pool = candidates.length > 0 ? candidates : neighbors;

    return pool[Math.floor(Math.random() * pool.length)];
}

function initMazePathGame(container) {
    const sound = createSoundEffects();
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let sequence = [];
    let playerStep = 0;
    let lockBoard = true;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'mazepath-game';

    const stats = document.createElement('div');
    stats.className = 'mazepath-game-stats';
    stats.innerHTML = `
        <div class="stat">Chặng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'mazepath-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'mazepath-game-board-wrap';

    const board = document.createElement('div');
    board.className = 'mazepath-game-board';
    board.style.setProperty('--grid-size', String(GRID_SIZE));

    const tiles = Array.from({ length: TILE_COUNT }, (_, index) => {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'mazepath-tile';
        tile.dataset.index = String(index);
        tile.setAttribute('aria-label', `Ô số ${index + 1}`);
        tile.addEventListener('click', () => handleTileClick(index, tile));
        board.appendChild(tile);
        return tile;
    });

    const mouse = document.createElement('span');
    mouse.className = 'mazepath-mouse';
    mouse.textContent = MOUSE_ICON;
    mouse.hidden = true;

    const startOverlay = document.createElement('div');
    startOverlay.className = 'mazepath-game-start';
    startOverlay.innerHTML = `<button type="button" class="mazepath-game-start-btn">▶ Bắt đầu</button>`;

    const countdownOverlay = document.createElement('div');
    countdownOverlay.className = 'mazepath-game-countdown';
    countdownOverlay.hidden = true;
    countdownOverlay.innerHTML = `<span data-role="countdown-number"></span>`;

    boardWrap.append(board, startOverlay, countdownOverlay);

    const message = document.createElement('div');
    message.className = 'mazepath-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="mazepath-game-message-card">
            <div class="mazepath-game-message-emoji">😅</div>
            <div class="mazepath-game-message-text" data-role="message-text"></div>
            <button type="button" class="mazepath-game-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.mazepath-game-start-btn');
    const countdownNumberEl = countdownOverlay.querySelector('[data-role="countdown-number"]');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.mazepath-game-message-ok');

    function updateStats() {
        levelEl.textContent = String(sequence.length);
        bestEl.textContent = String(bestScore);
    }

    function clearTrail() {
        tiles.forEach((tile) => {
            tile.classList.remove('active', 'show-light', 'correct', 'wrong');
        });
    }

    function placeMouseOn(index) {
        mouse.hidden = false;
        tiles[index].appendChild(mouse);
    }

    function litTile(index, duration) {
        const tile = tiles[index];
        tile.classList.add('active', 'show-light');
        placeMouseOn(index);
        sound.tile(index);

        setTimeout(() => tile.classList.remove('active', 'show-light'), duration);
    }

    function playSequence() {
        lockBoard = true;
        clearTrail();
        mouse.hidden = true;

        sequence.forEach((tileIndex, index) => {
            setTimeout(() => litTile(tileIndex, SEQUENCE_LIT_MS), index * SEQUENCE_STEP_MS);
        });

        setTimeout(() => {
            mouse.hidden = true;
            lockBoard = false;
        }, sequence.length * SEQUENCE_STEP_MS);
    }

    function nextRound() {
        sequence.push(nextPathStep(sequence));
        playerStep = 0;
        updateStats();
        playSequence();
    }

    function handleTileClick(index, tile) {
        if (lockBoard || isGameOver) {
            return;
        }

        sound.tile(index);
        tile.classList.add('active', 'show-light');
        setTimeout(() => tile.classList.remove('active', 'show-light'), 250);

        if (index === sequence[playerStep]) {
            tile.classList.add('correct');
            setTimeout(() => tile.classList.remove('correct'), 250);
            playerStep += 1;

            if (playerStep === sequence.length) {
                lockBoard = true;
                sound.win();
                setTimeout(nextRound, 800);
            }

            return;
        }

        tile.classList.add('wrong');
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
        messageTextEl.textContent = `Chú chuột lạc đường sau ${roundsCompleted} chặng!`;
        message.hidden = false;
    }

    function beginGame() {
        sequence = [];
        playerStep = 0;
        isGameOver = false;
        clearTrail();
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
    initMazePathGame(container);
}
