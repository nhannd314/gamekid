import './style.css';
import { endGame, playTone } from '../../js/app.js';

const LEVEL_TIERS = [
    {
        name: 'Dễ',
        animals: [
            { key: 'dog', en: 'Dog', emoji: '🐶' },
            { key: 'cat', en: 'Cat', emoji: '🐱' },
            { key: 'rabbit', en: 'Rabbit', emoji: '🐰' },
            { key: 'mouse', en: 'Mouse', emoji: '🐭' },
            { key: 'hamster', en: 'Hamster', emoji: '🐹' },
            { key: 'horse', en: 'Horse', emoji: '🐴' },
            { key: 'cow', en: 'Cow', emoji: '🐮' },
            { key: 'pig', en: 'Pig', emoji: '🐷' },
            { key: 'sheep', en: 'Sheep', emoji: '🐑' },
            { key: 'goat', en: 'Goat', emoji: '🐐' },
            { key: 'chicken', en: 'Chicken', emoji: '🐔' },
            { key: 'duck', en: 'Duck', emoji: '🦆' },
            { key: 'elephant', en: 'Elephant', emoji: '🐘' },
            { key: 'lion', en: 'Lion', emoji: '🦁' },
            { key: 'tiger', en: 'Tiger', emoji: '🐯' },
            { key: 'bear', en: 'Bear', emoji: '🐻' },
            { key: 'panda', en: 'Panda', emoji: '🐼' },
            { key: 'koala', en: 'Koala', emoji: '🐨' },
            { key: 'monkey', en: 'Monkey', emoji: '🐵' },
            { key: 'fish', en: 'Fish', emoji: '🐟' },
            { key: 'bird', en: 'Bird', emoji: '🐦' },
            { key: 'frog', en: 'Frog', emoji: '🐸' },
            { key: 'turtle', en: 'Turtle', emoji: '🐢' },
            { key: 'bee', en: 'Bee', emoji: '🐝' },
            { key: 'butterfly', en: 'Butterfly', emoji: '🦋' },
            { key: 'snail', en: 'Snail', emoji: '🐌' },
            { key: 'penguin', en: 'Penguin', emoji: '🐧' },
            { key: 'dolphin', en: 'Dolphin', emoji: '🐬' },
            { key: 'whale', en: 'Whale', emoji: '🐳' },
            { key: 'giraffe', en: 'Giraffe', emoji: '🦒' },
        ],
    },
    {
        name: 'Trung bình',
        animals: [
            { key: 'wolf', en: 'Wolf', emoji: '🐺' },
            { key: 'fox', en: 'Fox', emoji: '🦊' },
            { key: 'raccoon', en: 'Raccoon', emoji: '🦝' },
            { key: 'deer', en: 'Deer', emoji: '🦌' },
            { key: 'buffalo', en: 'Buffalo', emoji: '🐃' },
            { key: 'camel', en: 'Camel', emoji: '🐫' },
            { key: 'llama', en: 'Llama', emoji: '🦙' },
            { key: 'hippo', en: 'Hippopotamus', emoji: '🦛' },
            { key: 'rhino', en: 'Rhinoceros', emoji: '🦏' },
            { key: 'squirrel', en: 'Squirrel', emoji: '🐿️' },
            { key: 'hedgehog', en: 'Hedgehog', emoji: '🦔' },
            { key: 'bat', en: 'Bat', emoji: '🦇' },
            { key: 'owl', en: 'Owl', emoji: '🦉' },
            { key: 'eagle', en: 'Eagle', emoji: '🦅' },
            { key: 'parrot', en: 'Parrot', emoji: '🦜' },
            { key: 'swan', en: 'Swan', emoji: '🦢' },
            { key: 'peacock', en: 'Peacock', emoji: '🦚' },
            { key: 'flamingo', en: 'Flamingo', emoji: '🦩' },
            { key: 'rooster', en: 'Rooster', emoji: '🐓' },
            { key: 'turkey', en: 'Turkey', emoji: '🦃' },
            { key: 'snake', en: 'Snake', emoji: '🐍' },
            { key: 'lizard', en: 'Lizard', emoji: '🦎' },
            { key: 'crocodile', en: 'Crocodile', emoji: '🐊' },
            { key: 'shark', en: 'Shark', emoji: '🦈' },
            { key: 'octopus', en: 'Octopus', emoji: '🐙' },
            { key: 'crab', en: 'Crab', emoji: '🦀' },
            { key: 'shrimp', en: 'Shrimp', emoji: '🦐' },
            { key: 'jellyfish', en: 'Jellyfish', emoji: '🪼' },
            { key: 'ladybug', en: 'Ladybug', emoji: '🐞' },
            { key: 'ant', en: 'Ant', emoji: '🐜' },
        ],
    },
    {
        name: 'Khó',
        animals: [
            { key: 'gorilla', en: 'Gorilla', emoji: '🦍' },
            { key: 'orangutan', en: 'Orangutan', emoji: '🦧' },
            { key: 'sloth', en: 'Sloth', emoji: '🦥' },
            { key: 'otter', en: 'Otter', emoji: '🦦' },
            { key: 'skunk', en: 'Skunk', emoji: '🦨' },
            { key: 'badger', en: 'Badger', emoji: '🦡' },
            { key: 'kangaroo', en: 'Kangaroo', emoji: '🦘' },
            { key: 'bison', en: 'Bison', emoji: '🦬' },
            { key: 'mammoth', en: 'Mammoth', emoji: '🦣' },
            { key: 'beaver', en: 'Beaver', emoji: '🦫' },
            { key: 'zebra', en: 'Zebra', emoji: '🦓' },
            { key: 'unicorn', en: 'Unicorn', emoji: '🦄' },
            { key: 'seal', en: 'Seal', emoji: '🦭' },
            { key: 'dodo', en: 'Dodo', emoji: '🦤' },
            { key: 'dove', en: 'Dove', emoji: '🕊️' },
            { key: 'spider', en: 'Spider', emoji: '🕷️' },
            { key: 'scorpion', en: 'Scorpion', emoji: '🦂' },
            { key: 'cricket', en: 'Cricket', emoji: '🦗' },
            { key: 'cockroach', en: 'Cockroach', emoji: '🪳' },
            { key: 'mosquito', en: 'Mosquito', emoji: '🦟' },
            { key: 'worm', en: 'Worm', emoji: '🪱' },
            { key: 'dragon', en: 'Dragon', emoji: '🐉' },
            { key: 'sauropod', en: 'Sauropod', emoji: '🦕' },
            { key: 'trex', en: 'T-Rex', emoji: '🦖' },
            { key: 'coral', en: 'Coral', emoji: '🪸' },
            { key: 'shell', en: 'Shell', emoji: '🐚' },
            { key: 'beetle', en: 'Beetle', emoji: '🪲' },
            { key: 'fly', en: 'Fly', emoji: '🪰' },
            { key: 'leopard', en: 'Leopard', emoji: '🐆' },
            { key: 'boar', en: 'Boar', emoji: '🐗' },
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
    const candidates = pool.filter((animal) => animal.key !== excludeKey);
    return shuffle(candidates).slice(0, count);
}

function buildCards(pool, target, count) {
    const decoys = randomDecoys(pool, target.key, count - 1);
    return shuffle([target, ...decoys]);
}

function initAnimalTapGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'animalTapBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let targetKey = null;
    let acceptingAnswer = false;
    let isGameOver = false;
    let timer = null;
    let timeLeft = 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'animaltap-game';

    const stats = document.createElement('div');
    stats.className = 'animaltap-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Cấp độ: <span data-role="tier">–</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'animaltap-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'animaltap-game-board-wrap';

    const timerWrap = document.createElement('div');
    timerWrap.className = 'animaltap-game-timer-wrap';
    const timerBar = document.createElement('div');
    timerBar.className = 'animaltap-game-timer-bar';
    timerWrap.appendChild(timerBar);

    const statusText = document.createElement('div');
    statusText.className = 'animaltap-game-status';
    statusText.textContent = 'Chạm đúng hình con vật nhé!';

    const wordCard = document.createElement('div');
    wordCard.className = 'animaltap-word-card';
    wordCard.innerHTML = `<span class="animaltap-word" data-role="word"></span>`;

    const board = document.createElement('div');
    board.className = 'animaltap-board';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'animaltap-start';
    startOverlay.innerHTML = `<button type="button" class="animaltap-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(timerWrap, statusText, wordCard, board, startOverlay);

    const message = document.createElement('div');
    message.className = 'animaltap-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="animaltap-message-card">
            <div class="animaltap-message-emoji">🐾</div>
            <div class="animaltap-message-text" data-role="message-text"></div>
            <button type="button" class="animaltap-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const tierEl = stats.querySelector('[data-role="tier"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const wordEl = wordCard.querySelector('[data-role="word"]');
    const startButton = startOverlay.querySelector('.animaltap-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.animaltap-message-ok');

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
        cards.forEach((animal) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'animaltap-card';
            card.dataset.key = animal.key;
            card.setAttribute('aria-label', animal.en);
            card.innerHTML = `<span class="animaltap-card-emoji">${animal.emoji}</span>`;
            card.addEventListener('click', () => handleCardClick(animal.key, card));
            board.appendChild(card);
        });
    }

    function startRound() {
        round += 1;
        acceptingAnswer = true;
        updateStats();

        const tier = getLevelTierForRound(round);
        const target = tier.animals[Math.floor(Math.random() * tier.animals.length)];
        targetKey = target.key;

        const cardCount = Math.min(STARTING_COUNT + (round - 1), MAX_COUNT, tier.animals.length);
        renderBoard(buildCards(tier.animals, target, cardCount));

        wordEl.textContent = target.en;
        statusText.textContent = 'Con vật này là con gì?';
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

        const targetAnimal = LEVEL_TIERS.flatMap((t) => t.animals).find((animal) => animal.key === targetKey);
        const prefix = reason ? `${reason} ` : '';
        messageTextEl.textContent = `${prefix}Đáp án đúng là ${targetAnimal.en} ${targetAnimal.emoji}. Bạn đã qua ${roundsCompleted} vòng!`;
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
        statusText.textContent = 'Chạm đúng hình con vật nhé!';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');

if (container) {
    initAnimalTapGame(container);
}
