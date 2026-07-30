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

/**
 * Called by a game's own JS when it ends, so its score can be saved as the
 * player's best score. Silently does nothing for guests (not logged in) or
 * when the game container has no slug to save against.
 */
export function endGame(score) {
    const slug = document.getElementById('game-container')?.dataset.gameSlug;

    if (!slug) {
        return;
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    fetch(`/game/${slug}/score`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ score }),
    }).catch(() => {
        // Ignore network/auth failures (e.g. guest players) — saving the score is best-effort.
    });
}

// Vite's dev server evaluates this module once for its own <script> tag and
// again as a dependency of each game's bundle, so guard against wiring up
// the same listeners twice (which would cancel each other out on click).
if (!window.__kiddoplayAppInitialized) {
    window.__kiddoplayAppInitialized = true;

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
        updateMusicToggle(music, musicToggle);

        musicToggle.addEventListener('click', function () {
            music.muted = !music.muted;
            localStorage.setItem('bgMusicMuted', music.muted ? '1' : '0');
            updateMusicToggle(music, musicToggle);
        });
    }
}

function updateMusicToggle(music, musicToggle) {
    musicToggle.textContent = music.muted ? '🔇 Bật nhạc' : '🔊 Tắt nhạc';
    musicToggle.setAttribute('aria-pressed', String(!music.muted));
}

// Infinite-scroll lazy loading for game grids (category, genre, /games pages).
// Each container renders its own trigger element carrying the next page URL;
// loading a page swaps in a freshly rendered trigger (or none, at the end).
if (!window.__kiddoplayLazyGamesInitialized) {
    window.__kiddoplayLazyGamesInitialized = true;

    document.querySelectorAll('[data-lazy-games]').forEach(setUpLazyGames);
}

function setUpLazyGames(container) {
    let observer = null;

    function watchTrigger() {
        const trigger = container.querySelector('[data-lazy-load-trigger]');

        if (!trigger) {
            return;
        }

        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    loadNextPage(trigger);
                }
            });
        });

        observer.observe(trigger);
    }

    function loadNextPage(trigger) {
        const nextPageUrl = trigger.dataset.nextPageUrl;

        if (!nextPageUrl || trigger.dataset.loading === '1') {
            return;
        }

        trigger.dataset.loading = '1';
        observer?.disconnect();

        fetch(nextPageUrl, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then((response) => response.text())
            .then((html) => {
                const template = document.createElement('template');
                template.innerHTML = html.trim();

                const grid = container.querySelector('#games-grid');
                const newGrid = template.content.querySelector('#games-grid');

                if (grid && newGrid) {
                    grid.append(...newGrid.childNodes);
                }

                trigger.replaceWith(...template.content.querySelectorAll('[data-lazy-load-trigger]'));
                watchTrigger();
            })
            .catch(() => {
                trigger.dataset.loading = '';
            });
    }

    watchTrigger();
}
