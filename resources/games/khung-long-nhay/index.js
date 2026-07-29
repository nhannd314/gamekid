import './style.css';
import { endGame, playTone } from '../../js/app.js';

const TICK_MS = 20;
const GRAVITY = 1.0;
const JUMP_STRENGTH = 15;
const OBSTACLE_CLEAR_HEIGHT = 55;
const GROUND_HEIGHT_PX = 36;

const DINO_LEFT_PX = 50;
const DINO_WIDTH_PX = 44;
const OBSTACLE_WIDTH_PX = 36;

const STARTING_SPEED = 5;
const MAX_SPEED = 13;
const SPEED_ACCEL_PER_TICK = 0.0018;

const MIN_GAP_PX = 220;
const MAX_GAP_PX = 400;

const OBSTACLE_EMOJIS = ['🌵', '🪨', '🦴'];

function createSoundEffects() {
    return {
        jump() {
            playTone(520, 0, 0.08, 'square', 0.25);
        },
        crash() {
            playTone(140, 0, 0.4, 'sawtooth', 0.3);
        },
        milestone() {
            playTone(880, 0, 0.1, 'sine', 0.25);
        },
    };
}

function initDinoGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'dinoJumpBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;

    let isRunning = false;
    let isGameOver = false;
    let loopId = null;

    let dinoY = 0;
    let dinoVelocity = 0;
    let isJumping = false;

    let speed = STARTING_SPEED;
    let distance = 0;
    let distanceSinceSpawn = 0;
    let nextGap = MIN_GAP_PX;
    let obstacles = [];
    let lastMilestone = 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'dino-game';

    const stats = document.createElement('div');
    stats.className = 'dino-game-stats';
    stats.innerHTML = `
        <div class="stat">Điểm: <span data-role="score">0</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const boardWrap = document.createElement('div');
    boardWrap.className = 'dino-game-board-wrap';

    const sky = document.createElement('div');
    sky.className = 'dino-sky';

    const ground = document.createElement('div');
    ground.className = 'dino-ground';

    const dino = document.createElement('div');
    dino.className = 'dino-character';
    dino.textContent = '🦖';

    const obstacleLayer = document.createElement('div');
    obstacleLayer.className = 'dino-obstacles';

    const jumpButton = document.createElement('button');
    jumpButton.type = 'button';
    jumpButton.className = 'dino-jump-btn';
    jumpButton.textContent = '▶ Bắt đầu';

    boardWrap.append(sky, ground, dino, obstacleLayer);

    const message = document.createElement('div');
    message.className = 'dino-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="dino-message-card">
            <div class="dino-message-emoji">💥</div>
            <div class="dino-message-text" data-role="message-text"></div>
            <button type="button" class="dino-message-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, boardWrap, jumpButton, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const scoreEl = stats.querySelector('[data-role="score"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkButton = message.querySelector('.dino-message-ok');

    function updateScoreDisplay() {
        const score = Math.floor(distance / 10);
        scoreEl.textContent = String(score);
        return score;
    }

    function jump() {
        if (!isRunning || isGameOver || isJumping) {
            return;
        }

        isJumping = true;
        dinoVelocity = JUMP_STRENGTH;
        sound.jump();
    }

    function spawnObstacle(stageWidth) {
        const emoji = OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)];
        const el = document.createElement('div');
        el.className = 'dino-obstacle';
        el.textContent = emoji;
        obstacleLayer.appendChild(el);
        obstacles.push({ el, x: stageWidth });
    }

    function tick() {
        const stageWidth = boardWrap.clientWidth;

        // Physics: dino jump arc.
        if (isJumping) {
            dinoVelocity -= GRAVITY;
            dinoY += dinoVelocity;

            if (dinoY <= 0) {
                dinoY = 0;
                dinoVelocity = 0;
                isJumping = false;
            }

            dino.style.bottom = `${GROUND_HEIGHT_PX + dinoY}px`;
        }

        // Move obstacles and check collisions.
        speed = Math.min(MAX_SPEED, speed + SPEED_ACCEL_PER_TICK);
        distance += speed;
        distanceSinceSpawn += speed;

        if (distanceSinceSpawn >= nextGap) {
            distanceSinceSpawn = 0;
            nextGap = MIN_GAP_PX + Math.random() * (MAX_GAP_PX - MIN_GAP_PX);
            spawnObstacle(stageWidth);
        }

        obstacles.forEach((obstacle) => {
            obstacle.x -= speed;
            obstacle.el.style.left = `${obstacle.x}px`;
        });

        const dinoRight = DINO_LEFT_PX + DINO_WIDTH_PX;
        for (const obstacle of obstacles) {
            const obstacleRight = obstacle.x + OBSTACLE_WIDTH_PX;
            const overlapsHorizontally = obstacle.x < dinoRight && obstacleRight > DINO_LEFT_PX;

            if (overlapsHorizontally && dinoY < OBSTACLE_CLEAR_HEIGHT) {
                handleCrash();
                return;
            }
        }

        obstacles = obstacles.filter((obstacle) => {
            if (obstacle.x + OBSTACLE_WIDTH_PX < 0) {
                obstacle.el.remove();
                return false;
            }
            return true;
        });

        const score = updateScoreDisplay();
        if (score > 0 && score % 10 === 0 && score !== lastMilestone) {
            lastMilestone = score;
            sound.milestone();
        }
    }

    function handleCrash() {
        isGameOver = true;
        isRunning = false;
        clearInterval(loopId);
        sound.crash();
        dino.classList.add('crashed');

        const score = Math.floor(distance / 10);

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        endGame(score);
        bestEl.textContent = String(bestScore);

        jumpButton.textContent = '🔄 Chơi lại';
        messageTextEl.textContent = `Va vào chướng ngại vật rồi! Điểm của bạn: ${score}`;
        message.hidden = false;
    }

    function beginGame() {
        isGameOver = false;
        isRunning = true;
        dinoY = 0;
        dinoVelocity = 0;
        isJumping = false;
        speed = STARTING_SPEED;
        distance = 0;
        distanceSinceSpawn = 0;
        nextGap = MIN_GAP_PX;
        lastMilestone = 0;

        obstacles.forEach((obstacle) => obstacle.el.remove());
        obstacles = [];

        dino.classList.remove('crashed');
        dino.style.bottom = `${GROUND_HEIGHT_PX}px`;
        updateScoreDisplay();

        jumpButton.textContent = '⬆ Nhảy';

        clearInterval(loopId);
        loopId = setInterval(tick, TICK_MS);
    }

    jumpButton.addEventListener('click', () => {
        if (isRunning) {
            jump();
            return;
        }

        beginGame();
    });

    function handleKeydown(event) {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            event.preventDefault();
            jump();
        }
    }

    document.addEventListener('keydown', handleKeydown);

    messageOkButton.addEventListener('click', () => {
        message.hidden = true;
        obstacles.forEach((obstacle) => obstacle.el.remove());
        obstacles = [];
        dino.classList.remove('crashed');
        dino.style.bottom = `${GROUND_HEIGHT_PX}px`;
        distance = 0;
        updateScoreDisplay();
    });

    updateScoreDisplay();
}

const container = document.getElementById('game-container');

if (container) {
    initDinoGame(container);
}
