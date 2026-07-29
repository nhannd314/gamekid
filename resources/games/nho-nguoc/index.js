import './style.css';
import { endGame, playTone } from '../../js/app.js';

const BEST_SCORE_KEY = 'reverseSequenceBestScore';
const DIGIT_SHOW_MS = 700;
const DIGIT_GAP_MS = 250;
const NEXT_ROUND_DELAY_MS = 900;

function createSoundEffects() {
    return {
        digit(value) {
            playTone(220 + Number(value) * 40, 0, 0.22, 'triangle', 0.3);
        },
        wrong() {
            playTone(160, 0, 0.35, 'sawtooth', 0.3);
        },
    };
}

function randomDigit() {
    return Math.floor(Math.random() * 10);
}

function initReverseSequenceGame(container) {
    const sound = createSoundEffects();
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let sequence = [];
    let reversedSequence = [];
    let playerStep = 0;
    let lockBoard = true;
    let isGameOver = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'revseq-game';

    const stats = document.createElement('div');
    stats.className = 'revseq-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'revseq-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'revseq-game-board-wrap';

    const display = document.createElement('div');
    display.className = 'revseq-display';
    display.innerHTML = `<span data-role="display-text">--</span>`;

    const hint = document.createElement('div');
    hint.className = 'revseq-hint';
    hint.innerHTML = `<span class="revseq-hint-arrow">↩</span> Nhập lại theo thứ tự <strong>NGƯỢC</strong>!`;

    const progress = document.createElement('div');
    progress.className = 'revseq-progress';

    const keypad = document.createElement('div');
    keypad.className = 'revseq-keypad';

    const keys = Array.from({ length: 10 }, (_, digit) => {
        const key = document.createElement('button');
        key.type = 'button';
        key.className = 'revseq-key';
        key.dataset.digit = String(digit);
        key.textContent = String(digit);

        key.addEventListener('click', () => handleKeyClick(digit, key));
        keypad.appendChild(key);
        return key;
    });

    const startOverlay = document.createElement('div');
    startOverlay.className = 'revseq-start';
    startOverlay.innerHTML = `<button type="button" class="revseq-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(display, hint, progress, keypad, startOverlay);

    const message = document.createElement('div');
    message.className = 'revseq-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="revseq-message-card">
            <div class="revseq-message-emoji">🔄</div>
            <div class="revseq-message-text" data-role="message-text"></div>
            <button type="button" class="revseq-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.revseq-start-btn');
    const displayTextEl = display.querySelector('[data-role="display-text"]');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.revseq-message-ok');

    function updateStats() {
        levelEl.textContent = String(sequence.length);
        bestEl.textContent = String(bestScore);
    }

    function updateProgress() {
        progress.innerHTML = '';

        sequence.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'revseq-progress-dot';

            if (index < playerStep) {
                dot.classList.add('filled');
            }

            progress.appendChild(dot);
        });
    }

    function showSequence() {
        lockBoard = true;
        displayTextEl.textContent = '···';

        sequence.forEach((digit, index) => {
            const showAt = (index + 1) * DIGIT_GAP_MS + index * DIGIT_SHOW_MS;

            setTimeout(() => {
                displayTextEl.textContent = String(digit);
                displayTextEl.classList.add('active');
            }, showAt);

            setTimeout(() => {
                displayTextEl.classList.remove('active');
            }, showAt + DIGIT_SHOW_MS);
        });

        const totalTime = sequence.length * (DIGIT_SHOW_MS + DIGIT_GAP_MS);

        setTimeout(() => {
            displayTextEl.textContent = '?';
            lockBoard = false;
        }, totalTime);
    }

    function nextRound() {
        sequence.push(randomDigit());
        reversedSequence = [...sequence].reverse();
        playerStep = 0;
        updateStats();
        updateProgress();
        showSequence();
    }

    function handleKeyClick(digit, key) {
        if (lockBoard || isGameOver) {
            return;
        }

        key.classList.add('active');
        sound.digit(digit);
        setTimeout(() => key.classList.remove('active'), 150);

        if (digit === reversedSequence[playerStep]) {
            playerStep += 1;
            displayTextEl.textContent = String(digit);
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
        messageTextEl.textContent = `Dãy số là ${sequence.join(' ')} — nhập ngược lại là ${reversedSequence.join(' ')}. Bạn đã qua ${roundsCompleted} vòng!`;
        message.hidden = false;
    }

    function startGame() {
        sequence = [];
        reversedSequence = [];
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
    initReverseSequenceGame(container);
}
