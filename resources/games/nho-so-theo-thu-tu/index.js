import './style.css';
import { endGame, playTone } from '../../js/app.js';

const STARTING_COUNT = 2; // Màn 1: 0 và 1
const MAX_COUNT = 15;
const TILE_SIZE = 60;
const TILE_PADDING = 20;
const MEMORIZE_BASE_MS = 1500;
const MEMORIZE_PER_TILE_MS = 500;
const CORRECT_PAUSE_MS = 800;

function createSoundEffects() {
    return {
        correct() {
            playTone(880, 0, 0.1, 'sine', 0.2);
            playTone(1174.66, 0.08, 0.15, 'sine', 0.2);
        },
        wrong() {
            playTone(160, 0, 0.3, 'sawtooth', 0.3);
        },
        click() {
            playTone(660, 0, 0.05, 'sine', 0.1);
        },
    };
}

function initNumberOrderGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'numberOrderBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let tiles = [];
    let nextExpectedNumber = 0;
    let acceptingInput = false;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'number-order-game';

    const stats = document.createElement('div');
    stats.className = 'number-order-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'number-order-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'number-order-board-wrap';

    const statusText = document.createElement('div');
    statusText.className = 'number-order-status';
    statusText.textContent = 'Hãy ghi nhớ vị trí các số!';

    const board = document.createElement('div');
    board.className = 'number-order-board';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'number-order-start';
    startOverlay.innerHTML = `<button type="button" class="number-order-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(statusText, board, startOverlay);

    const message = document.createElement('div');
    message.className = 'number-order-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="number-order-message-card">
            <div class="number-order-message-emoji">😅</div>
            <div class="number-order-message-text" data-role="message-text"></div>
            <button type="button" class="number-order-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.number-order-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.number-order-message-ok');

    function updateStats() {
        levelEl.textContent = String(round);
        bestEl.textContent = String(bestScore);
    }

    function getRandomPositions(count, width, height) {
        const positions = [];
        const maxAttempts = 500;
        let attempts = 0;

        const safeWidth = width - TILE_SIZE - TILE_PADDING * 2;
        const safeHeight = height - TILE_SIZE - TILE_PADDING * 2;

        while (positions.length < count && attempts < maxAttempts) {
            const x = Math.floor(Math.random() * safeWidth) + TILE_SIZE / 2 + TILE_PADDING;
            const y = Math.floor(Math.random() * safeHeight) + TILE_SIZE / 2 + TILE_PADDING;

            const isOverlapping = positions.some((pos) => {
                const dx = pos.x - x;
                const dy = pos.y - y;
                return Math.sqrt(dx * dx + dy * dy) < TILE_SIZE + TILE_PADDING;
            });

            if (!isOverlapping) {
                positions.push({ x, y });
            }
            attempts++;
        }

        return positions;
    }

    function renderBoard(count) {
        board.innerHTML = '';
        tiles = [];
        nextExpectedNumber = 0;

        const rect = board.getBoundingClientRect();
        const positions = getRandomPositions(count, rect.width || 800, rect.height || 400);

        for (let i = 0; i < positions.length; i++) {
            const tile = document.createElement('div');
            tile.className = 'number-tile';
            tile.textContent = String(i);
            tile.style.left = `${positions[i].x}px`;
            tile.style.top = `${positions[i].y}px`;
            tile.dataset.number = String(i);

            tile.addEventListener('click', () => handleTileClick(i, tile));
            board.appendChild(tile);
            tiles.push({ number: i, element: tile });
        }
    }

    function startRound() {
        round += 1;
        acceptingInput = false;
        updateStats();

        const count = Math.min(STARTING_COUNT + round - 1, MAX_COUNT);
        renderBoard(count);

        statusText.textContent = 'Hãy ghi nhớ vị trí các số!';

        const memorizeDuration = MEMORIZE_BASE_MS + (count - 2) * MEMORIZE_PER_TILE_MS;

        setTimeout(() => {
            if (isGameOver) {
                return;
            }
            tiles.forEach((t) => t.element.classList.add('hidden-number'));
            statusText.textContent = `Hãy bấm theo thứ tự từ 0 đến ${count - 1}`;
            acceptingInput = true;
        }, memorizeDuration);
    }

    function handleTileClick(number, element) {
        if (!acceptingInput || isGameOver || element.classList.contains('correct')) {
            return;
        }

        if (number === nextExpectedNumber) {
            sound.click();
            element.classList.remove('hidden-number');
            element.classList.add('correct');
            nextExpectedNumber++;

            if (nextExpectedNumber === tiles.length) {
                acceptingInput = false;
                sound.correct();
                statusText.textContent = '🎉 Tuyệt vời!';
                setTimeout(startRound, CORRECT_PAUSE_MS);
            }
        } else {
            element.classList.add('wrong');
            handleGameOver();
        }
    }

    function handleGameOver() {
        isGameOver = true;
        acceptingInput = false;
        sound.wrong();

        // Hiện tất cả các số để người chơi thấy lỗi
        tiles.forEach((t) => {
            t.element.classList.remove('hidden-number');
        });

        const roundsCompleted = round - 1;
        if (roundsCompleted > bestScore) {
            bestScore = roundsCompleted;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        endGame(roundsCompleted);
        updateStats();

        messageTextEl.textContent = `Bạn đã bấm sai thứ tự! Bạn đã vượt qua ${roundsCompleted} vòng.`;
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
        statusText.textContent = 'Hãy ghi nhớ vị trí các số!';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');
if (container) {
    initNumberOrderGame(container);
}
