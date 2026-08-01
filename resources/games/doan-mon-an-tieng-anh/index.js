import './style.css';
import { endGame, playTone } from '../../js/app.js';

const FOODS = [
    { en: 'bread', vi: 'Bánh mì', emoji: '🍞' },
    { en: 'cheese', vi: 'Phô mai', emoji: '🧀' },
    { en: 'meat', vi: 'Thịt', emoji: '🍖' },
    { en: 'hamburger', vi: 'Bánh hamburger', emoji: '🍔' },
    { en: 'chips', vi: 'Khoai tây chiên', emoji: '🍟' },
    { en: 'pizza', vi: 'Bánh pizza', emoji: '🍕' },
    { en: 'hot dog', vi: 'Xúc xích kẹp bánh mì', emoji: '🌭' },
    { en: 'sandwich', vi: 'Bánh sandwich', emoji: '🥪' },
    { en: 'egg', vi: 'Trứng', emoji: '🥚' },
    { en: 'popcorn', vi: 'Bỏng ngô', emoji: '🍿' },
    { en: 'cake', vi: 'Bánh ngọt', emoji: '🍰' },
    { en: 'ice cream', vi: 'Kem', emoji: '🍦' },
    { en: 'cookie', vi: 'Bánh quy', emoji: '🍪' },
    { en: 'birthday cake', vi: 'Bánh sinh nhật', emoji: '🎂' },
    { en: 'shortcake', vi: 'Bánh bông lan dâu', emoji: '🍰🍓' },
    { en: 'cupcake', vi: 'Bánh cupcake', emoji: '🧁' },
    { en: 'chocolate', vi: 'Sô cô la', emoji: '🍫' },
    { en: 'candy', vi: 'Kẹo', emoji: '🍬' },
    { en: 'custard', vi: 'Bánh custard', emoji: '🍮' },
];

const TOTAL_ROUNDS = 15;
const STARTING_LIVES = 3;
const OPTIONS_COUNT = 4;
const NEXT_ROUND_DELAY_MS = 1400;

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
        win() {
            [784.88, 988.88, 1175.99, 1569.75].forEach((frequency, index) => {
                playTone(frequency, index * 0.12, 0.18, 'triangle', 0.4);
            });
        },
    };
}

function speak(text) {
    if (!('speechSynthesis' in window)) {
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
}

function shuffle(items) {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function buildOptions(correctFood) {
    const distractors = shuffle(FOODS.filter((food) => food.en !== correctFood.en)).slice(0, OPTIONS_COUNT - 1);

    return shuffle([correctFood, ...distractors]);
}

function initFoodQuizGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'foodQuizBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let roundWords = [];
    let roundIndex = 0;
    let score = 0;
    let lives = STARTING_LIVES;
    let answering = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'food-quiz-game';

    const stats = document.createElement('div');
    stats.className = 'food-quiz-stats';
    stats.innerHTML = `
        <div class="stat">Câu: <span data-role="round">0</span>/${TOTAL_ROUNDS}</div>
        <div class="stat">Đúng: <span data-role="score">0</span></div>
        <div class="stat" data-role="lives">❤️❤️❤️</div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'food-quiz-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const board = document.createElement('div');
    board.className = 'food-quiz-board';
    board.innerHTML = `
        <div class="food-quiz-prompt">Đây là gì trong tiếng Anh?</div>
        <div class="food-quiz-picture-row">
            <div class="food-quiz-picture" data-role="picture"></div>
            <button type="button" class="food-quiz-speak" data-role="speak" aria-label="Nghe phát âm">🔊</button>
        </div>
        <div class="food-quiz-caption" data-role="caption">&nbsp;</div>
        <div class="food-quiz-options" data-role="options"></div>
    `;

    const endMessage = document.createElement('div');
    endMessage.className = 'food-quiz-end';
    endMessage.hidden = true;
    endMessage.innerHTML = `
        <div class="food-quiz-end-card">
            <div class="food-quiz-end-emoji" data-role="end-emoji">🎉</div>
            <div class="food-quiz-end-text" data-role="end-text"></div>
            <button type="button" class="food-quiz-end-ok">OK</button>
        </div>
    `;

    wrapper.append(stats, board, endMessage);
    container.innerHTML = '';
    container.appendChild(wrapper);

    const roundEl = stats.querySelector('[data-role="round"]');
    const scoreEl = stats.querySelector('[data-role="score"]');
    const livesEl = stats.querySelector('[data-role="lives"]');
    const pictureEl = board.querySelector('[data-role="picture"]');
    const captionEl = board.querySelector('[data-role="caption"]');
    const optionsEl = board.querySelector('[data-role="options"]');
    const speakButton = board.querySelector('[data-role="speak"]');
    const endTextEl = endMessage.querySelector('[data-role="end-text"]');
    const endEmojiEl = endMessage.querySelector('[data-role="end-emoji"]');
    const endOkButton = endMessage.querySelector('.food-quiz-end-ok');

    function updateStats() {
        roundEl.textContent = String(Math.min(roundIndex + 1, TOTAL_ROUNDS));
        scoreEl.textContent = String(score);
        livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(STARTING_LIVES - lives);
    }

    function currentFood() {
        return roundWords[roundIndex];
    }

    function renderRound() {
        answering = true;
        captionEl.innerHTML = '&nbsp;';
        pictureEl.textContent = currentFood().emoji;
        pictureEl.classList.remove('shake');

        const options = buildOptions(currentFood());
        optionsEl.innerHTML = '';

        options.forEach((food) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'food-quiz-option';
            button.textContent = capitalize(food.en);
            button.dataset.value = food.en;
            button.addEventListener('click', () => handleAnswer(button, food));
            optionsEl.appendChild(button);
        });

        updateStats();
    }

    function handleAnswer(button, food) {
        if (!answering) {
            return;
        }

        answering = false;
        const isCorrect = food.en === currentFood().en;
        const buttons = [...optionsEl.querySelectorAll('.food-quiz-option')];
        buttons.forEach((btn) => {
            btn.disabled = true;
            if (btn.dataset.value === currentFood().en) {
                btn.classList.add('correct');
            }
        });

        if (isCorrect) {
            sound.correct();
            score += 1;
            captionEl.textContent = `✅ ${capitalize(currentFood().en)} = ${currentFood().vi}`;
        } else {
            sound.wrong();
            button.classList.add('wrong');
            pictureEl.classList.add('shake');
            lives -= 1;
            captionEl.textContent = `❌ Đáp án đúng: ${capitalize(currentFood().en)} = ${currentFood().vi}`;
        }

        speak(currentFood().en);
        updateStats();

        setTimeout(() => {
            if (lives <= 0) {
                finishGame();
                return;
            }

            roundIndex += 1;

            if (roundIndex >= TOTAL_ROUNDS) {
                finishGame();
                return;
            }

            renderRound();
        }, NEXT_ROUND_DELAY_MS);
    }

    function finishGame() {
        const playedRounds = Math.min(roundIndex + 1, TOTAL_ROUNDS);
        const won = lives > 0;

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
        }

        endGame(score);

        endEmojiEl.textContent = won ? '🎉' : '😅';
        endTextEl.textContent = won
            ? `Hoàn thành! Bạn trả lời đúng ${score}/${playedRounds} câu. Kỷ lục: ${bestScore}.`
            : `Hết lượt chơi! Bạn trả lời đúng ${score} câu trước khi hết tim. Kỷ lục: ${bestScore}.`;
        endMessage.hidden = false;
    }

    function startGame() {
        roundWords = shuffle(FOODS).slice(0, TOTAL_ROUNDS);
        roundIndex = 0;
        score = 0;
        lives = STARTING_LIVES;
        endMessage.hidden = true;
        renderRound();
    }

    speakButton.addEventListener('click', () => {
        sound.click();
        speak(currentFood().en);
    });

    restartButton.addEventListener('click', startGame);
    endOkButton.addEventListener('click', () => {
        endMessage.hidden = true;
        startGame();
    });

    if (!('speechSynthesis' in window)) {
        speakButton.hidden = true;
    }

    startGame();
}

const container = document.getElementById('game-container');

if (container) {
    initFoodQuizGame(container);
}
