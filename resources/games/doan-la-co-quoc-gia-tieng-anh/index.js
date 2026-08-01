import './style.css';
import { endGame, playTone } from '../../js/app.js';

const flagModules = import.meta.glob('./flags/*.svg', { eager: true, import: 'default' });
const FLAG_URLS = Object.fromEntries(
    Object.entries(flagModules).map(([path, url]) => [path.replace('./flags/', '').replace('.svg', ''), url])
);

const COUNTRIES = [
    { en: 'Vietnam', vi: 'Việt Nam', code: 'vn' },
    { en: 'China', vi: 'Trung Quốc', code: 'cn' },
    { en: 'Japan', vi: 'Nhật Bản', code: 'jp' },
    { en: 'South Korea', vi: 'Hàn Quốc', code: 'kr' },
    { en: 'North Korea', vi: 'Triều Tiên', code: 'kp' },
    { en: 'Thailand', vi: 'Thái Lan', code: 'th' },
    { en: 'Laos', vi: 'Lào', code: 'la' },
    { en: 'Cambodia', vi: 'Campuchia', code: 'kh' },
    { en: 'Myanmar', vi: 'Myanmar', code: 'mm' },
    { en: 'Malaysia', vi: 'Malaysia', code: 'my' },
    { en: 'Singapore', vi: 'Singapore', code: 'sg' },
    { en: 'Indonesia', vi: 'Indonesia', code: 'id' },
    { en: 'Philippines', vi: 'Philippines', code: 'ph' },
    { en: 'India', vi: 'Ấn Độ', code: 'in' },
    { en: 'Pakistan', vi: 'Pakistan', code: 'pk' },
    { en: 'Bangladesh', vi: 'Bangladesh', code: 'bd' },
    { en: 'Sri Lanka', vi: 'Sri Lanka', code: 'lk' },
    { en: 'Nepal', vi: 'Nepal', code: 'np' },
    { en: 'Mongolia', vi: 'Mông Cổ', code: 'mn' },
    { en: 'Saudi Arabia', vi: 'Ả Rập Xê Út', code: 'sa' },
    { en: 'United Arab Emirates', vi: 'Các Tiểu Vương quốc Ả Rập Thống nhất', code: 'ae' },
    { en: 'Israel', vi: 'Israel', code: 'il' },
    { en: 'Turkey', vi: 'Thổ Nhĩ Kỳ', code: 'tr' },
    { en: 'Iran', vi: 'Iran', code: 'ir' },
    { en: 'Iraq', vi: 'Iraq', code: 'iq' },
    { en: 'Qatar', vi: 'Qatar', code: 'qa' },
    { en: 'United Kingdom', vi: 'Anh', code: 'gb' },
    { en: 'France', vi: 'Pháp', code: 'fr' },
    { en: 'Germany', vi: 'Đức', code: 'de' },
    { en: 'Italy', vi: 'Ý', code: 'it' },
    { en: 'Spain', vi: 'Tây Ban Nha', code: 'es' },
    { en: 'Portugal', vi: 'Bồ Đào Nha', code: 'pt' },
    { en: 'Netherlands', vi: 'Hà Lan', code: 'nl' },
    { en: 'Belgium', vi: 'Bỉ', code: 'be' },
    { en: 'Switzerland', vi: 'Thụy Sĩ', code: 'ch' },
    { en: 'Austria', vi: 'Áo', code: 'at' },
    { en: 'Sweden', vi: 'Thụy Điển', code: 'se' },
    { en: 'Norway', vi: 'Na Uy', code: 'no' },
    { en: 'Denmark', vi: 'Đan Mạch', code: 'dk' },
    { en: 'Finland', vi: 'Phần Lan', code: 'fi' },
    { en: 'Iceland', vi: 'Iceland', code: 'is' },
    { en: 'Ireland', vi: 'Ireland', code: 'ie' },
    { en: 'Poland', vi: 'Ba Lan', code: 'pl' },
    { en: 'Czech Republic', vi: 'Séc', code: 'cz' },
    { en: 'Greece', vi: 'Hy Lạp', code: 'gr' },
    { en: 'Russia', vi: 'Nga', code: 'ru' },
    { en: 'Ukraine', vi: 'Ukraine', code: 'ua' },
    { en: 'Hungary', vi: 'Hungary', code: 'hu' },
    { en: 'Romania', vi: 'Romania', code: 'ro' },
    { en: 'Croatia', vi: 'Croatia', code: 'hr' },
    { en: 'Serbia', vi: 'Serbia', code: 'rs' },
    { en: 'United States', vi: 'Mỹ', code: 'us' },
    { en: 'Canada', vi: 'Canada', code: 'ca' },
    { en: 'Mexico', vi: 'Mexico', code: 'mx' },
    { en: 'Cuba', vi: 'Cuba', code: 'cu' },
    { en: 'Jamaica', vi: 'Jamaica', code: 'jm' },
    { en: 'Brazil', vi: 'Brazil', code: 'br' },
    { en: 'Argentina', vi: 'Argentina', code: 'ar' },
    { en: 'Chile', vi: 'Chile', code: 'cl' },
    { en: 'Peru', vi: 'Peru', code: 'pe' },
    { en: 'Colombia', vi: 'Colombia', code: 'co' },
    { en: 'Venezuela', vi: 'Venezuela', code: 've' },
    { en: 'Egypt', vi: 'Ai Cập', code: 'eg' },
    { en: 'South Africa', vi: 'Nam Phi', code: 'za' },
    { en: 'Nigeria', vi: 'Nigeria', code: 'ng' },
    { en: 'Kenya', vi: 'Kenya', code: 'ke' },
    { en: 'Morocco', vi: 'Morocco', code: 'ma' },
    { en: 'Algeria', vi: 'Algeria', code: 'dz' },
    { en: 'Ethiopia', vi: 'Ethiopia', code: 'et' },
    { en: 'Australia', vi: 'Úc', code: 'au' },
    { en: 'New Zealand', vi: 'New Zealand', code: 'nz' },
    { en: 'Fiji', vi: 'Fiji', code: 'fj' },
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

function buildOptions(correctCountry) {
    const distractors = shuffle(COUNTRIES.filter((country) => country.en !== correctCountry.en)).slice(0, OPTIONS_COUNT - 1);

    return shuffle([correctCountry, ...distractors]);
}

function initFlagQuizGame(container) {
    const sound = createSoundEffects();
    const BEST_SCORE_KEY = 'flagQuizBestScore';
    let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    let roundWords = [];
    let roundIndex = 0;
    let score = 0;
    let lives = STARTING_LIVES;
    let answering = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'flag-quiz-game';

    const stats = document.createElement('div');
    stats.className = 'flag-quiz-stats';
    stats.innerHTML = `
        <div class="stat">Câu: <span data-role="round">0</span>/${TOTAL_ROUNDS}</div>
        <div class="stat">Đúng: <span data-role="score">0</span></div>
        <div class="stat" data-role="lives">❤️❤️❤️</div>
    `;

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = 'flag-quiz-restart';
    restartButton.textContent = 'Chơi lại';
    stats.appendChild(restartButton);

    const board = document.createElement('div');
    board.className = 'flag-quiz-board';
    board.innerHTML = `
        <div class="flag-quiz-prompt">Lá cờ này là quốc gia nào trong tiếng Anh?</div>
        <div class="flag-quiz-picture-row">
            <img class="flag-quiz-picture" data-role="picture" alt="Lá cờ" />
            <button type="button" class="flag-quiz-speak" data-role="speak" aria-label="Nghe phát âm">🔊</button>
        </div>
        <div class="flag-quiz-hint-row">
            <button type="button" class="flag-quiz-hint-btn" data-role="hint-btn">💡 Gợi ý tên nước</button>
            <div class="flag-quiz-hint-text" data-role="hint-text" hidden></div>
        </div>
        <div class="flag-quiz-caption" data-role="caption">&nbsp;</div>
        <div class="flag-quiz-options" data-role="options"></div>
    `;

    const endMessage = document.createElement('div');
    endMessage.className = 'flag-quiz-end';
    endMessage.hidden = true;
    endMessage.innerHTML = `
        <div class="flag-quiz-end-card">
            <div class="flag-quiz-end-emoji" data-role="end-emoji">🎉</div>
            <div class="flag-quiz-end-text" data-role="end-text"></div>
            <button type="button" class="flag-quiz-end-ok">OK</button>
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
    const hintButton = board.querySelector('[data-role="hint-btn"]');
    const hintTextEl = board.querySelector('[data-role="hint-text"]');
    const endTextEl = endMessage.querySelector('[data-role="end-text"]');
    const endEmojiEl = endMessage.querySelector('[data-role="end-emoji"]');
    const endOkButton = endMessage.querySelector('.flag-quiz-end-ok');

    function updateStats() {
        roundEl.textContent = String(Math.min(roundIndex + 1, TOTAL_ROUNDS));
        scoreEl.textContent = String(score);
        livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(STARTING_LIVES - lives);
    }

    function currentCountry() {
        return roundWords[roundIndex];
    }

    function renderRound() {
        answering = true;
        captionEl.innerHTML = '&nbsp;';
        pictureEl.src = FLAG_URLS[currentCountry().code];
        pictureEl.alt = `Lá cờ ${currentCountry().vi}`;
        pictureEl.classList.remove('shake');

        hintTextEl.hidden = true;
        hintTextEl.textContent = '';
        hintButton.hidden = false;
        hintButton.disabled = false;

        const options = buildOptions(currentCountry());
        optionsEl.innerHTML = '';

        options.forEach((country) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'flag-quiz-option';
            button.textContent = country.en;
            button.dataset.value = country.en;
            button.addEventListener('click', () => handleAnswer(button, country));
            optionsEl.appendChild(button);
        });

        updateStats();
    }

    function handleAnswer(button, country) {
        if (!answering) {
            return;
        }

        answering = false;
        const isCorrect = country.en === currentCountry().en;
        const buttons = [...optionsEl.querySelectorAll('.flag-quiz-option')];
        buttons.forEach((btn) => {
            btn.disabled = true;
            if (btn.dataset.value === currentCountry().en) {
                btn.classList.add('correct');
            }
        });

        hintButton.disabled = true;

        if (isCorrect) {
            sound.correct();
            score += 1;
            captionEl.textContent = `✅ ${currentCountry().en} = ${currentCountry().vi}`;
        } else {
            sound.wrong();
            button.classList.add('wrong');
            pictureEl.classList.add('shake');
            lives -= 1;
            captionEl.textContent = `❌ Đáp án đúng: ${currentCountry().en} = ${currentCountry().vi}`;
        }

        speak(currentCountry().en);
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
        roundWords = shuffle(COUNTRIES).slice(0, TOTAL_ROUNDS);
        roundIndex = 0;
        score = 0;
        lives = STARTING_LIVES;
        endMessage.hidden = true;
        renderRound();
    }

    speakButton.addEventListener('click', () => {
        sound.click();
        speak(currentCountry().en);
    });

    hintButton.addEventListener('click', () => {
        sound.click();
        hintTextEl.textContent = `Gợi ý: ${currentCountry().vi}`;
        hintTextEl.hidden = false;
        hintButton.disabled = true;
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
    initFlagQuizGame(container);
}
