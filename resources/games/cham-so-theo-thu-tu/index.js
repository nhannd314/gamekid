import './style.css';
import { endGame, playTone } from '../../js/app.js';

const STARTING_COUNT = 9;
const COUNT_STEP = 2;
const MAX_COUNT = 25;
const CORRECT_PAUSE_MS = 800;

function createSoundEffects() {
    return {
        correct() {
            playTone(660, 0, 0.08, 'sine', 0.25);
        },
        allDone() {
            playTone(880, 0, 0.15, 'sine', 0.35);
            playTone(1174.66, 0.12, 0.18, 'sine', 0.35);
        },
        wrong() {
            playTone(160, 0, 0.35, 'sawtooth', 0.3);
        },
    };
}

function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function initTapInOrderGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'tapInOrderBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let nextExpectedNumber = 1;
    let totalCount = 0;
    let acceptingAnswer = false;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'taporder-game';

    const stats = document.createElement('div');
    stats.className = 'taporder-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'taporder-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'taporder-game-board-wrap';

    const statusText = document.createElement('div');
    statusText.className = 'taporder-game-status';
    statusText.textContent = 'Sẵn sàng chưa?';

    const board = document.createElement('div');
    board.className = 'taporder-board';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'taporder-start';
    startOverlay.innerHTML = `<button type="button" class="taporder-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(statusText, board, startOverlay);

    const message = document.createElement('div');
    message.className = 'taporder-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="taporder-message-card">
            <div class="taporder-message-emoji">🔢</div>
            <div class="taporder-message-text" data-role="message-text"></div>
            <button type="button" class="taporder-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.taporder-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.taporder-message-ok');

    function updateStats() {
        levelEl.textContent = String(round);
        bestEl.textContent = String(bestScore);
    }

    function renderBoard(count) {
        const cols = Math.ceil(Math.sqrt(count));
        board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        board.innerHTML = '';

        const numbers = shuffle(Array.from({ length: count }, (_, i) => i + 1));

        numbers.forEach((number) => {
            const tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'taporder-tile';
            tile.textContent = String(number);
            tile.dataset.number = String(number);
            tile.setAttribute('aria-label', `Số ${number}`);
            tile.addEventListener('click', () => handleTileClick(number, tile));
            board.appendChild(tile);
        });
    }

    function startRound() {
        round += 1;
        acceptingAnswer = true;
        nextExpectedNumber = 1;
        updateStats();

        totalCount = Math.min(STARTING_COUNT + (round - 1) * COUNT_STEP, MAX_COUNT);
        renderBoard(totalCount);

        statusText.textContent = `Bấm số ${nextExpectedNumber}`;
    }

    function handleTileClick(number, tile) {
        if (!acceptingAnswer || isGameOver) {
            return;
        }

        if (number === nextExpectedNumber) {
            tile.classList.add('correct');
            tile.disabled = true;

            if (nextExpectedNumber === totalCount) {
                acceptingAnswer = false;
                sound.allDone();
                statusText.textContent = '🎉 Xong hết rồi!';
                setTimeout(startRound, CORRECT_PAUSE_MS);
                return;
            }

            sound.correct();
            nextExpectedNumber += 1;
            statusText.textContent = `Bấm số ${nextExpectedNumber}`;
            return;
        }

        acceptingAnswer = false;
        tile.classList.add('wrong');
        const correctTile = board.querySelector(`[data-number="${nextExpectedNumber}"]`);
        correctTile?.classList.add('reveal');
        sound.wrong();
        handleGameOver();
    }

    function handleGameOver() {
        isGameOver = true;
        acceptingAnswer = false;

        const roundsCompleted = round - 1;

        if (roundsCompleted > bestScore) {
            bestScore = roundsCompleted;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        endGame(roundsCompleted);
        updateStats();

        messageTextEl.textContent = `Số cần tìm là ${nextExpectedNumber}. Bạn đã qua ${roundsCompleted} vòng!`;
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
        statusText.textContent = 'Sẵn sàng chưa?';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');

if (container) {
    initTapInOrderGame(container);
}
