import './style.css';
import { endGame, playTone } from '../../js/app.js';

const LETTERS = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));

const BEST_SCORE_KEY = 'letterSequenceBestScore';
const LETTER_SHOW_MS = 700;
const LETTER_GAP_MS = 250;
const NEXT_ROUND_DELAY_MS = 900;

function createSoundEffects() {
    return {
        letter(value) {
            const stepIndex = value.charCodeAt(0) - 65;
            playTone(220 + stepIndex * 20, 0, 0.22, 'triangle', 0.3);
        },
        wrong() {
            playTone(160, 0, 0.35, 'sawtooth', 0.3);
        },
    };
}

function randomLetter() {
    return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function initLetterSequenceGame(container) {
    const sound = createSoundEffects();
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let sequence = [];
    let playerStep = 0;
    let lockBoard = true;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'letseq-game';

    const stats = document.createElement('div');
    stats.className = 'letseq-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'letseq-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'letseq-game-board-wrap';

    const display = document.createElement('div');
    display.className = 'letseq-display';
    display.innerHTML = `<span data-role="display-text">--</span>`;

    const progress = document.createElement('div');
    progress.className = 'letseq-progress';

    const keypad = document.createElement('div');
    keypad.className = 'letseq-keypad';

    const keys = LETTERS.map((letter) => {
        const key = document.createElement('button');
        key.type = 'button';
        key.className = 'letseq-key';
        key.dataset.letter = letter;
        key.textContent = letter;

        key.addEventListener('click', () => handleKeyClick(letter, key));
        keypad.appendChild(key);
        return key;
    });

    const startOverlay = document.createElement('div');
    startOverlay.className = 'letseq-start';
    startOverlay.innerHTML = `<button type="button" class="letseq-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(display, progress, keypad, startOverlay);

    const message = document.createElement('div');
    message.className = 'letseq-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="letseq-message-card">
            <div class="letseq-message-emoji">🔤</div>
            <div class="letseq-message-text" data-role="message-text"></div>
            <button type="button" class="letseq-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.letseq-start-btn');
    const displayTextEl = display.querySelector('[data-role="display-text"]');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.letseq-message-ok');

    function updateStats() {
        levelEl.textContent = String(sequence.length);
        bestEl.textContent = String(bestScore);
    }

    function updateProgress() {
        progress.innerHTML = '';

        sequence.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'letseq-progress-dot';

            if (index < playerStep) {
                dot.classList.add('filled');
            }

            progress.appendChild(dot);
        });
    }

    function showSequence() {
        lockBoard = true;
        displayTextEl.textContent = '···';

        sequence.forEach((letter, index) => {
            const showAt = (index + 1) * LETTER_GAP_MS + index * LETTER_SHOW_MS;

            setTimeout(() => {
                displayTextEl.textContent = letter;
                displayTextEl.classList.add('active');
            }, showAt);

            setTimeout(() => {
                displayTextEl.classList.remove('active');
            }, showAt + LETTER_SHOW_MS);
        });

        const totalTime = sequence.length * (LETTER_SHOW_MS + LETTER_GAP_MS);

        setTimeout(() => {
            displayTextEl.textContent = '?';
            lockBoard = false;
        }, totalTime);
    }

    function nextRound() {
        sequence.push(randomLetter());
        playerStep = 0;
        updateStats();
        updateProgress();
        showSequence();
    }

    function handleKeyClick(letter, key) {
        if (lockBoard || isGameOver) {
            return;
        }

        key.classList.add('active');
        sound.letter(letter);
        setTimeout(() => key.classList.remove('active'), 150);

        if (letter === sequence[playerStep]) {
            playerStep += 1;
            displayTextEl.textContent = letter;
            updateProgress();

            if (playerStep === sequence.length) {
                lockBoard = true;
                displayTextEl.textContent = '✓';
                setTimeout(nextRound, NEXT_ROUND_DELAY_MS);
            }

            return;
        }

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
        displayTextEl.textContent = '✗';
        messageTextEl.textContent = `Bạn đã nhớ đúng ${roundsCompleted} dãy chữ cái!`;
        message.hidden = false;
    }

    function startGame() {
        sequence = [];
        playerStep = 0;
        isGameOver = false;
        startOverlay.hidden = true;
        message.hidden = true;
        updateStats();
        updateProgress();
        nextRound();
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
    initLetterSequenceGame(container);
}
