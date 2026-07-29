import './style.css';
import { endGame, playTone } from '../../js/app.js';

const ITEMS = [
    { key: 'apple', emoji: '🍎' },
    { key: 'banana', emoji: '🍌' },
    { key: 'grape', emoji: '🍇' },
    { key: 'watermelon', emoji: '🍉' },
    { key: 'orange', emoji: '🍊' },
    { key: 'strawberry', emoji: '🍓' },
    { key: 'pineapple', emoji: '🍍' },
    { key: 'carrot', emoji: '🥕' },
    { key: 'broccoli', emoji: '🥦' },
    { key: 'corn', emoji: '🌽' },
    { key: 'tomato', emoji: '🍅' },
    { key: 'potato', emoji: '🥔' },
    { key: 'onion', emoji: '🧅' },
    { key: 'bread', emoji: '🍞' },
    { key: 'milk', emoji: '🥛' },
    { key: 'cheese', emoji: '🧀' },
    { key: 'egg', emoji: '🥚' },
    { key: 'cookie', emoji: '🍪' },
    { key: 'chocolate', emoji: '🍫' },
    { key: 'fish', emoji: '🐟' },
];

const MAX_LIST_SIZE = 6;
const ANSWER_GRID_SIZE = 12;
const MEMORIZE_BASE_MS = 2000;
const MEMORIZE_PER_ITEM_MS = 600;
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

function pickListItems(count) {
    return shuffle(ITEMS).slice(0, count);
}

/**
 * Builds ANSWER_GRID_SIZE answer options: every shopping-list item plus
 * decoys drawn only from items not on the list, so no item appears twice.
 */
function buildAnswerOptions(listItems) {
    const decoysNeeded = ANSWER_GRID_SIZE - listItems.length;
    const listKeys = new Set(listItems.map((item) => item.key));
    const decoys = shuffle(ITEMS.filter((item) => !listKeys.has(item.key))).slice(0, decoysNeeded);

    return shuffle([...listItems, ...decoys]);
}

function initShoppingListGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'shoppingListBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let listItems = [];
    let selectedKeys = new Set();
    let acceptingAnswer = false;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'shoplist-game';

    const stats = document.createElement('div');
    stats.className = 'shoplist-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'shoplist-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'shoplist-game-board-wrap';

    const statusText = document.createElement('div');
    statusText.className = 'shoplist-game-status';
    statusText.textContent = 'Hãy ghi nhớ danh sách mua sắm!';

    const listGrid = document.createElement('div');
    listGrid.className = 'shoplist-grid';

    const answerGrid = document.createElement('div');
    answerGrid.className = 'shoplist-grid shoplist-answer-grid';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'shoplist-start';
    startOverlay.innerHTML = `<button type="button" class="shoplist-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(statusText, listGrid, answerGrid, startOverlay);

    const message = document.createElement('div');
    message.className = 'shoplist-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="shoplist-message-card">
            <div class="shoplist-message-emoji">🛒</div>
            <div class="shoplist-message-text" data-role="message-text"></div>
            <button type="button" class="shoplist-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.shoplist-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.shoplist-message-ok');

    function updateStats() {
        levelEl.textContent = String(round);
        bestEl.textContent = String(bestScore);
    }

    function askStatusText() {
        const remaining = listItems.length - selectedKeys.size;
        return listItems.length > 1
            ? `Chọn lại các món đã có trong danh sách (còn ${remaining})`
            : 'Món nào có trong danh sách?';
    }

    function renderListPhase(items) {
        listGrid.innerHTML = '';
        answerGrid.innerHTML = '';
        items.forEach((item) => {
            const tile = document.createElement('div');
            tile.className = 'shoplist-tile';
            tile.dataset.item = item.key;
            tile.textContent = item.emoji;
            listGrid.appendChild(tile);
        });
    }

    function hideListItems() {
        listGrid.querySelectorAll('.shoplist-tile').forEach((tile) => {
            tile.classList.add('is-hidden');
            tile.textContent = '❓';
        });
    }

    function revealListTile(itemKey) {
        const tile = listGrid.querySelector(`.shoplist-tile[data-item="${itemKey}"]`);
        if (!tile) {
            return;
        }
        const item = listItems.find((listItem) => listItem.key === itemKey);
        tile.classList.remove('is-hidden');
        tile.classList.add('correct');
        tile.textContent = item.emoji;
    }

    function renderAnswerPhase(items) {
        answerGrid.innerHTML = '';
        items.forEach((item) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'shoplist-tile shoplist-answer';
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

        statusText.textContent = 'Hãy ghi nhớ danh sách mua sắm!';
        renderListPhase(listItems);

        const memorizeDuration = MEMORIZE_BASE_MS + (listSize - 1) * MEMORIZE_PER_ITEM_MS;

        setTimeout(showAnswerGrid, memorizeDuration);
    }

    function showAnswerGrid() {
        hideListItems();
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
        revealListTile(itemKey);

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
        messageTextEl.textContent = `Danh sách mua sắm là ${listEmojis}. Bạn đã qua ${roundsCompleted} vòng!`;
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
        statusText.textContent = 'Hãy ghi nhớ danh sách mua sắm!';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');

if (container) {
    initShoppingListGame(container);
}
