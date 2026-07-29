import './style.css';
import { endGame, playTone } from '../../js/app.js';

const EMOTIONS = [
    { key: 'vui', emoji: '😊', label: 'Vui vẻ' },
    { key: 'buon', emoji: '😢', label: 'Buồn bã' },
    { key: 'ngac-nhien', emoji: '😲', label: 'Ngạc nhiên' },
    { key: 'tuc-gian', emoji: '😠', label: 'Tức giận' },
    { key: 'lo-lang', emoji: '😟', label: 'Lo lắng' },
    { key: 'ngu-gat', emoji: '😴', label: 'Buồn ngủ' },
    { key: 'kinh-tom', emoji: '🤢', label: 'Kinh tởm' },
    { key: 'yeu', emoji: '😍', label: 'Yêu thương' },
];

const STARTING_COUNT = 2;
const MAX_COUNT = 8;
const MEMORIZE_BASE_MS = 1500;
const MEMORIZE_PER_EMOTION_MS = 600;
const CORRECT_PAUSE_MS = 1000;

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
        show() {
            playTone(440, 0, 0.1, 'triangle', 0.1);
        }
    };
}

function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function initEmotionMatchGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'emotionMatchBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let sequence = [];
    let userInput = [];
    let acceptingInput = false;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'emotion-match-game';

    const stats = document.createElement('div');
    stats.className = 'emotion-match-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'emotion-match-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'emotion-match-board-wrap';

    const statusText = document.createElement('div');
    statusText.className = 'emotion-match-status';
    statusText.textContent = 'Ghi nhớ chuỗi cảm xúc nhé!';

    const displayRow = document.createElement('div');
    displayRow.className = 'emotion-sequence-display';

    const selectionGrid = document.createElement('div');
    selectionGrid.className = 'emotion-selection-grid is-hidden';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'emotion-match-start';
    startOverlay.innerHTML = `<button type="button" class="emotion-match-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(statusText, displayRow, selectionGrid, startOverlay);

    const message = document.createElement('div');
    message.className = 'emotion-match-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="emotion-match-message-card">
            <div class="emotion-match-message-emoji">😅</div>
            <div class="emotion-match-message-text" data-role="message-text"></div>
            <button type="button" class="emotion-match-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.emotion-match-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.emotion-match-message-ok');

    function updateStats() {
        levelEl.textContent = String(round);
        bestEl.textContent = String(bestScore);
    }

    function renderOptions() {
        selectionGrid.innerHTML = '';
        const shuffledEmotions = shuffle(EMOTIONS);
        shuffledEmotions.forEach(emotion => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'emotion-option';
            btn.textContent = emotion.emoji;
            btn.title = emotion.label;
            btn.addEventListener('click', () => handleSelection(emotion));
            selectionGrid.appendChild(btn);
        });
    }

    function startRound() {
        round += 1;
        userInput = [];
        acceptingInput = false;
        updateStats();

        const count = Math.min(STARTING_COUNT + Math.floor((round - 1) / 2), MAX_COUNT);
        sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]);
        }

        displayRow.innerHTML = '';
        selectionGrid.classList.add('is-hidden');
        statusText.textContent = 'Ghi nhớ chuỗi cảm xúc này!';

        sequence.forEach((item, index) => {
            const tile = document.createElement('div');
            tile.className = 'emotion-tile';
            tile.textContent = item.emoji;
            displayRow.appendChild(tile);
        });

        const memorizeDuration = MEMORIZE_BASE_MS + (count - 2) * MEMORIZE_PER_EMOTION_MS;

        setTimeout(() => {
            if (isGameOver) return;

            const tiles = displayRow.querySelectorAll('.emotion-tile');
            tiles.forEach(t => t.classList.add('hidden-emotion'));

            statusText.textContent = 'Chọn lại các cảm xúc theo đúng thứ tự!';
            selectionGrid.classList.remove('is-hidden');
            renderOptions();
            acceptingInput = true;
        }, memorizeDuration);
    }

    function handleSelection(emotion) {
        if (!acceptingInput || isGameOver) return;

        const currentStep = userInput.length;
        const expectedEmotion = sequence[currentStep];
        const tiles = displayRow.querySelectorAll('.emotion-tile');

        if (emotion.key === expectedEmotion.key) {
            sound.click();
            userInput.push(emotion);

            tiles[currentStep].textContent = emotion.emoji;
            tiles[currentStep].classList.remove('hidden-emotion');
            tiles[currentStep].classList.add('correct');

            if (userInput.length === sequence.length) {
                acceptingInput = false;
                sound.correct();
                statusText.textContent = '🎉 Giỏi quá!';
                selectionGrid.classList.add('is-hidden');
                setTimeout(startRound, CORRECT_PAUSE_MS);
            }
        } else {
            tiles[currentStep].textContent = emotion.emoji;
            tiles[currentStep].classList.remove('hidden-emotion');
            tiles[currentStep].classList.add('wrong');
            handleGameOver();
        }
    }

    function handleGameOver() {
        isGameOver = true;
        acceptingInput = false;
        sound.wrong();

        const roundsCompleted = round - 1;
        if (roundsCompleted > bestScore) {
            bestScore = roundsCompleted;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        endGame(roundsCompleted);
        updateStats();

        messageTextEl.textContent = `Bạn đã chọn sai rồi! Bạn đã vượt qua ${roundsCompleted} vòng.`;
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
        displayRow.innerHTML = '';
        selectionGrid.classList.add('is-hidden');
        statusText.textContent = 'Ghi nhớ chuỗi cảm xúc nhé!';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');
if (container) {
    initEmotionMatchGame(container);
}
