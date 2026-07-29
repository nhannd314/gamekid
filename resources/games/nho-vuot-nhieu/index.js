import './style.css';
import { endGame, playTone } from '../../js/app.js';

const ITEMS = [
    { key: 'ball', emoji: '⚽' },
    { key: 'balloon', emoji: '🎈' },
    { key: 'gift', emoji: '🎁' },
    { key: 'paint', emoji: '🎨' },
    { key: 'teddy', emoji: '🧸' },
    { key: 'car', emoji: '🚗' },
    { key: 'plane', emoji: '✈️' },
    { key: 'guitar', emoji: '🎸' },
    { key: 'drum', emoji: '🥁' },
    { key: 'controller', emoji: '🎮' },
    { key: 'camera', emoji: '📷' },
    { key: 'glasses', emoji: '🕶️' },
    { key: 'watch', emoji: '⌚' },
    { key: 'kite', emoji: '🪁' },
    { key: 'robot', emoji: '🤖' },
    { key: 'rocket', emoji: '🚀' },
];

const MAX_LIST_SIZE = 6;
const ANSWER_GRID_SIZE = 12;
const MEMORIZE_BASE_MS = 2000;
const MEMORIZE_PER_ITEM_MS = 600;
const DISTRACTION_TAPS = 3;
const CORRECT_PAUSE_MS = 1000;

function createSoundEffects() {
    return {
        correct() {
            playTone(880, 0, 0.15, 'sine', 0.35);
            playTone(1174.66, 0.12, 0.18, 'sine', 0.35);
        },
        tap() {
            playTone(600, 0, 0.1, 'square', 0.25);
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

function pickListItems(count) {
    return shuffle(ITEMS).slice(0, count);
}

/**
 * Builds ANSWER_GRID_SIZE answer options: every item to remember plus
 * decoys drawn only from items not on the list, so no item appears twice.
 */
function buildAnswerOptions(listItems) {
    const decoysNeeded = ANSWER_GRID_SIZE - listItems.length;
    const listKeys = new Set(listItems.map((item) => item.key));
    const decoys = shuffle(ITEMS.filter((item) => !listKeys.has(item.key))).slice(0, decoysNeeded);

    return shuffle([...listItems, ...decoys]);
}

function initNoisyMemoryGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'noisyMemoryBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let listItems = [];
    let selectedKeys = new Set();
    let tapsRemaining = 0;
    let acceptingAnswer = false;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'noisy-game';

    const stats = document.createElement('div');
    stats.className = 'noisy-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'noisy-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'noisy-game-board-wrap';

    const statusText = document.createElement('div');
    statusText.className = 'noisy-game-status';
    statusText.textContent = 'Hãy ghi nhớ những món đồ này!';

    const listGrid = document.createElement('div');
    listGrid.className = 'noisy-grid';

    const distractionStage = document.createElement('div');
    distractionStage.className = 'noisy-distraction';
    distractionStage.hidden = true;

    const answerGrid = document.createElement('div');
    answerGrid.className = 'noisy-grid noisy-answer-grid';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'noisy-start';
    startOverlay.innerHTML = `<button type="button" class="noisy-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(statusText, listGrid, distractionStage, answerGrid, startOverlay);

    const message = document.createElement('div');
    message.className = 'noisy-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="noisy-message-card">
            <div class="noisy-message-emoji">🌀</div>
            <div class="noisy-message-text" data-role="message-text"></div>
            <button type="button" class="noisy-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.noisy-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.noisy-message-ok');

    function updateStats() {
        levelEl.textContent = String(round);
        bestEl.textContent = String(bestScore);
    }

    function askStatusText() {
        const remaining = listItems.length - selectedKeys.size;
        return listItems.length > 1
            ? `Chọn lại các món đã xuất hiện (còn ${remaining})`
            : 'Món nào đã xuất hiện?';
    }

    function renderListPhase(items) {
        listGrid.innerHTML = '';
        listGrid.hidden = false;
        distractionStage.hidden = true;
        answerGrid.innerHTML = '';
        answerGrid.hidden = true;

        items.forEach((item) => {
            const tile = document.createElement('div');
            tile.className = 'noisy-tile';
            tile.dataset.item = item.key;
            tile.textContent = item.emoji;
            listGrid.appendChild(tile);
        });
    }

    function moveDistractionTarget() {
        const target = distractionStage.querySelector('.noisy-distraction-target');
        const left = 8 + Math.random() * 76;
        const top = 8 + Math.random() * 68;
        target.style.left = `${left}%`;
        target.style.top = `${top}%`;
    }

    function handleDistractionTap() {
        if (tapsRemaining <= 0) {
            return;
        }

        sound.tap();
        tapsRemaining -= 1;
        distractionStage.querySelector('[data-role="taps-left"]').textContent = String(tapsRemaining);

        if (tapsRemaining === 0) {
            showAnswerGrid();
            return;
        }

        moveDistractionTarget();
    }

    function startDistraction() {
        listGrid.hidden = true;
        distractionStage.hidden = false;
        tapsRemaining = DISTRACTION_TAPS;
        distractionStage.innerHTML = `
            <div class="noisy-distraction-label">Nhanh tay! Bấm vào nút đang chạy <span data-role="taps-left">${DISTRACTION_TAPS}</span> lần</div>
            <button type="button" class="noisy-distraction-target">👆</button>
        `;
        distractionStage.querySelector('.noisy-distraction-target').addEventListener('click', handleDistractionTap);

        statusText.textContent = '🌀 Xao nhãng một chút nào!';
        moveDistractionTarget();
    }

    function renderAnswerPhase(items) {
        answerGrid.innerHTML = '';
        answerGrid.hidden = false;
        items.forEach((item) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'noisy-tile noisy-answer';
            button.dataset.item = item.key;
            button.textContent = item.emoji;
            button.setAttribute('aria-label', `Món ${item.key}`);
            button.addEventListener('click', () => handleAnswerClick(item.key, button));
            answerGrid.appendChild(button);
        });
    }

    function startRound() {
        round += 1;
        acceptingAnswer = false;
        updateStats();

        const listSize = Math.min(round, MAX_LIST_SIZE);
        listItems = pickListItems(listSize);
        selectedKeys = new Set();

        statusText.textContent = 'Hãy ghi nhớ những món đồ này!';
        renderListPhase(listItems);

        const memorizeDuration = MEMORIZE_BASE_MS + (listSize - 1) * MEMORIZE_PER_ITEM_MS;

        setTimeout(startDistraction, memorizeDuration);
    }

    function showAnswerGrid() {
        distractionStage.hidden = true;
        renderAnswerPhase(buildAnswerOptions(listItems));
        statusText.textContent = askStatusText();
        acceptingAnswer = true;
    }

    function handleAnswerClick(itemKey, button) {
        if (!acceptingAnswer || isGameOver) {
            return;
        }

        const isOnList = listItems.some((item) => item.key === itemKey);

        if (!isOnList) {
            acceptingAnswer = false;
            button.classList.add('wrong');
            handleGameOver();
            return;
        }

        sound.correct();
        button.classList.add('correct');
        button.disabled = true;
        selectedKeys.add(itemKey);

        if (selectedKeys.size === listItems.length) {
            acceptingAnswer = false;
            statusText.textContent = '🎉 Chính xác!';
            setTimeout(startRound, CORRECT_PAUSE_MS);
            return;
        }

        statusText.textContent = askStatusText();
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

        const listEmojis = listItems.map((item) => item.emoji).join(' ');
        messageTextEl.textContent = `Danh sách là ${listEmojis}. Bạn đã qua ${roundsCompleted} vòng!`;
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
        listGrid.innerHTML = '';
        answerGrid.innerHTML = '';
        distractionStage.hidden = true;
        statusText.textContent = 'Hãy ghi nhớ những món đồ này!';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');

if (container) {
    initNoisyMemoryGame(container);
}
