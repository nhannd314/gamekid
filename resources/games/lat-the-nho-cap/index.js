import './style.css';
import { endGame, playTone } from '../../js/app.js';

const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝'];

function createSoundEffects() {
    return {
        flip() {
            playTone(780, 0, 0.08, 'triangle', 0.3);
        },
        match() {
            playTone(990, 0, 0.12, 'sine', 0.35);
            playTone(1320, 0.1, 0.15, 'sine', 0.35);
        },
        win() {
            [784.88, 988.88, 1175.99, 1569.75].forEach((frequency, index) => {
                playTone(frequency, index * 0.12, 0.18, 'triangle', 0.4);
            });
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

function createCards() {
    return shuffle([...EMOJIS, ...EMOJIS]).map((value, index) => ({ id: index, value }));
}

function initMemoryGame(container) {
    const sound = createSoundEffects();
    const totalPairs = EMOJIS.length;
    let cards = createCards();
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let moves = 0;
    let matchedPairs = 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'memory-game';

    const stats = document.createElement('div');
    stats.className = 'memory-game-stats';
    stats.innerHTML = `
        <div class="stat">Lượt lật: <span data-role="moves">0</span></div>
        <div class="stat">Cặp đúng: <span data-role="matches">0</span>/${totalPairs}</div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'memory-game-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const board = document.createElement('div');
    board.className = 'memory-game-board';

    const winMessage = document.createElement('div');
    winMessage.className = 'memory-game-win';
    winMessage.hidden = true;
    winMessage.innerHTML = `
        <div class="memory-game-win-card">
            <div class="memory-game-win-emoji">🎉</div>
            <div class="memory-game-win-text" data-role="win-text"></div>
            <button type="button" class="memory-game-win-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, board, winMessage);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const movesEl = stats.querySelector('[data-role="moves"]');
    const matchesEl = stats.querySelector('[data-role="matches"]');
    const winTextEl = winMessage.querySelector('[data-role="win-text"]');
    const winOkButton = winMessage.querySelector('.memory-game-win-ok');

    function updateStats() {
        movesEl.textContent = String(moves);
        matchesEl.textContent = String(matchedPairs);
    }

    function renderBoard() {
        board.innerHTML = '';
        cards.forEach((card) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'memory-card';
            button.dataset.id = String(card.id);
            button.dataset.value = card.value;
            button.setAttribute('aria-label', 'Thẻ úp');
            button.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-front">❓</div>
                    <div class="memory-card-back">${card.value}</div>
                </div>
            `;
            button.addEventListener('click', () => flipCard(button));
            board.appendChild(button);
        });
    }

    function resetSelection() {
        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }

    function flipCard(button) {
        if (lockBoard || button === firstCard || button.classList.contains('matched')) {
            return;
        }

        button.classList.add('flipped');
        sound.flip();

        if (!firstCard) {
            firstCard = button;
            return;
        }

        secondCard = button;
        lockBoard = true;
        moves += 1;
        updateStats();
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.value === secondCard.dataset.value;

        if (isMatch) {
            handleMatch();
        } else {
            setTimeout(handleMismatch, 800);
        }
    }

    function handleMatch() {
        sound.match();
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.disabled = true;
        secondCard.disabled = true;
        matchedPairs += 1;
        updateStats();
        resetSelection();

        if (matchedPairs === totalPairs) {
            showWinMessage();
        }
    }

    function handleMismatch() {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetSelection();
    }

    function showWinMessage() {
        sound.win();
        winTextEl.textContent = `Chúc mừng! Bạn đã hoàn thành sau ${moves} lượt lật.`;
        winMessage.hidden = false;
        endGame(moves);
    }

    function restart() {
        cards = createCards();
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        moves = 0;
        matchedPairs = 0;
        winMessage.hidden = true;
        updateStats();
        renderBoard();
    }

    restartButton.addEventListener('click', restart);
    winOkButton.addEventListener('click', () => {
        winMessage.hidden = true;
    });

    updateStats();
    renderBoard();
}

const container = document.getElementById('game-container');

if (container) {
    initMemoryGame(container);
}
