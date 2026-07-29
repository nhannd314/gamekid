import './style.css';
import { endGame, playTone } from '../../js/app.js';

const FRUITS = ['🍎', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝'];
const BAD_STUFF = ['💣', '🧱', '🌵'];

function initFruitGame(container) {
    const BEST_SCORE_KEY = 'fruitCatcherBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let score = 0;
    let lives = 3;
    let isGameOver = false;
    let gameActive = false;
    let objects = [];
    let catcherPos = 50; // Phần trăm từ bên trái
    let lastTime = 0;
    let spawnTimer = 0;
    let gameSpeed = 1;
    let animationFrameId = null;

    const wrapper = document.createElement('div');
    wrapper.className = 'fruit-game';

    const stats = document.createElement('div');
    stats.className = 'fruit-game-stats';
    stats.innerHTML = `
        <div class="stat">Điểm: <span data-role="score">0</span></div>
        <div class="stat">❤️: <span data-role="lives">3</span></div>
        <div class="stat">Kỷ lục: <span data-role="best">${bestScore}</span></div>
    `;

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'fruit-game-canvas-wrap';

    const catcher = document.createElement('div');
    catcher.className = 'fruit-catcher';
    catcher.innerHTML = ''; // Đã thiết kế giỏ bằng CSS đẹp hơn
    canvasWrap.appendChild(catcher);

    const startOverlay = document.createElement('div');
    startOverlay.className = 'fruit-game-start';
    startOverlay.innerHTML = `
        <h2>Hứng Trái Cây 🍎</h2>
        <p>Di chuyển giỏ để hứng trái cây và tránh bom nhé!</p>
        <button type="button" class="fruit-game-start-btn">▶ Bắt đầu</button>
    `;

    const message = document.createElement('div');
    message.className = 'fruit-game-message';
    message.hidden = true;
    message.innerHTML = `
        <div class="fruit-game-message-card">
            <div class="fruit-game-message-emoji">🍎</div>
            <div class="fruit-game-message-text" data-role="message-text"></div>
            <button type="button" class="fruit-game-message-ok">Chơi lại</button>
        </div>
    `;

    wrapper.append(stats, canvasWrap, startOverlay, message);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const scoreEl = stats.querySelector('[data-role="score"]');
    const livesEl = stats.querySelector('[data-role="lives"]');
    const bestEl = stats.querySelector('[data-role="best"]');
    const startBtn = startOverlay.querySelector('.fruit-game-start-btn');
    const messageTextEl = message.querySelector('[data-role="message-text"]');
    const messageOkBtn = message.querySelector('.fruit-game-message-ok');

    // Cập nhật vị trí giỏ hứng
    function updateCatcherPos(clientX) {
        if (!gameActive) return;
        const rect = canvasWrap.getBoundingClientRect();
        let x = ((clientX - rect.left) / rect.width) * 100;
        x = Math.max(0, Math.min(100, x));
        catcherPos = x;
        catcher.style.left = `calc(${x}% - 45px)`;
    }

    canvasWrap.addEventListener('mousemove', (e) => updateCatcherPos(e.clientX));
    canvasWrap.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            updateCatcherPos(e.touches[0].clientX);
        }
    });

    function spawnObject() {
        const isBad = Math.random() < 0.25 + (score * 0.002); // Tăng tỉ lệ bom cơ bản và tốc độ tăng tỉ lệ bom
        const emoji = isBad
            ? BAD_STUFF[Math.floor(Math.random() * BAD_STUFF.length)]
            : FRUITS[Math.floor(Math.random() * FRUITS.length)];

        const obj = {
            id: Date.now() + Math.random(),
            emoji,
            isBad,
            x: Math.random() * 90 + 5, // 5% to 95%
            y: -50,
            speed: (1.5 + Math.random() * 2) * gameSpeed,
            el: document.createElement('div')
        };

        obj.el.className = 'falling-object';
        obj.el.textContent = emoji;
        obj.el.style.left = `${obj.x}%`;
        canvasWrap.appendChild(obj.el);
        objects.push(obj);
    }

    function showScorePop(x, y, text) {
        const pop = document.createElement('div');
        pop.className = 'score-pop';
        pop.textContent = text;
        pop.style.left = `${x}%`;
        pop.style.top = `${y}px`;
        canvasWrap.appendChild(pop);
        setTimeout(() => pop.remove(), 800);
    }

    function update(time) {
        if (!gameActive) return;

        const deltaTime = time - lastTime;
        lastTime = time;

        spawnTimer += deltaTime;
        const spawnInterval = Math.max(400, 1000 - (score * 5));
        if (spawnTimer > spawnInterval) {
            spawnObject();
            spawnTimer = 0;
        }

        // Tăng tốc độ game dần dần
        gameSpeed = 1 + (score * 0.005);

        const catcherRect = catcher.getBoundingClientRect();

        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            obj.y += obj.speed;
            obj.el.style.top = `${obj.y}px`;

            // Kiểm tra va chạm
            const objRect = obj.el.getBoundingClientRect();

            if (
                objRect.bottom >= catcherRect.top &&
                objRect.top <= catcherRect.bottom &&
                objRect.right >= catcherRect.left &&
                objRect.left <= catcherRect.right
            ) {
                // Va chạm xảy ra
                if (obj.isBad) {
                    lives -= 1;
                    livesEl.textContent = lives;
                    playTone(150, 0, 0.3, 'sawtooth', 0.3);
                    wrapper.classList.add('shake');
                    setTimeout(() => wrapper.classList.remove('shake'), 500);

                    if (lives <= 0) {
                        handleGameOver();
                    }
                } else {
                    score += 1;
                    scoreEl.textContent = score;
                    playTone(880, 0, 0.1, 'sine', 0.2);
                    showScorePop(obj.x, obj.y, '+1');
                }

                obj.el.remove();
                objects.splice(i, 1);
                continue;
            }

            // Thoát khỏi màn hình
            if (obj.y > 450) {
                if (!obj.isBad) {
                    // Hụt trái cây? Có thể trừ điểm hoặc mạng tùy ý.
                    // Ở đây chỉ đơn giản là mất điểm nếu muốn, nhưng cho trẻ em thì không nên quá khắt khe.
                }
                obj.el.remove();
                objects.splice(i, 1);
            }
        }

        animationFrameId = requestAnimationFrame(update);
    }

    function handleGameOver() {
        gameActive = false;
        isGameOver = true;
        cancelAnimationFrame(animationFrameId);
        playTone(100, 0, 0.5, 'square', 0.3);

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
            bestEl.textContent = bestScore;
        }

        messageTextEl.textContent = `Trò chơi kết thúc! Bạn đã hứng được ${score} trái cây!`;
        message.hidden = false;
        endGame(score);
    }

    function startGame() {
        score = 0;
        lives = 3;
        isGameOver = false;
        gameActive = true;
        objects.forEach(obj => obj.el.remove());
        objects = [];
        scoreEl.textContent = '0';
        livesEl.textContent = '3';
        lastTime = performance.now();
        spawnTimer = 0;
        gameSpeed = 1;
        startOverlay.hidden = true;
        message.hidden = true;
        animationFrameId = requestAnimationFrame(update);
    }

    startBtn.addEventListener('click', startGame);
    messageOkBtn.addEventListener('click', startGame);

    bestEl.textContent = String(bestScore);
}

const container = document.getElementById('game-container');
if (container) {
    initFruitGame(container);
}
