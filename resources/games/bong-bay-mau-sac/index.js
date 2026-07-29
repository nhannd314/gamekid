import './style.css';
import { endGame, playTone } from '../../js/app.js';

const COLORS = [
    { name: 'Đỏ', hex: '#ff5252', key: 'red' },
    { name: 'Xanh dương', hex: '#448aff', key: 'blue' },
    { name: 'Xanh lá', hex: '#69f0ae', key: 'green' },
    { name: 'Vàng', hex: '#ffff00', key: 'yellow' },
    { name: 'Tím', hex: '#e040fb', key: 'purple' },
    { name: 'Cam', hex: '#ffab40', key: 'orange' },
];

const GAME_DURATION_MS = 45000;

function initColorPopGame(container) {
    const BEST_SCORE_KEY = 'colorPopBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let score = 0;
    let lives = 3;
    let timeLeft = GAME_DURATION_MS;
    let isGameOver = false;
    let gameActive = false;
    let balloons = [];
    let targetColor = null;
    let lastTime = 0;
    let spawnTimer = 0;
    let colorChangeTimer = 0;
    let gameSpeed = 1;
    let animationFrameId = null;

    const wrapper = document.createElement('div');
    wrapper.className = 'colorpop-game';

    const stats = document.createElement('div');
    stats.className = 'colorpop-game-stats';
    stats.innerHTML = `
        <div class="stat">Điểm: <span data-role="score">0</span></div>
        <div class="stat">❤️: <span data-role="lives">3</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'colorpop-game-canvas-wrap';

    const targetIndicator = document.createElement('div');
    targetIndicator.className = 'colorpop-target-indicator';
    targetIndicator.innerHTML = 'Hãy bấm bóng màu: <span class="target-name">...</span>';

    const timerWrap = document.createElement('div');
    timerWrap.className = 'colorpop-timer-wrap';
    const timerBar = document.createElement('div');
    timerBar.className = 'colorpop-timer-bar';
    timerWrap.appendChild(timerBar);

    const startOverlay = document.createElement('div');
    startOverlay.className = 'colorpop-game-start';
    startOverlay.innerHTML = `
        <h2>Bóng Bay Màu Sắc 🎈</h2>
        <p>Chỉ bấm vào những quả bóng có màu được yêu cầu nhé!</p>
        <button type="button" class="colorpop-game-start-btn">▶ Bắt đầu</button>
    `;

    const message = document.createElement('div');
    message.className = 'colorpop-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="colorpop-game-message-card">
            <div class="colorpop-game-message-emoji">🎈</div>
            <div class="colorpop-game-message-text" data-role="message-text"></div>
            <button type="button" class="colorpop-game-message-ok">Chơi lại</button>
        </div>
    `;

    wrapper.append(stats, targetIndicator, timerWrap, canvasWrap, startOverlay, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const scoreEl = stats.querySelector('[data-role="score"]');
    const livesEl = stats.querySelector('[data-role="lives"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const targetNameEl = targetIndicator.querySelector('.target-name');
    const startBtn = startOverlay.querySelector('.colorpop-game-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkBtn = message.querySelector('.colorpop-game-message-ok');

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

    function pickNewTargetColor() {
        const oldTarget = targetColor;
        do {
            targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        } while (oldTarget && targetColor.key === oldTarget.key);

        targetNameEl.textContent = targetColor.name;
        targetNameEl.style.color = targetColor.hex;

        targetIndicator.classList.add('pulse');
        setTimeout(() => targetIndicator.classList.remove('pulse'), 500);
    }

    function spawnBalloon() {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const balloon = {
            id: Date.now() + Math.random(),
            color: color,
            x: Math.random() * 80 + 10, // 10% to 90%
            y: 450,
            speed: (1 + Math.random() * 1) * gameSpeed,
            el: document.createElement('div'),
            isPopped: false,
        };

        balloon.el.className = 'balloon';
        balloon.el.style.left = `${balloon.x}%`;
        balloon.el.style.backgroundColor = color.hex;
        balloon.el.style.color = color.hex;
        balloon.el.style.boxShadow = `inset -10px -10px 20px rgba(0,0,0,0.2), 0 5px 15px ${color.hex}66`;

        const string = document.createElement('div');
        string.className = 'balloon-string';
        balloon.el.appendChild(string);

        balloon.el.addEventListener('mousedown', (e) => {
            e.preventDefault();
            popBalloon(balloon);
        });

        balloon.el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            popBalloon(balloon);
        });

        canvasWrap.appendChild(balloon.el);
        balloons.push(balloon);
    }

    function popBalloon(balloon) {
        if (balloon.isPopped || !gameActive) return;
        balloon.isPopped = true;

        if (balloon.color.key === targetColor.key) {
            score += 1;
            scoreEl.textContent = score;
            playTone(600 + Math.random() * 200, 0, 0.1, 'sine', 0.2);
            showPopEffect(balloon, '+1');
        } else {
            lives -= 1;
            livesEl.textContent = lives;
            playTone(150, 0, 0.3, 'sawtooth', 0.3);
            wrapper.classList.add('shake');
            setTimeout(() => wrapper.classList.remove('shake'), 500);
            showPopEffect(balloon, '❌', true);

            if (lives <= 0) {
                handleGameOver();
            }
        }

        balloon.el.classList.add('popping');
        setTimeout(() => {
            balloon.el.remove();
            balloons = balloons.filter((b) => b.id !== balloon.id);
        }, 200);
    }

    function showPopEffect(balloon, text, isWrong = false) {
        const pop = document.createElement('div');
        pop.className = 'score-pop';
        pop.textContent = text;
        if (isWrong) pop.style.color = '#ff5252';
        pop.style.left = `${balloon.x}%`;
        pop.style.top = `${balloon.y}px`;
        canvasWrap.appendChild(pop);
        setTimeout(() => pop.remove(), 800);
    }

    function update(time) {
        if (!gameActive) return;

        const deltaTime = time - lastTime;
        lastTime = time;

        timeLeft -= deltaTime;
        updateTimerBar();

        if (timeLeft <= 0) {
            timeLeft = 0;
            handleGameOver('Hết giờ rồi!');
            return;
        }

        spawnTimer += deltaTime;
        const spawnInterval = Math.max(300, 900 - score * 8);
        if (spawnTimer > spawnInterval) {
            spawnBalloon();
            spawnTimer = 0;
        }

        colorChangeTimer += deltaTime;
        const changeInterval = Math.max(3000, 8000 - score * 50);
        if (colorChangeTimer > changeInterval) {
            pickNewTargetColor();
            colorChangeTimer = 0;
        }

        gameSpeed = 1 + score * 0.003;

        for (let i = balloons.length - 1; i >= 0; i--) {
            const b = balloons[i];
            if (b.isPopped) continue;

            b.y -= b.speed;
            b.el.style.top = `${b.y}px`;

            const sway = Math.sin(time / 300 + b.id) * 10;
            b.el.style.transform = `translateX(${sway}px)`;

            if (b.y < -100) {
                b.el.remove();
                balloons.splice(i, 1);
            }
        }

        animationFrameId = requestAnimationFrame(update);
    }

    function handleGameOver(reason = '') {
        gameActive = false;
        isGameOver = true;
        cancelAnimationFrame(animationFrameId);
        playTone(100, 0, 0.5, 'square', 0.3);

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
            bestEl.textContent = bestScore;
        }

        const prefix = reason ? `${reason} ` : '';
        messageTextEl.textContent = `${prefix}Bạn đã làm nổ được ${score} quả bóng!`;
        message.hidden = false;
        endGame(score);
    }

    function startGame() {
        score = 0;
        lives = 3;
        timeLeft = GAME_DURATION_MS;
        isGameOver = false;
        gameActive = true;
        balloons.forEach((b) => b.el.remove());
        balloons = [];
        scoreEl.textContent = '0';
        livesEl.textContent = '3';
        lastTime = performance.now();
        spawnTimer = 0;
        colorChangeTimer = 0;
        gameSpeed = 1;
        startOverlay.hidden = true;
        message.hidden = true;
        updateTimerBar();
        pickNewTargetColor();
        animationFrameId = requestAnimationFrame(update);
    }

    startBtn.addEventListener('click', startGame);
    messageOkBtn.addEventListener('click', startGame);

    bestEl.textContent = String(bestScore);
}

const container = document.getElementById('game-container');
if (container) {
    initColorPopGame(container);
}
