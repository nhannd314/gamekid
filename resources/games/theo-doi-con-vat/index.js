import './style.css';
import { endGame, playTone } from '../../js/app.js';

const ANIMALS = [
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

const STARTING_COUNT = 5;
const MAX_COUNT = 16;
const HIGHLIGHT_DURATION_MS = 1500;
const SHUFFLE_STEP_MS = 600;
const BASE_SHUFFLE_STEPS = 3;
const MAX_SHUFFLE_STEPS = 7;
const ANSWER_TIME_LIMIT_MS = 5000;
const CORRECT_PAUSE_MS = 900;

function createSoundEffects() {
    return {
        correct() {
            playTone(880, 0, 0.15, 'sine', 0.35);
            playTone(1174.66, 0.12, 0.18, 'sine', 0.35);
        },
        wrong() {
            playTone(160, 0, 0.35, 'sawtooth', 0.3);
        },
        whoosh() {
            playTone(400, 0, 0.08, 'triangle', 0.15);
        },
    };
}

function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Lays animals out on a non-overlapping grid of percentage-based slots so
 * shuffling can freely swap positions without any collisions.
 */
function buildSlots(count) {
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const slotWidth = 100 / cols;
    const slotHeight = 100 / rows;
    const slots = [];

    for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        slots.push({
            left: col * slotWidth + slotWidth / 2,
            top: row * slotHeight + slotHeight / 2,
        });
    }

    return slots;
}

function initTrackAnimalGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'trackAnimalBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let round = 0;
    let targetIndex = null;
    let acceptingAnswer = false;
    let isGameOver = false;
    let answerTimer = null;
    let timeLeft = 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'trackpet-game';

    const stats = document.createElement('div');
    stats.className = 'trackpet-game-stats';
    stats.innerHTML = `
        <div class="stat">Vòng: <span data-role="level">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'trackpet-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const boardWrap = document.createElement('div');
    boardWrap.className = 'trackpet-game-board-wrap';

    const timerWrap = document.createElement('div');
    timerWrap.className = 'trackpet-game-timer-wrap';
    const timerBar = document.createElement('div');
    timerBar.className = 'trackpet-game-timer-bar';
    timerWrap.appendChild(timerBar);

    const statusText = document.createElement('div');
    statusText.className = 'trackpet-game-status';
    statusText.textContent = 'Sẵn sàng chưa?';

    const stage = document.createElement('div');
    stage.className = 'trackpet-stage';

    const startOverlay = document.createElement('div');
    startOverlay.className = 'trackpet-start';
    startOverlay.innerHTML = `<button type="button" class="trackpet-start-btn">▶ Bắt đầu</button>`;

    boardWrap.append(timerWrap, statusText, stage, startOverlay);

    const message = document.createElement('div');
    message.className = 'trackpet-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="trackpet-message-card">
            <div class="trackpet-message-emoji">🐾</div>
            <div class="trackpet-message-text" data-role="message-text"></div>
            <button type="button" class="trackpet-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const levelEl = stats.querySelector('[data-role="level"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startButton = startOverlay.querySelector('.trackpet-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.trackpet-message-ok');

    function updateStats() {
        levelEl.textContent = String(round);
        bestEl.textContent = String(bestScore);
    }

    function startAnswerTimer() {
        clearInterval(answerTimer);
        timeLeft = ANSWER_TIME_LIMIT_MS;
        updateTimerBar();

        answerTimer = setInterval(() => {
            timeLeft -= 100;
            updateTimerBar();

            if (timeLeft <= 0) {
                clearInterval(answerTimer);
                handleGameOver('Hết giờ mất rồi!');
            }
        }, 100);
    }

    function updateTimerBar() {
        const percentage = Math.max(0, (timeLeft / ANSWER_TIME_LIMIT_MS) * 100);
        timerBar.style.width = `${percentage}%`;

        timerBar.classList.remove('warning', 'danger');
        if (percentage < 30) {
            timerBar.classList.add('danger');
        } else if (percentage < 60) {
            timerBar.classList.add('warning');
        }
    }

    function placePet(el, slot) {
        el.style.left = `${slot.left}%`;
        el.style.top = `${slot.top}%`;
    }

    function runShuffle(pets, slots, totalSteps, stepIndex) {
        if (stepIndex >= totalSteps) {
            statusText.textContent = 'Chú nào lúc nãy được tô sáng?';
            acceptingAnswer = true;
            timerWrap.style.visibility = 'visible';
            startAnswerTimer();
            return;
        }

        sound.whoosh();
        const shuffledSlots = shuffle(slots);
        pets.forEach((pet, index) => placePet(pet, shuffledSlots[index]));

        setTimeout(() => runShuffle(pets, slots, totalSteps, stepIndex + 1), SHUFFLE_STEP_MS);
    }

    function startRound() {
        round += 1;
        acceptingAnswer = false;
        updateStats();
        timerWrap.style.visibility = 'hidden';
        timerBar.style.width = '100%';
        timerBar.classList.remove('warning', 'danger');

        const species = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        const count = Math.min(STARTING_COUNT + round - 1, MAX_COUNT);
        const slots = buildSlots(count);
        const shuffledSlots = shuffle(slots);

        stage.innerHTML = '';
        const pets = [];

        for (let i = 0; i < count; i++) {
            const pet = document.createElement('button');
            pet.type = 'button';
            pet.className = 'trackpet-pet';
            pet.textContent = species.emoji;
            placePet(pet, shuffledSlots[i]);
            pet.addEventListener('click', () => handlePetClick(pet));
            stage.appendChild(pet);
            pets.push(pet);
        }

        targetIndex = Math.floor(Math.random() * pets.length);
        statusText.textContent = 'Nhớ kỹ chú này nhé!';

        setTimeout(() => {
            pets[targetIndex].classList.add('highlighted');
        }, 50);

        setTimeout(() => {
            pets[targetIndex].classList.remove('highlighted');
            statusText.textContent = '🌀 Chạy loạn xạ...';
            const steps = Math.min(BASE_SHUFFLE_STEPS + Math.floor(round / 2), MAX_SHUFFLE_STEPS);
            runShuffle(pets, slots, steps, 0);
        }, HIGHLIGHT_DURATION_MS);
    }

    function handlePetClick(pet) {
        if (!acceptingAnswer || isGameOver) {
            return;
        }

        acceptingAnswer = false;
        clearInterval(answerTimer);

        const pets = Array.from(stage.children);
        const clickedIndex = pets.indexOf(pet);

        if (clickedIndex === targetIndex) {
            sound.correct();
            pet.classList.add('correct');
            statusText.textContent = '🎉 Chính xác!';
            setTimeout(startRound, CORRECT_PAUSE_MS);
            return;
        }

        pet.classList.add('wrong');
        pets[targetIndex]?.classList.add('correct');
        sound.wrong();
        handleGameOver();
    }

    function handleGameOver(reason = '') {
        isGameOver = true;
        acceptingAnswer = false;
        clearInterval(answerTimer);

        const roundsCompleted = round - 1;

        if (roundsCompleted > bestScore) {
            bestScore = roundsCompleted;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        endGame(roundsCompleted);
        updateStats();

        const prefix = reason ? `${reason} ` : '';
        messageTextEl.textContent = `${prefix}Bạn đã qua ${roundsCompleted} vòng!`;
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
        stage.innerHTML = '';
        statusText.textContent = 'Sẵn sàng chưa?';
        round = 0;
        updateStats();
    });

    updateStats();
}

const container = document.getElementById('game-container');

if (container) {
    initTrackAnimalGame(container);
}
