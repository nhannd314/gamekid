import './style.css';
import { endGame, playTone } from '../../js/app.js';

const BODY_PARTS = [
    { en: 'eye', vi: 'Mắt', emoji: '👁️' },
    { en: 'ear', vi: 'Tai', emoji: '👂' },
    { en: 'nose', vi: 'Mũi', emoji: '👃' },
    { en: 'mouth', vi: 'Miệng', emoji: '👄' },
    { en: 'tooth', vi: 'Răng', emoji: '🦷' },
    { en: 'tongue', vi: 'Lưỡi', emoji: '👅' },
    { en: 'hand', vi: 'Bàn tay', emoji: '✋' },
    { en: 'arm', vi: 'Cánh tay', emoji: '💪' },
    { en: 'leg', vi: 'Chân', emoji: '🦵' },
    { en: 'foot', vi: 'Bàn chân', emoji: '🦶' },
    { en: 'hair', vi: 'Tóc', emoji: '🦱' },
    { en: 'face', vi: 'Khuôn mặt', emoji: '🙂' },
    { en: 'brain', vi: 'Não', emoji: '🧠' },
    { en: 'heart', vi: 'Tim', emoji: '🫀' },
    { en: 'lungs', vi: 'Phổi', emoji: '🫁' },
    { en: 'bone', vi: 'Xương', emoji: '🦴' },
    { en: 'skull', vi: 'Hộp sọ', emoji: '💀' },
    { en: 'nail', vi: 'Móng tay', emoji: '💅' },
    // Không có emoji riêng — minh họa bằng cách khoanh vùng trên hình người.
    { en: 'forehead', vi: 'Trán', diagram: { x: 100, y: 32 } },
    { en: 'chin', vi: 'Cằm', diagram: { x: 100, y: 80 } },
    { en: 'neck', vi: 'Cổ', diagram: { x: 100, y: 90 } },
    { en: 'shoulder', vi: 'Vai', diagram: { x: 163, y: 100 } },
    { en: 'chest', vi: 'Ngực', diagram: { x: 100, y: 130 } },
    { en: 'stomach', vi: 'Bụng', diagram: { x: 100, y: 190 } },
    { en: 'hip', vi: 'Hông', diagram: { x: 100, y: 222 } },
    { en: 'elbow', vi: 'Khuỷu tay', diagram: { x: 167, y: 152 } },
    { en: 'wrist', vi: 'Cổ tay', diagram: { x: 167, y: 205 } },
    { en: 'knee', vi: 'Đầu gối', diagram: { x: 120, y: 285 } },
    { en: 'ankle', vi: 'Mắt cá chân', diagram: { x: 120, y: 345 } },
];

function bodyFigureMarkup(markerX, markerY) {
    return `
        <svg viewBox="0 0 200 400" class="body-parts-quiz-figure" role="img" aria-label="Hình người minh họa vị trí bộ phận">
            <ellipse cx="100" cy="385" rx="60" ry="10" class="figure-shadow" />
            <rect x="20" y="95" width="26" height="115" rx="13" class="figure-limb" />
            <rect x="154" y="95" width="26" height="115" rx="13" class="figure-limb" />
            <rect x="65" y="215" width="30" height="140" rx="15" class="figure-limb" />
            <rect x="105" y="215" width="30" height="140" rx="15" class="figure-limb" />
            <ellipse cx="80" cy="365" rx="20" ry="12" class="figure-limb" />
            <ellipse cx="120" cy="365" rx="20" ry="12" class="figure-limb" />
            <circle cx="33" cy="215" r="15" class="figure-limb" />
            <circle cx="167" cy="215" r="15" class="figure-limb" />
            <rect x="55" y="92" width="90" height="140" rx="30" class="figure-body" />
            <circle cx="100" cy="50" r="38" class="figure-body" />
            <circle cx="${markerX}" cy="${markerY}" r="14" class="figure-marker-pulse" />
            <circle cx="${markerX}" cy="${markerY}" r="10" class="figure-marker" />
        </svg>
    `;
}

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

function buildOptions(correctPart) {
    const distractors = shuffle(BODY_PARTS.filter((part) => part.en !== correctPart.en)).slice(0, OPTIONS_COUNT - 1);

    return shuffle([correctPart, ...distractors]);
}

function initBodyPartsQuizGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'bodyPartsQuizBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let roundWords = [];
    let roundIndex = 0;
    let score = 0;
    let lives = STARTING_LIVES;
    let answering = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'body-parts-quiz-game';

    const stats = document.createElement('div');
    stats.className = 'body-parts-quiz-stats';
    stats.innerHTML = `
        <div class="stat">Câu: <span data-role="round">0</span>/${TOTAL_ROUNDS}</div>
        <div class="stat">Đúng: <span data-role="score">0</span></div>
        <div class="stat" data-role="lives">❤️❤️❤️</div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'body-parts-quiz-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const board = document.createElement('div');
    board.className = 'body-parts-quiz-board';
    board.innerHTML = `
        <div class="body-parts-quiz-prompt">Đây là gì trong tiếng Anh?</div>
        <div class="body-parts-quiz-picture-row">
            <div class="body-parts-quiz-picture" data-role="picture"></div>
            <button type="button" class="body-parts-quiz-speak" data-role="speak" aria-label="Nghe phát âm">🔊</button>
        </div>
        <div class="body-parts-quiz-caption" data-role="caption">&nbsp;</div>
        <div class="body-parts-quiz-options" data-role="options"></div>
    `;

    const endMessage = document.createElement('div');
    endMessage.className = 'body-parts-quiz-end';
    endMessage.hidden = true;
    endMessage.innerHTML = `
        <div class="body-parts-quiz-end-card">
            <div class="body-parts-quiz-end-emoji" data-role="end-emoji">🎉</div>
            <div class="body-parts-quiz-end-text" data-role="end-text"></div>
            <button type="button" class="body-parts-quiz-end-ok">OK</button>
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
    const endOkButton = endMessage.querySelector('.body-parts-quiz-end-ok');

    function updateStats() {
        roundEl.textContent = String(Math.min(roundIndex + 1, TOTAL_ROUNDS));
        scoreEl.textContent = String(score);
        livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(STARTING_LIVES - lives);
    }

    function currentPart() {
        return roundWords[roundIndex];
    }

    function renderPicture(part) {
        pictureEl.classList.remove('shake');

        if (part.diagram) {
            pictureEl.classList.add('is-diagram');
            pictureEl.innerHTML = bodyFigureMarkup(part.diagram.x, part.diagram.y);
        } else {
            pictureEl.classList.remove('is-diagram');
            pictureEl.textContent = part.emoji;
        }
    }

    function renderRound() {
        answering = true;
        captionEl.innerHTML = '&nbsp;';
        renderPicture(currentPart());

        const options = buildOptions(currentPart());
        optionsEl.innerHTML = '';

        options.forEach((part) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'body-parts-quiz-option';
            button.textContent = capitalize(part.en);
            button.dataset.value = part.en;
            button.addEventListener('click', () => handleAnswer(button, part));
            optionsEl.appendChild(button);
        });

        updateStats();
    }

    function handleAnswer(button, part) {
        if (!answering) {
            return;
        }

        answering = false;
        const isCorrect = part.en === currentPart().en;
        const buttons = [...optionsEl.querySelectorAll('.body-parts-quiz-option')];
        buttons.forEach((btn) => {
            btn.disabled = true;
            if (btn.dataset.value === currentPart().en) {
                btn.classList.add('correct');
            }
        });

        if (isCorrect) {
            sound.correct();
            score += 1;
            captionEl.textContent = `✅ ${capitalize(currentPart().en)} = ${currentPart().vi}`;
        } else {
            sound.wrong();
            button.classList.add('wrong');
            pictureEl.classList.add('shake');
            lives -= 1;
            captionEl.textContent = `❌ Đáp án đúng: ${capitalize(currentPart().en)} = ${currentPart().vi}`;
        }

        speak(currentPart().en);
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
        roundWords = shuffle(BODY_PARTS).slice(0, TOTAL_ROUNDS);
        roundIndex = 0;
        score = 0;
        lives = STARTING_LIVES;
        endMessage.hidden = true;
        renderRound();
    }

    speakButton.addEventListener('click', () => {
        sound.click();
        speak(currentPart().en);
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
    initBodyPartsQuizGame(container);
}
