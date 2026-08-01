import './style.css';
import { endGame, playTone } from '../../js/app.js';

const HOUSEHOLD_ITEMS = [
    { en: 'bed', vi: 'Giường', emoji: '🛏️' },
    { en: 'sofa', vi: 'Ghế sofa', emoji: '🛋️' },
    { en: 'chair', vi: 'Cái ghế', emoji: '🪑' },
    { en: 'mirror', vi: 'Gương', emoji: '🪞' },
    { en: 'window', vi: 'Cửa sổ', emoji: '🪟' },
    { en: 'door', vi: 'Cửa ra vào', emoji: '🚪' },
    { en: 'lamp', vi: 'Đèn', emoji: '💡' },
    { en: 'toilet', vi: 'Bồn cầu', emoji: '🚽' },
    { en: 'shower', vi: 'Vòi hoa sen', emoji: '🚿' },
    { en: 'bathtub', vi: 'Bồn tắm', emoji: '🛁' },
    { en: 'clock', vi: 'Đồng hồ', emoji: '🕰️' },
    { en: 'alarm clock', vi: 'Đồng hồ báo thức', emoji: '⏰' },
    { en: 'television', vi: 'Ti vi', emoji: '📺' },
    { en: 'telephone', vi: 'Điện thoại bàn', emoji: '☎️' },
    { en: 'candle', vi: 'Nến', emoji: '🕯️' },
    { en: 'key', vi: 'Chìa khóa', emoji: '🔑' },
    { en: 'lock', vi: 'Ổ khóa', emoji: '🔒' },
    { en: 'picture frame', vi: 'Khung ảnh', emoji: '🖼️' },
    { en: 'plant', vi: 'Cây cảnh', emoji: '🪴' },
    { en: 'hammer', vi: 'Cái búa', emoji: '🔨' },
    { en: 'wrench', vi: 'Cờ lê', emoji: '🔧' },
    { en: 'screwdriver', vi: 'Tuốc nơ vít', emoji: '🪛' },
    { en: 'saw', vi: 'Cái cưa', emoji: '🪚' },
    { en: 'axe', vi: 'Cái rìu', emoji: '🪓' },
    { en: 'toolbox', vi: 'Hộp dụng cụ', emoji: '🧰' },
    { en: 'ladder', vi: 'Cái thang', emoji: '🪜' },
    { en: 'nut and bolt', vi: 'Ốc vít', emoji: '🔩' },
    { en: 'flashlight', vi: 'Đèn pin', emoji: '🔦' },
    { en: 'ruler', vi: 'Thước kẻ', emoji: '📏' },
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

function buildOptions(correctItem) {
    const distractors = shuffle(HOUSEHOLD_ITEMS.filter((item) => item.en !== correctItem.en)).slice(0, OPTIONS_COUNT - 1);

    return shuffle([correctItem, ...distractors]);
}

function initHouseholdQuizGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'householdQuizBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let roundWords = [];
    let roundIndex = 0;
    let score = 0;
    let lives = STARTING_LIVES;
    let answering = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'household-quiz-game';

    const stats = document.createElement('div');
    stats.className = 'household-quiz-stats';
    stats.innerHTML = `
        <div class="stat">Câu: <span data-role="round">0</span>/${TOTAL_ROUNDS}</div>
        <div class="stat">Đúng: <span data-role="score">0</span></div>
        <div class="stat" data-role="lives">❤️❤️❤️</div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'household-quiz-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const board = document.createElement('div');
    board.className = 'household-quiz-board';
    board.innerHTML = `
        <div class="household-quiz-prompt">Đây là gì trong tiếng Anh?</div>
        <div class="household-quiz-picture-row">
            <div class="household-quiz-picture" data-role="picture"></div>
            <button type="button" class="household-quiz-speak" data-role="speak" aria-label="Nghe phát âm">🔊</button>
        </div>
        <div class="household-quiz-caption" data-role="caption">&nbsp;</div>
        <div class="household-quiz-options" data-role="options"></div>
    `;

    const endMessage = document.createElement('div');
    endMessage.className = 'household-quiz-end';
    endMessage.hidden = true;
    endMessage.innerHTML = `
        <div class="household-quiz-end-card">
            <div class="household-quiz-end-emoji" data-role="end-emoji">🎉</div>
            <div class="household-quiz-end-text" data-role="end-text"></div>
            <button type="button" class="household-quiz-end-ok">OK</button>
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
    const endOkButton = endMessage.querySelector('.household-quiz-end-ok');

    function updateStats() {
        roundEl.textContent = String(Math.min(roundIndex + 1, TOTAL_ROUNDS));
        scoreEl.textContent = String(score);
        livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(STARTING_LIVES - lives);
    }

    function currentItem() {
        return roundWords[roundIndex];
    }

    function renderRound() {
        answering = true;
        captionEl.innerHTML = '&nbsp;';
        pictureEl.textContent = currentItem().emoji;
        pictureEl.classList.remove('shake');

        const options = buildOptions(currentItem());
        optionsEl.innerHTML = '';

        options.forEach((item) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'household-quiz-option';
            button.textContent = capitalize(item.en);
            button.dataset.value = item.en;
            button.addEventListener('click', () => handleAnswer(button, item));
            optionsEl.appendChild(button);
        });

        updateStats();
    }

    function handleAnswer(button, item) {
        if (!answering) {
            return;
        }

        answering = false;
        const isCorrect = item.en === currentItem().en;
        const buttons = [...optionsEl.querySelectorAll('.household-quiz-option')];
        buttons.forEach((btn) => {
            btn.disabled = true;
            if (btn.dataset.value === currentItem().en) {
                btn.classList.add('correct');
            }
        });

        if (isCorrect) {
            sound.correct();
            score += 1;
            captionEl.textContent = `✅ ${capitalize(currentItem().en)} = ${currentItem().vi}`;
        } else {
            sound.wrong();
            button.classList.add('wrong');
            pictureEl.classList.add('shake');
            lives -= 1;
            captionEl.textContent = `❌ Đáp án đúng: ${capitalize(currentItem().en)} = ${currentItem().vi}`;
        }

        speak(currentItem().en);
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
        roundWords = shuffle(HOUSEHOLD_ITEMS).slice(0, TOTAL_ROUNDS);
        roundIndex = 0;
        score = 0;
        lives = STARTING_LIVES;
        endMessage.hidden = true;
        renderRound();
    }

    speakButton.addEventListener('click', () => {
        sound.click();
        speak(currentItem().en);
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
    initHouseholdQuizGame(container);
}
