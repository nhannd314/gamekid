import './style.css';
import { endGame, playTone } from '../../js/app.js';

const LEVEL_TIERS = [
    {
        name: 'Dễ',
        items: [
            { key: 'apple', en: 'Apple', emoji: '🍎' },
            { key: 'banana', en: 'Banana', emoji: '🍌' },
            { key: 'watermelon', en: 'Watermelon', emoji: '🍉' },
            { key: 'grapes', en: 'Grapes', emoji: '🍇' },
            { key: 'strawberry', en: 'Strawberry', emoji: '🍓' },
            { key: 'mango', en: 'Mango', emoji: '🥭' },
            { key: 'pineapple', en: 'Pineapple', emoji: '🍍' },
        ],
    },
    {
        name: 'Trung bình',
        items: [
            { key: 'lemon', en: 'Lemon', emoji: '🍋' },
            { key: 'peach', en: 'Peach', emoji: '🍑' },
            { key: 'cherries', en: 'Cherries', emoji: '🍒' },
            { key: 'tomato', en: 'Tomato', emoji: '🍅' },
            { key: 'coconut', en: 'Coconut', emoji: '🥥' },
            { key: 'avocado', en: 'Avocado', emoji: '🥑' },
        ],
    },
    {
        name: 'Khó',
        items: [
            { key: 'mushroom', en: 'Mushroom', emoji: '🍄' },
            { key: 'carrot', en: 'Carrot', emoji: '🥕' },
            { key: 'pepper', en: 'Pepper', emoji: '🫑' },
            { key: 'broccoli', en: 'Broccoli', emoji: '🥦' },
            { key: 'garlic', en: 'Garlic', emoji: '🧄' },
            { key: 'onion', en: 'Onion', emoji: '🧅' },
            { key: 'beans', en: 'Beans', emoji: '🫘' },
        ],
    },
];

const ROUNDS_PER_LEVEL = 6;
const STARTING_COUNT = 4;
const MAX_COUNT = 12;
const TIME_LIMIT_MS = 6000;
const CORRECT_PAUSE_MS = 800;

function getLevelTierForRound(round) {
    const tierIndex = Math.min(Math.floor((round - 1) / ROUNDS_PER_LEVEL), LEVEL_TIERS.length - 1);
    return LEVEL_TIERS[tierIndex];
}

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

function randomDecoys(pool, excludeKey, count) {
    const candidates = pool.filter((item) => item.key !== excludeKey);
    return shuffle(candidates).slice(0, count);
}

function buildCards(pool, target, count) {
    const decoys = randomDecoys(pool, target.key, count - 1);
    return shuffle([target, ...decoys]);
}

function initFruitPickGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'fruitPickBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let targetKey = null;
    let acceptingAnswer = false;
    let isGameOver = false;
    let timer = null;
    let timeLeft = 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'fruitpick-game';

    const stats = document.createElement('div');
    stats.className = 'fruitpick-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Cấp độ: <span data-role="tier">–</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'fruitpick-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'fruitpick-game-board-wrap';

    const timerWrap = document.createElement('div');
    timerWrap.className = 'fruitpick-game-timer-wrap';
    const timerBar = document.createElement('div');
    timerBar.className = 'fruitpick-game-timer-bar';
    timerWrap.appendChild(timerBar);

    const statusText = document.createElement('div');
    statusText.className = 'fruitpick-game-status';
    statusText.textContent = 'Chạm đúng hình loại quả nhé!';

    const wordCard = document.createElement('div');
    wordCard.className = 'fruitpick-word-card';
    wordCard.innerHTML = `<span class="fruitpick-word" data-role="word"></span>`;

    const board = document.createElement('div');
    board.className = 'fruitpick-board';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'fruitpick-start';
    startOverlay.innerHTML = `<button type="button" class="fruitpick-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(timerWrap, statusText, wordCard, board, startOverlay);

    const message = document.createElement('div');
    message.className = 'fruitpick-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="fruitpick-message-card">
            <div class="fruitpick-message-emoji">🍇</div>
            <div class="fruitpick-message-text" data-role="message-text"></div>
            <button type="button" class="fruitpick-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const tierEl = stats.querySelector('[data-role="tier"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const wordEl = wordCard.querySelector('[data-role="word"]');
    const startButton = startOverlay.querySelector('.fruitpick-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.fruitpick-message-ok');

    function updateStats() {
        levelEl.textContent = String(round);
        bestEl.textContent = String(bestScore);
        tierEl.textContent = round > 0 ? getLevelTierForRound(round).name : '–';
    }

    function startTimer() {
        clearInterval(timer);
        timeLeft = TIME_LIMIT_MS;
        updateTimerBar();

        timer = setInterval(() => {
            timeLeft -= 100;
            updateTimerBar();

            if (timeLeft <= 0) {
                clearInterval(timer);
                handleGameOver('Hết giờ mất rồi!');
            }
        }, 100);
    }

    function updateTimerBar() {
        const percentage = Math.max(0, (timeLeft / TIME_LIMIT_MS) * 100);
        timerBar.style.width = `${percentage}%`;

        timerBar.classList.remove('warning', 'danger');
        if (percentage < 30) {
            timerBar.classList.add('danger');
        } else if (percentage < 60) {
            timerBar.classList.add('warning');
        }
    }

    function renderBoard(cards) {
        board.innerHTML = '';
        cards.forEach((item) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'fruitpick-card';
            card.dataset.key = item.key;
            card.setAttribute('aria-label', item.en);
            card.innerHTML = `<span class="fruitpick-card-emoji">${item.emoji}</span>`;
            card.addEventListener('click', () => handleCardClick(item.key, card));
            board.appendChild(card);
        });
    }

    function startRound() {
        round += 1;
        acceptingAnswer = true;
        updateStats();

        const tier = getLevelTierForRound(round);
        const target = tier.items[Math.floor(Math.random() * tier.items.length)];
        targetKey = target.key;

        const cardCount = Math.min(STARTING_COUNT + (round - 1), MAX_COUNT, tier.items.length);
        renderBoard(buildCards(tier.items, target, cardCount));

        wordEl.textContent = target.en;
        statusText.textContent = 'Đây là quả gì nhỉ?';
        startTimer();
    }

    function handleCardClick(key, card) {
        if (!acceptingAnswer || isGameOver) {
            return;
        }

        if (key === targetKey) {
            acceptingAnswer = false;
            clearInterval(timer);
            sound.correct();
            card.classList.add('correct');
            statusText.textContent = '🎉 Chính xác!';
            setTimeout(startRound, CORRECT_PAUSE_MS);
            return;
        }

        acceptingAnswer = false;
        clearInterval(timer);
        card.classList.add('wrong');
        sound.wrong();
        handleGameOver();
    }

    function handleGameOver(reason = '') {
        isGameOver = true;
        acceptingAnswer = false;
        clearInterval(timer);

        const roundsCompleted = round - 1;

        if (roundsCompleted > bestScore) {
            bestScore = roundsCompleted;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        endGame(roundsCompleted);
        updateStats();

        const targetItem = LEVEL_TIERS.flatMap((t) => t.items).find((item) => item.key === targetKey);
        const prefix = reason ? `${reason} ` : '';
        messageTextEl.textContent = `${prefix}Đáp án đúng là ${targetItem.en} ${targetItem.emoji}. Bạn đã qua ${roundsCompleted} vòng!`;
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
        wordEl.textContent = '';
        statusText.textContent = 'Chạm đúng hình loại quả nhé!';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');

if (container) {
    initFruitPickGame(container);
}
