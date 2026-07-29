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
];

const STARTING_ITEM_COUNT = 1;
const ANSWER_OPTIONS_COUNT = 4;
// Luôn chừa lại đủ con vật bên ngoài bàn để làm đáp án mồi, tránh trùng lặp.
const MAX_BOARD_ITEM_COUNT = ITEMS.length - (ANSWER_OPTIONS_COUNT - 1);
const MEMORIZE_BASE_MS = 2000;
const MEMORIZE_PER_ITEM_MS = 500;
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

function pickRoundItems(count) {
    return shuffle(ITEMS).slice(0, count);
}

/**
 * Builds ANSWER_OPTIONS_COUNT answer options: the missing item plus decoys
 * drawn only from animals not shown on the board this round, so no animal
 * appears twice on screen. MAX_BOARD_ITEM_COUNT guarantees enough are left.
 */
function buildAnswerOptions(missingItem, roundItems) {
    const decoysNeeded = ANSWER_OPTIONS_COUNT - 1;
    const roundKeys = new Set(roundItems.map((item) => item.key));
    const decoys = shuffle(ITEMS.filter((item) => !roundKeys.has(item.key))).slice(0, decoysNeeded);

    return shuffle([missingItem, ...decoys]);
}

function initVanishGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'whoVanishedBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let roundItems = [];
    let missingItem = null;
    let acceptingAnswer = false;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'vanish-game';

    const stats = document.createElement('div');
    stats.className = 'vanish-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'vanish-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'vanish-game-board-wrap';

    const statusText = document.createElement('div');
    statusText.className = 'vanish-game-status';
    statusText.textContent = 'Hãy ghi nhớ những con vật này!';

    const board = document.createElement('div');
    board.className = 'vanish-game-board';

    const answerRow = document.createElement('div');
    answerRow.className = 'vanish-game-answers is-hidden';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'vanish-game-start';
    startOverlay.innerHTML = `<button type="button" class="vanish-game-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(statusText, board, answerRow, startOverlay);

    const message = document.createElement('div');
    message.className = 'vanish-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="vanish-game-message-card">
            <div class="vanish-game-message-emoji">😅</div>
            <div class="vanish-game-message-text" data-role="message-text"></div>
            <button type="button" class="vanish-game-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.vanish-game-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.vanish-game-message-ok');

    function updateStats() {
        levelEl.textContent = String(round);
        bestEl.textContent = String(bestScore);
    }

    function renderBoard(items, missingKey = null) {
        board.innerHTML = '';
        items.forEach((item) => {
            const tile = document.createElement('div');
            tile.dataset.item = item.key;

            if (item.key === missingKey) {
                tile.className = 'vanish-tile vanish-tile-missing';
                tile.textContent = '?';
            } else {
                tile.className = 'vanish-tile';
                tile.textContent = item.emoji;
            }

            board.appendChild(tile);
        });
    }

    function renderAnswers(items) {
        answerRow.innerHTML = '';
        items.forEach((item) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'vanish-answer';
            button.dataset.item = item.key;
            button.textContent = item.emoji;
            button.setAttribute('aria-label', `Con vật ${item.key}`);
            button.addEventListener('click', () => handleAnswerClick(item.key, button));
            answerRow.appendChild(button);
        });
    }

    function startRound() {
        round += 1;
        acceptingAnswer = false;
        answerRow.classList.add('is-hidden');
        updateStats();

        const itemCount = Math.min(STARTING_ITEM_COUNT + round - 1, MAX_BOARD_ITEM_COUNT);
        roundItems = pickRoundItems(itemCount);
        missingItem = roundItems[Math.floor(Math.random() * roundItems.length)];

        statusText.textContent = 'Hãy ghi nhớ những con vật này!';
        renderBoard(roundItems);

        const memorizeDuration = MEMORIZE_BASE_MS + (itemCount - 1) * MEMORIZE_PER_ITEM_MS;

        setTimeout(hideAndAsk, memorizeDuration);
    }

    function hideAndAsk() {
        renderBoard(roundItems, missingItem.key);
        renderAnswers(buildAnswerOptions(missingItem, roundItems));
        statusText.textContent = 'Con nào đã biến mất?';
        answerRow.classList.remove('is-hidden');
        acceptingAnswer = true;
    }

    function handleAnswerClick(itemKey, button) {
        if (!acceptingAnswer || isGameOver) {
            return;
        }

        acceptingAnswer = false;

        if (itemKey === missingItem.key) {
            sound.correct();
            button.classList.add('correct');
            statusText.textContent = '🎉 Chính xác!';
            answerRow.classList.add('is-hidden');
            setTimeout(startRound, CORRECT_PAUSE_MS);
            return;
        }

        button.classList.add('wrong');
        handleGameOver();
    }

    function handleGameOver() {
        isGameOver = true;
        acceptingAnswer = false;
        sound.wrong();

        const roundsCompleted = round - 1;

        if (roundsCompleted > bestScore) {
            bestScore = roundsCompleted;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        endGame(roundsCompleted);

        updateStats();
        messageTextEl.textContent = `Con vật đã biến mất là ${missingItem.emoji}. Bạn đã qua ${roundsCompleted} vòng!`;
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
        answerRow.classList.add('is-hidden');
        statusText.textContent = 'Hãy ghi nhớ những con vật này!';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');

if (container) {
    initVanishGame(container);
}
