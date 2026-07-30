<div class="hero position-relative">
    <div class="bg">
        <picture>
            <source
                media="(max-width:768px)"
                srcset="{{ asset('images/hero-section-background-mb.png') }}">
            <img
                src="{{ asset('images/hero-section-background.png') }}"
                class="img-fluid w-100"
                loading="eager"
                fetchpriority="high"
                alt="GameKid">
        </picture>
    </div>
    <div class="text-box text-center position-absolute top-50 start-50 translate-middle px-3">
        <h1 class="hero-title text-primary">
            Rèn luyện trí nhớ<br>
            <span class="text-secondary">Mỗi ngày thật vui!</span>
        </h1>
        <div class="hero-subtitle">
            Các trò chơi thú vị giúp bé phát triển trí nhớ,<br>
            khả năng quan sát và tư duy
        </div>
    </div>
</div>
