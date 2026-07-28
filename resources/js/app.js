import 'bootstrap';

const VOLUME_BOOST = 1.5;

let audioContext = null;

export function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    return audioContext;
}

export function playTone(frequency, startTime, duration, type = 'sine', volume = 0.25) {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(Math.min(volume * VOLUME_BOOST, 1), ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime + startTime);
    oscillator.stop(ctx.currentTime + startTime + duration);
}

const playButton = document.getElementById('play-game-btn');
const gameContainer = document.getElementById('game-container');
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('bg-music-toggle');

if (music) {
    music.volume = 0.3;
}

if (playButton && gameContainer && music) {
    playButton.addEventListener('click', function () {
        playButton.classList.add('d-none');
        gameContainer.classList.remove('d-none');

        music.play();
    });
}

if (music && musicToggle) {
    music.muted = localStorage.getItem('bgMusicMuted') === '1';
    updateMusicToggle();

    musicToggle.addEventListener('click', function () {
        music.muted = !music.muted;
        localStorage.setItem('bgMusicMuted', music.muted ? '1' : '0');
        updateMusicToggle();
    });
}

function updateMusicToggle() {
    musicToggle.textContent = music.muted ? '🔇 Bật nhạc' : '🔊 Tắt nhạc';
    musicToggle.setAttribute('aria-pressed', String(!music.muted));
}
