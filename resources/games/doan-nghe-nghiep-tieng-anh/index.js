import './style.css';
import { endGame, playTone } from '../../js/app.js';

const JOBS = [
    { en: 'doctor', vi: 'Bác sĩ', emoji: '🧑‍⚕️' },
    { en: 'teacher', vi: 'Giáo viên', emoji: '🧑‍🏫' },
    { en: 'farmer', vi: 'Nông dân', emoji: '🧑‍🌾' },
    { en: 'chef', vi: 'Đầu bếp', emoji: '🧑‍🍳' },
    { en: 'firefighter', vi: 'Lính cứu hỏa', emoji: '🧑‍🚒' },
    { en: 'pilot', vi: 'Phi công', emoji: '🧑‍✈️' },
    { en: 'astronaut', vi: 'Phi hành gia', emoji: '🧑‍🚀' },
    { en: 'scientist', vi: 'Nhà khoa học', emoji: '🧑‍🔬' },
    { en: 'artist', vi: 'Họa sĩ', emoji: '🧑‍🎨' },
    { en: 'singer', vi: 'Ca sĩ', emoji: '🧑‍🎤' },
    { en: 'police officer', vi: 'Cảnh sát', emoji: '👮' },
    { en: 'judge', vi: 'Thẩm phán', emoji: '🧑‍⚖️' },
    { en: 'mechanic', vi: 'Thợ sửa xe', emoji: '🧑‍🔧' },
    { en: 'construction worker', vi: 'Công nhân xây dựng', emoji: '👷' },
    { en: 'detective', vi: 'Thám tử', emoji: '🕵️' },
    { en: 'programmer', vi: 'Lập trình viên', emoji: '🧑‍💻' },
    { en: 'dancer', vi: 'Vũ công', emoji: '💃' },
    { en: 'office worker', vi: 'Nhân viên văn phòng', emoji: '🧑‍💼' },
    { en: 'guard', vi: 'Lính gác', emoji: '💂' },
    { en: 'writer', vi: 'Nhà văn', emoji: '✍️' },
    { en: 'photographer', vi: 'Nhiếp ảnh gia', emoji: '📷' },
    { en: 'soldier', vi: 'Bộ đội', emoji: '🪖' },
    { en: 'fisherman', vi: 'Ngư dân', emoji: '🎣' },
    { en: 'waiter', vi: 'Người phục vụ', emoji: '🍽️' },
    { en: 'swimmer', vi: 'Vận động viên bơi lội', emoji: '🏊' },
    { en: 'runner', vi: 'Vận động viên chạy bộ', emoji: '🏃' },
    { en: 'basketball player', vi: 'Vận động viên bóng rổ', emoji: '⛹️' },
    { en: 'weightlifter', vi: 'Vận động viên cử tạ', emoji: '🏋️' },
    { en: 'surfer', vi: 'Vận động viên lướt sóng', emoji: '🏄' },
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

function buildOptions(correctJob) {
    const distractors = shuffle(JOBS.filter((job) => job.en !== correctJob.en)).slice(0, OPTIONS_COUNT - 1);

    return shuffle([correctJob, ...distractors]);
}

function initJobQuizGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'jobQuizBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let roundWords = [];
    let roundIndex = 0;
    let score = 0;
    let lives = STARTING_LIVES;
    let answering = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'job-quiz-game';

    const stats = document.createElement('div');
    stats.className = 'job-quiz-stats';
    stats.innerHTML = `
        <div class="stat">Câu: <span data-role="round">0</span>/${TOTAL_ROUNDS}</div>
        <div class="stat">Đúng: <span data-role="score">0</span></div>
        <div class="stat" data-role="lives">❤️❤️❤️</div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'job-quiz-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const board = document.createElement('div');
    board.className = 'job-quiz-board';
    board.innerHTML = `
        <div class="job-quiz-prompt">Đây là nghề gì trong tiếng Anh?</div>
        <div class="job-quiz-picture-row">
            <div class="job-quiz-picture" data-role="picture"></div>
            <button type="button" class="job-quiz-speak" data-role="speak" aria-label="Nghe phát âm">🔊</button>
        </div>
        <div class="job-quiz-caption" data-role="caption">&nbsp;</div>
        <div class="job-quiz-options" data-role="options"></div>
    `;

    const endMessage = document.createElement('div');
    endMessage.className = 'job-quiz-end';
    endMessage.hidden = true;
    endMessage.innerHTML = `
        <div class="job-quiz-end-card">
            <div class="job-quiz-end-emoji" data-role="end-emoji">🎉</div>
            <div class="job-quiz-end-text" data-role="end-text"></div>
            <button type="button" class="job-quiz-end-ok">OK</button>
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
    const endOkButton = endMessage.querySelector('.job-quiz-end-ok');

    function updateStats() {
        roundEl.textContent = String(Math.min(roundIndex + 1, TOTAL_ROUNDS));
        scoreEl.textContent = String(score);
        livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(STARTING_LIVES - lives);
    }

    function currentJob() {
        return roundWords[roundIndex];
    }

    function renderRound() {
        answering = true;
        captionEl.innerHTML = '&nbsp;';
        pictureEl.textContent = currentJob().emoji;
        pictureEl.classList.remove('shake');

        const options = buildOptions(currentJob());
        optionsEl.innerHTML = '';

        options.forEach((job) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'job-quiz-option';
            button.textContent = capitalize(job.en);
            button.dataset.value = job.en;
            button.addEventListener('click', () => handleAnswer(button, job));
            optionsEl.appendChild(button);
        });

        updateStats();
    }

    function handleAnswer(button, job) {
        if (!answering) {
            return;
        }

        answering = false;
        const isCorrect = job.en === currentJob().en;
        const buttons = [...optionsEl.querySelectorAll('.job-quiz-option')];
        buttons.forEach((btn) => {
            btn.disabled = true;
            if (btn.dataset.value === currentJob().en) {
                btn.classList.add('correct');
            }
        });

        if (isCorrect) {
            sound.correct();
            score += 1;
            captionEl.textContent = `✅ ${capitalize(currentJob().en)} = ${currentJob().vi}`;
        } else {
            sound.wrong();
            button.classList.add('wrong');
            pictureEl.classList.add('shake');
            lives -= 1;
            captionEl.textContent = `❌ Đáp án đúng: ${capitalize(currentJob().en)} = ${currentJob().vi}`;
        }

        speak(currentJob().en);
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
        roundWords = shuffle(JOBS).slice(0, TOTAL_ROUNDS);
        roundIndex = 0;
        score = 0;
        lives = STARTING_LIVES;
        endMessage.hidden = true;
        renderRound();
    }

    speakButton.addEventListener('click', () => {
        sound.click();
        speak(currentJob().en);
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
    initJobQuizGame(container);
}
