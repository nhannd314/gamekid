import './style.css';
import { endGame, playTone } from '../../js/app.js';

const BEST_SCORE_KEY = 'moleBestScore';
const HOLE_COUNT = 9;
const GAME_DURATION_MS = 45000;

const SPAWN_INTERVAL_START = 900;
const SPAWN_INTERVAL_END = 450;
const SHOW_DURATION_START = 1150;
const SHOW_DURATION_END = 600;

const GOLDEN_CHANCE = 0.12;
const BOMB_CHANCE = 0.18;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function createSoundEffects() {
    return {
        hit(isGolden) {
            if (isGolden) {
                playTone(784, 0, 0.1, 'triangle', 0.3);
                playTone(1046.5, 0.08, 0.15, 'triangle', 0.3);
                return;
            }
            playTone(660, 0, 0.1, 'square', 0.25);
        },
        bomb() {
            playTone(140, 0, 0.25, 'sawtooth', 0.3);
            playTone(90, 0.05, 0.3, 'sawtooth', 0.25);
        },
        end() {
            playTone(392, 0, 0.15, 'sine', 0.25);
            playTone(523.25, 0.15, 0.25, 'sine', 0.25);
        },
    };
}

function initMoleGame(container) {
    const sound = createSoundEffects();
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let score = 0;
    let timeLeft = GAME_DURATION_MS;
    let isPlaying = false;
    let isGameOver = false;
    let spawnTimeoutId = null;
    let timerIntervalId = null;

    const wrapper = document.createElement('div');
    wrapper.className = 'mole-game';

    const stats = document.createElement('div');
    stats.className = 'mole-game-stats';
    stats.innerHTML = `
        <div class="stat">Điểm: <span data-role="score">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
        <button type="button" class="mole-game-restart">Chơi lại</button>
    `;

    const boardWrap = document.createElement('div');
    boardWrap.className = 'mole-game-board-wrap';

    const timerWrap = document.createElement('div');
    timerWrap.className = 'mole-game-timer-wrap';
    const timerBar = document.createElement('div');
    timerBar.className = 'mole-game-timer-bar';
    timerWrap.appendChild(timerBar);

    const statusText = document.createElement('div');
    statusText.className = 'mole-game-status';
    statusText.textContent = 'Đập chuột lên nhanh, tránh quả bom nhé!';

    const board = document.createElement('div');
    board.className = 'mole-game-board';

    const holes = Array.from({ length: HOLE_COUNT }, () => {
        const holeEl = document.createElement('button');
        holeEl.type = 'button';
        holeEl.className = 'mole-hole';
        holeEl.setAttribute('aria-label', 'Lỗ chuột chũi');
        holeEl.innerHTML = `
            <span class="mole-mound"></span>
            <span class="mole-critter"></span>
        `;
        board.appendChild(holeEl);

        const hole = {
            el: holeEl,
            critterEl: holeEl.querySelector('.mole-critter'),
            occupied: false,
            type: 'mole',
            hideTimeoutId: null,
        };

        holeEl.addEventListener('click', () => handleHoleClick(hole));
        holeEl.addEventListener('animationend', (event) => {
            if (event.animationName === 'mole-hole-impact') {
                holeEl.classList.remove('impact');
            }
        });

        return hole;
    });

    const startOverlay = document.createElement('div');
    startOverlay.className = 'mole-game-start';
    startOverlay.innerHTML = `<button type="button" class="mole-game-start-btn">▶ Bắt đầu</button>`;

    const hammerEl = document.createElement('div');
    hammerEl.className = 'mole-hammer';
    hammerEl.textContent = '🔨';

    boardWrap.append(timerWrap, statusText, board, startOverlay, hammerEl);

    const message = document.createElement('div');
    message.className = 'mole-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="mole-game-message-card">
            <div class="mole-game-message-emoji">🐹</div>
            <div class="mole-game-message-text" data-role="message-text"></div>
            <button type="button" class="mole-game-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const scoreEl = stats.querySelector('[data-role="score"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const restartBtn = stats.querySelector('.mole-game-restart');
    const startBtn = startOverlay.querySelector('.mole-game-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkBtn = message.querySelector('.mole-game-message-ok');

    function updateStats() {
        scoreEl.textContent = String(score);
        bestEl.textContent = String(bestScore);
    }

    function updateTimerBar() {
        const percentage = Math.max(0, (timeLeft / GAME_DURATION_MS) * 100);
        timerBar.style.width = `${percentage}%`;

        timerBar.classList.remove('warning', 'danger');
        if (percentage < 30) {
            timerBar.classList.add('danger');
        } else if (percentage < 60) {
            timerBar.classList.add('warning');
        }
    }

    function elapsedFraction() {
        return Math.min(1, 1 - timeLeft / GAME_DURATION_MS);
    }

    function resetHoles() {
        holes.forEach((hole) => {
            clearTimeout(hole.hideTimeoutId);
            hole.occupied = false;
            hole.type = 'mole';
            hole.el.classList.remove('show', 'mole-hit', 'mole-hit-golden', 'mole-hit-bomb', 'impact');
        });
    }

    function spawnMole() {
        const freeHoles = holes.filter((hole) => !hole.occupied);
        if (freeHoles.length === 0) {
            return;
        }

        const hole = freeHoles[Math.floor(Math.random() * freeHoles.length)];
        const roll = Math.random();
        const type = roll < GOLDEN_CHANCE ? 'golden' : roll < GOLDEN_CHANCE + BOMB_CHANCE ? 'bomb' : 'mole';

        hole.occupied = true;
        hole.type = type;
        hole.el.classList.remove('mole-hit', 'mole-hit-golden', 'mole-hit-bomb');
        hole.critterEl.textContent = type === 'golden' ? '🐿️' : type === 'bomb' ? '💣' : '🐹';
        hole.el.classList.add('show');

        const showDuration = lerp(SHOW_DURATION_START, SHOW_DURATION_END, elapsedFraction()) + Math.random() * 150;
        hole.hideTimeoutId = setTimeout(() => {
            hole.occupied = false;
            hole.el.classList.remove('show');
        }, showDuration);
    }

    function scheduleNextSpawn() {
        if (!isPlaying) {
            return;
        }

        const baseDelay = lerp(SPAWN_INTERVAL_START, SPAWN_INTERVAL_END, elapsedFraction());
        const delay = Math.max(250, baseDelay + (Math.random() * 200 - 100));

        spawnTimeoutId = setTimeout(() => {
            spawnMole();
            scheduleNextSpawn();
        }, delay);
    }

    function triggerHoleImpact(hole) {
        if (hole.el.classList.contains('impact')) {
            return;
        }

        hole.el.classList.add('impact');
    }

    function handleHoleClick(hole) {
        if (!isPlaying || isGameOver) {
            return;
        }

        triggerHoleImpact(hole);

        if (!hole.occupied) {
            return;
        }

        clearTimeout(hole.hideTimeoutId);
        const type = hole.type;
        hole.occupied = false;
        hole.el.classList.remove('show');

        if (type === 'bomb') {
            score = Math.max(0, score - 2);
            sound.bomb();
            hole.el.classList.add('mole-hit-bomb');
        } else {
            score += type === 'golden' ? 3 : 1;
            sound.hit(type === 'golden');
            hole.el.classList.add(type === 'golden' ? 'mole-hit-golden' : 'mole-hit');
        }

        updateStats();

        setTimeout(() => {
            hole.el.classList.remove('mole-hit', 'mole-hit-golden', 'mole-hit-bomb');
        }, 400);
    }

    function startTimer() {
        clearInterval(timerIntervalId);
        timeLeft = GAME_DURATION_MS;
        updateTimerBar();

        timerIntervalId = setInterval(() => {
            if (!isPlaying) {
                clearInterval(timerIntervalId);
                return;
            }

            timeLeft -= 100;
            updateTimerBar();

            if (timeLeft <= 0) {
                clearInterval(timerIntervalId);
                endRound();
            }
        }, 100);
    }

    function endRound() {
        isPlaying = false;
        isGameOver = true;
        clearTimeout(spawnTimeoutId);
        clearInterval(timerIntervalId);
        resetHoles();
        sound.end();
        boardWrap.classList.remove('is-playing');
        hammerEl.classList.remove('active', 'swing');

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        updateStats();
        endGame(score);

        messageTextEl.textContent = `Hết giờ! Bạn đã đập được ${score} điểm!`;
        message.hidden = false;
    }

    function beginGame() {
        score = 0;
        isGameOver = false;
        isPlaying = true;
        resetHoles();
        updateStats();
        startTimer();
        scheduleNextSpawn();
        boardWrap.classList.add('is-playing');
    }

    startBtn.addEventListener('click', () => {
        startOverlay.hidden = true;
        beginGame();
    });

    restartBtn.addEventListener('click', () => {
        message.hidden = true;
        startOverlay.hidden = true;
        beginGame();
    });

    messageOkBtn.addEventListener('click', () => {
        message.hidden = true;
        startOverlay.hidden = false;
        score = 0;
        updateStats();
    });

    let touchHideTimeoutId = null;

    function positionHammer(event) {
        const rect = boardWrap.getBoundingClientRect();
        hammerEl.style.left = `${event.clientX - rect.left}px`;
        hammerEl.style.top = `${event.clientY - rect.top}px`;
    }

    function swingHammer() {
        if (hammerEl.classList.contains('swing')) {
            return;
        }

        hammerEl.classList.add('swing');
    }

    hammerEl.addEventListener('animationend', () => {
        hammerEl.classList.remove('swing');
    });

    boardWrap.addEventListener('pointermove', (event) => {
        if (!isPlaying) {
            return;
        }

        positionHammer(event);
        hammerEl.classList.add('active');
    });

    boardWrap.addEventListener('pointerdown', (event) => {
        if (!isPlaying) {
            return;
        }

        positionHammer(event);
        hammerEl.classList.add('active');
        swingHammer();

        if (event.pointerType !== 'mouse') {
            clearTimeout(touchHideTimeoutId);
            touchHideTimeoutId = setTimeout(() => hammerEl.classList.remove('active'), 260);
        }
    });

    boardWrap.addEventListener('pointerleave', () => {
        hammerEl.classList.remove('active');
    });

    updateStats();
    updateTimerBar();
}

const container = document.getElementById('game-container');

if (container) {
    initMoleGame(container);
}
