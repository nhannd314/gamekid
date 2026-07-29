import './style.css';
import { endGame, playTone } from '../../js/app.js';

const SETS = [
    { common: '🍎', odd: '🍅', name: 'Trái cây' },
    { common: '🐶', odd: '🐱', name: 'Thú cưng' },
    { common: '🦁', odd: '🐯', name: 'Rừng xanh' },
    { common: '🚗', odd: '🚑', name: 'Giao thông' },
    { common: '⚽', odd: '🏀', name: 'Thể thao' },
    { common: '🍦', odd: '🧁', name: 'Món ngọt' },
    { common: '🌞', odd: '🌝', name: 'Bầu trời' },
    { common: '🦋', odd: '🐝', name: 'Côn trùng' },
    { common: '🌸', odd: '🏵️', name: 'Bông hoa' },
    { common: '🦉', odd: '🦜', name: 'Loài chim' },
    { common: '🐢', odd: '🦎', name: 'Bò sát' },
    { common: '🐳', odd: '🐬', name: 'Biển cả' },
    { common: '🥦', odd: '🥬', name: 'Rau củ' },
    { common: '🍔', odd: '🥪', name: 'Đồ ăn' },
    { common: '🎹', odd: '🎸', name: 'Nhạc cụ' },
];

function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function initOddGame(container) {
    const BEST_SCORE_KEY = 'oddOneOutBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let isGameOver = false;
    let acceptingAnswer = false;
    let currentOddIndex = -1;
    let timer = null;
    let timeLeft = 0;
    const TIME_LIMIT = 5000; // 5 giây cho mỗi hình

    const wrapper = document.createElement('div');
    wrapper.className = 'odd-game';

    const stats = document.createElement('div');
    stats.className = 'odd-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
        <button type="button" class="odd-game-restart">Chơi lại</button>
    `;

    const boardWrap = document.createElement('div');
    boardWrap.className = 'odd-game-board-wrap';

    const timerWrap = document.createElement('div');
    timerWrap.className = 'odd-game-timer-wrap';
    const timerBar = document.createElement('div');
    timerBar.className = 'odd-game-timer-bar';
    timerWrap.appendChild(timerBar);

    const statusText = document.createElement('div');
    statusText.className = 'odd-game-status';
    statusText.textContent = 'Tìm hình khác biệt nhé!';

    const board = document.createElement('div');
    board.className = 'odd-game-board';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'odd-game-start';
    startOverlay.innerHTML = `<button type="button" class="odd-game-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(timerWrap, statusText, board, startOverlay);

    const message = document.createElement('div');
    message.className = 'odd-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="odd-game-message-card">
            <div class="odd-game-message-emoji">😅</div>
            <div class="odd-game-message-text" data-role="message-text"></div>
            <button type="button" class="odd-game-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const restartBtn = stats.querySelector('.odd-game-restart');
    const startBtn = startOverlay.querySelector('.odd-game-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkBtn = message.querySelector('.odd-game-message-ok');

    function updateStats() {
        levelEl.textContent = String(round);
        bestEl.textContent = String(bestScore);
    }

    function startTimer() {
        if (timer) clearInterval(timer);
        timeLeft = TIME_LIMIT;
        updateTimerBar();

        timer = setInterval(() => {
            if (isGameOver) {
                clearInterval(timer);
                return;
            }

            timeLeft -= 100;
            updateTimerBar();

            if (timeLeft <= 0) {
                clearInterval(timer);
                handleGameOver('Hết thời gian mất rồi!');
            }
        }, 100);
    }

    function updateTimerBar() {
        const percentage = (timeLeft / TIME_LIMIT) * 100;
        timerBar.style.width = `${percentage}%`;

        timerBar.classList.remove('warning', 'danger');
        if (percentage < 30) {
            timerBar.classList.add('danger');
        } else if (percentage < 60) {
            timerBar.classList.add('warning');
        }
    }

    function startRound() {
        round += 1;
        updateStats();
        acceptingAnswer = true;

        // Số lượng hình: cố định 20x20 = 400 hình
        const totalItems = 400;

        const set = SETS[Math.floor(Math.random() * SETS.length)];
        const items = Array(totalItems).fill(set.common);
        currentOddIndex = Math.floor(Math.random() * totalItems);
        items[currentOddIndex] = set.odd;

        board.innerHTML = '';
        items.forEach((emoji, index) => {
            const tile = document.createElement('div');
            tile.className = 'odd-tile';
            tile.textContent = emoji;
            tile.addEventListener('click', () => handleTileClick(index, tile));
            board.appendChild(tile);
        });

        statusText.textContent = 'Hình nào khác với các hình còn lại?';
        startTimer();
    }

    function handleTileClick(index, tile) {
        if (!acceptingAnswer || isGameOver) return;

        if (index === currentOddIndex) {
            // Đúng
            acceptingAnswer = false;
            clearInterval(timer);
            tile.classList.add('correct');
            playTone(880, 0, 0.1, 'sine', 0.2);
            playTone(1174, 0.1, 0.15, 'sine', 0.2);

            setTimeout(() => {
                startRound();
            }, 600);
        } else {
            // Sai
            acceptingAnswer = false;
            clearInterval(timer);
            tile.classList.add('wrong');
            playTone(150, 0, 0.3, 'sawtooth', 0.3);
            handleGameOver();
        }
    }

    function handleGameOver(reason = '') {
        isGameOver = true;
        clearInterval(timer);
        const score = round - 1;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }
        updateStats();

        messageTextEl.textContent = (reason ? reason + ' ' : '') + `Bạn đã tìm đúng ${score} hình!`;
        message.hidden = false;
        endGame(score);
    }

    startBtn.addEventListener('click', () => {
        startOverlay.hidden = true;
        round = 0;
        isGameOver = false;
        startRound();
    });

    restartBtn.addEventListener('click', () => {
        message.hidden = true;
        startOverlay.hidden = true;
        round = 0;
        isGameOver = false;
        startRound();
    });

    messageOkBtn.addEventListener('click', () => {
        message.hidden = true;
        startOverlay.hidden = false;
        board.innerHTML = '';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');
if (container) {
    initOddGame(container);
}
