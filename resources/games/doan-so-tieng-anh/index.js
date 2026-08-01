import './style.css';
import { endGame, playTone } from '../../js/app.js';

const EN_UNITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const EN_TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const VI_UNITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function englishNumber(value) {
    if (value === 100) {
        return 'one hundred';
    }

    if (value < 10) {
        return EN_UNITS[value];
    }

    if (value < 20) {
        return EN_TEENS[value - 10];
    }

    const tens = Math.floor(value / 10);
    const units = value % 10;

    return units === 0 ? EN_TENS[tens] : `${EN_TENS[tens]}-${EN_UNITS[units]}`;
}

function vietnameseNumber(value) {
    if (value === 100) {
        return 'một trăm';
    }

    if (value < 10) {
        return VI_UNITS[value];
    }

    const tens = Math.floor(value / 10);
    const units = value % 10;

    if (tens === 1) {
        if (units === 0) {
            return 'mười';
        }

        return units === 5 ? 'mười lăm' : `mười ${VI_UNITS[units]}`;
    }

    const base = `${VI_UNITS[tens]} mươi`;

    if (units === 0) {
        return base;
    }

    if (units === 1) {
        return `${base} mốt`;
    }

    if (units === 5) {
        return `${base} lăm`;
    }

    return `${base} ${VI_UNITS[units]}`;
}

const NUMBERS = Array.from({ length: 101 }, (_, value) => ({
    value,
    en: englishNumber(value),
    vi: vietnameseNumber(value),
}));

const TOTAL_ROUNDS = 15;
const STARTING_LIVES = 3;
const OPTIONS_COUNT = 4;
const NEARBY_RANGE = 10;
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

/**
 * Returns the classic "teen vs. ty" confusable partner for a number
 * (e.g. thirteen <-> thirty, twelve <-> twenty), or null if none applies.
 */
function confusablePartnerValue(value) {
    if (value === 12) {
        return 20;
    }

    if (value >= 13 && value <= 19) {
        return (value - 10) * 10;
    }

    if (value >= 20 && value <= 90 && value % 10 === 0) {
        return 10 + value / 10;
    }

    return null;
}

function buildOptions(correctNumber) {
    const chosenValues = new Set([correctNumber.value]);
    const options = [correctNumber];

    const partnerValue = confusablePartnerValue(correctNumber.value);
    if (partnerValue !== null) {
        chosenValues.add(partnerValue);
        options.push(NUMBERS[partnerValue]);
    }

    const nearbyPool = shuffle(
        NUMBERS.filter((n) => !chosenValues.has(n.value) && Math.abs(n.value - correctNumber.value) <= NEARBY_RANGE)
    );

    for (const candidate of nearbyPool) {
        if (options.length >= OPTIONS_COUNT) {
            break;
        }
        chosenValues.add(candidate.value);
        options.push(candidate);
    }

    if (options.length < OPTIONS_COUNT) {
        const randomPool = shuffle(NUMBERS.filter((n) => !chosenValues.has(n.value)));
        for (const candidate of randomPool) {
            if (options.length >= OPTIONS_COUNT) {
                break;
            }
            chosenValues.add(candidate.value);
            options.push(candidate);
        }
    }

    return shuffle(options);
}

function initNumberQuizGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'numberQuizBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let roundNumbers = [];
    let roundIndex = 0;
    let score = 0;
    let lives = STARTING_LIVES;
    let answering = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'number-quiz-game';

    const stats = document.createElement('div');
    stats.className = 'number-quiz-stats';
    stats.innerHTML = `
        <div class="stat">Câu: <span data-role="round">0</span>/${TOTAL_ROUNDS}</div>
        <div class="stat">Đúng: <span data-role="score">0</span></div>
        <div class="stat" data-role="lives">❤️❤️❤️</div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'number-quiz-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const board = document.createElement('div');
    board.className = 'number-quiz-board';
    board.innerHTML = `
        <div class="number-quiz-prompt">Số này đọc thế nào trong tiếng Anh?</div>
        <div class="number-quiz-picture-row">
            <div class="number-quiz-picture" data-role="picture"></div>
            <button type="button" class="number-quiz-speak" data-role="speak" aria-label="Nghe phát âm">🔊</button>
        </div>
        <div class="number-quiz-caption" data-role="caption">&nbsp;</div>
        <div class="number-quiz-options" data-role="options"></div>
    `;

    const endMessage = document.createElement('div');
    endMessage.className = 'number-quiz-end';
    endMessage.hidden = true;
    endMessage.innerHTML = `
        <div class="number-quiz-end-card">
            <div class="number-quiz-end-emoji" data-role="end-emoji">🎉</div>
            <div class="number-quiz-end-text" data-role="end-text"></div>
            <button type="button" class="number-quiz-end-ok">OK</button>
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
    const endOkButton = endMessage.querySelector('.number-quiz-end-ok');

    function updateStats() {
        roundEl.textContent = String(Math.min(roundIndex + 1, TOTAL_ROUNDS));
        scoreEl.textContent = String(score);
        livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(STARTING_LIVES - lives);
    }

    function currentNumber() {
        return roundNumbers[roundIndex];
    }

    function renderRound() {
        answering = true;
        captionEl.innerHTML = '&nbsp;';
        pictureEl.textContent = String(currentNumber().value);
        pictureEl.classList.remove('shake');

        const options = buildOptions(currentNumber());
        optionsEl.innerHTML = '';

        options.forEach((number) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'number-quiz-option';
            button.textContent = capitalize(number.en);
            button.dataset.value = String(number.value);
            button.addEventListener('click', () => handleAnswer(button, number));
            optionsEl.appendChild(button);
        });

        updateStats();
    }

    function handleAnswer(button, number) {
        if (!answering) {
            return;
        }

        answering = false;
        const isCorrect = number.value === currentNumber().value;
        const buttons = [...optionsEl.querySelectorAll('.number-quiz-option')];
        buttons.forEach((btn) => {
            btn.disabled = true;
            if (Number(btn.dataset.value) === currentNumber().value) {
                btn.classList.add('correct');
            }
        });

        if (isCorrect) {
            sound.correct();
            score += 1;
            captionEl.textContent = `✅ ${capitalize(currentNumber().en)} = ${currentNumber().vi}`;
        } else {
            sound.wrong();
            button.classList.add('wrong');
            pictureEl.classList.add('shake');
            lives -= 1;
            captionEl.textContent = `❌ Đáp án đúng: ${capitalize(currentNumber().en)} = ${currentNumber().vi}`;
        }

        speak(currentNumber().en);
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
        roundNumbers = shuffle(NUMBERS).slice(0, TOTAL_ROUNDS);
        roundIndex = 0;
        score = 0;
        lives = STARTING_LIVES;
        endMessage.hidden = true;
        renderRound();
    }

    speakButton.addEventListener('click', () => {
        sound.click();
        speak(currentNumber().en);
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
    initNumberQuizGame(container);
}
