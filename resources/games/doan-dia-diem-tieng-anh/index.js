import './style.css';
import { endGame, playTone } from '../../js/app.js';

const PLACES = [
    { en: 'globe', vi: 'Quả địa cầu', emoji: '🌐' },
    { en: 'compass', vi: 'La bàn', emoji: '🧭' },
    { en: 'mountain', vi: 'Núi', emoji: '⛰️' },
    { en: 'volcano', vi: 'Núi lửa', emoji: '🌋' },
    { en: 'beach', vi: 'Bãi biển', emoji: '🏖️' },
    { en: 'desert', vi: 'Sa mạc', emoji: '🏜️' },
    { en: 'national park', vi: 'Vườn quốc gia', emoji: '🏞️' },
    { en: 'wall', vi: 'Bức tường', emoji: '🧱' },
    { en: 'wood', vi: 'Khúc gỗ', emoji: '🪵' },
    { en: 'hut', vi: 'Túp lều', emoji: '🛖' },
    { en: 'house', vi: 'Ngôi nhà', emoji: '🏠' },
    { en: 'building', vi: 'Tòa nhà', emoji: '🏢' },
    { en: 'post office', vi: 'Bưu điện', emoji: '🏤' },
    { en: 'hospital', vi: 'Bệnh viện', emoji: '🏥' },
    { en: 'bank', vi: 'Ngân hàng', emoji: '🏦' },
    { en: 'hotel', vi: 'Khách sạn', emoji: '🏨' },
    { en: 'school', vi: 'Trường học', emoji: '🏫' },
    { en: 'factory', vi: 'Nhà máy', emoji: '🏭' },
    { en: 'castle', vi: 'Lâu đài', emoji: '🏰' },
    { en: 'tower', vi: 'Tòa tháp', emoji: '🗼' },
    { en: 'church', vi: 'Nhà thờ', emoji: '⛪' },
    { en: 'tent', vi: 'Lều trại', emoji: '⛺' },
    { en: 'island', vi: 'Hòn đảo', emoji: '🏝️' },
    { en: 'bridge', vi: 'Cây cầu', emoji: '🌉' },
    { en: 'stadium', vi: 'Sân vận động', emoji: '🏟️' },
    { en: 'fountain', vi: 'Đài phun nước', emoji: '⛲' },
    { en: 'amusement park', vi: 'Công viên giải trí', emoji: '🎢' },
    { en: 'department store', vi: 'Trung tâm thương mại', emoji: '🏬' },
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

function buildOptions(correctPlace) {
    const distractors = shuffle(PLACES.filter((place) => place.en !== correctPlace.en)).slice(0, OPTIONS_COUNT - 1);

    return shuffle([correctPlace, ...distractors]);
}

function initPlaceQuizGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'placeQuizBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let roundWords = [];
    let roundIndex = 0;
    let score = 0;
    let lives = STARTING_LIVES;
    let answering = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'place-quiz-game';

    const stats = document.createElement('div');
    stats.className = 'place-quiz-stats';
    stats.innerHTML = `
        <div class="stat">Câu: <span data-role="round">0</span>/${TOTAL_ROUNDS}</div>
        <div class="stat">Đúng: <span data-role="score">0</span></div>
        <div class="stat" data-role="lives">❤️❤️❤️</div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'place-quiz-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const board = document.createElement('div');
    board.className = 'place-quiz-board';
    board.innerHTML = `
        <div class="place-quiz-prompt">Đây là gì trong tiếng Anh?</div>
        <div class="place-quiz-picture-row">
            <div class="place-quiz-picture" data-role="picture"></div>
            <button type="button" class="place-quiz-speak" data-role="speak" aria-label="Nghe phát âm">🔊</button>
        </div>
        <div class="place-quiz-caption" data-role="caption">&nbsp;</div>
        <div class="place-quiz-options" data-role="options"></div>
    `;

    const endMessage = document.createElement('div');
    endMessage.className = 'place-quiz-end';
    endMessage.hidden = true;
    endMessage.innerHTML = `
        <div class="place-quiz-end-card">
            <div class="place-quiz-end-emoji" data-role="end-emoji">🎉</div>
            <div class="place-quiz-end-text" data-role="end-text"></div>
            <button type="button" class="place-quiz-end-ok">OK</button>
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
    const endOkButton = endMessage.querySelector('.place-quiz-end-ok');

    function updateStats() {
        roundEl.textContent = String(Math.min(roundIndex + 1, TOTAL_ROUNDS));
        scoreEl.textContent = String(score);
        livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(STARTING_LIVES - lives);
    }

    function currentPlace() {
        return roundWords[roundIndex];
    }

    function renderRound() {
        answering = true;
        captionEl.innerHTML = '&nbsp;';
        pictureEl.textContent = currentPlace().emoji;
        pictureEl.classList.remove('shake');

        const options = buildOptions(currentPlace());
        optionsEl.innerHTML = '';

        options.forEach((place) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'place-quiz-option';
            button.textContent = capitalize(place.en);
            button.dataset.value = place.en;
            button.addEventListener('click', () => handleAnswer(button, place));
            optionsEl.appendChild(button);
        });

        updateStats();
    }

    function handleAnswer(button, place) {
        if (!answering) {
            return;
        }

        answering = false;
        const isCorrect = place.en === currentPlace().en;
        const buttons = [...optionsEl.querySelectorAll('.place-quiz-option')];
        buttons.forEach((btn) => {
            btn.disabled = true;
            if (btn.dataset.value === currentPlace().en) {
                btn.classList.add('correct');
            }
        });

        if (isCorrect) {
            sound.correct();
            score += 1;
            captionEl.textContent = `✅ ${capitalize(currentPlace().en)} = ${currentPlace().vi}`;
        } else {
            sound.wrong();
            button.classList.add('wrong');
            pictureEl.classList.add('shake');
            lives -= 1;
            captionEl.textContent = `❌ Đáp án đúng: ${capitalize(currentPlace().en)} = ${currentPlace().vi}`;
        }

        speak(currentPlace().en);
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
        roundWords = shuffle(PLACES).slice(0, TOTAL_ROUNDS);
        roundIndex = 0;
        score = 0;
        lives = STARTING_LIVES;
        endMessage.hidden = true;
        renderRound();
    }

    speakButton.addEventListener('click', () => {
        sound.click();
        speak(currentPlace().en);
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
    initPlaceQuizGame(container);
}
