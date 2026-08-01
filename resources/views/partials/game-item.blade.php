<div class="col-6 col-md-3 pb-1">
    <a href="{{ route('game.show', $game->slug) }}" class="h-100 game-card bg-white rounded-3 overflow-hidden d-block shadow hover-bounce">
        <div class="thumbnail" aria-hidden="true">
            <img src="{{ asset('storage/' . $game->thumbnail) }}" loading="lazy"
                 alt="{{ $game->name }}" class="w-100 h-100 object-fit-cover">
        </div>
        <div class="py-3">
            <h3 class="title h4 text-center mb-0">{{ $game->name }}</h3>
            <div class="text-center fs-sm mb-0 text-muted">
                {{ $game->categories->pluck('name')->implode(', ') }}
            </div>
            <div class="d-flex justify-content-center gap-3 mb-1">
                <span class="stars text-warning fs-sm" aria-label="{{ $game->rating }} sao">
                    @for ($i=0;$i<$game->rating;$i++)<x-heroicon-s-star class="star" />@endfor
                </span>
                <span class="fs-sm" style="padding-top: 2px">({{ $game->plays_count }} lượt chơi)</span>
            </div>
            <div class="text-center fw-normal d-flex justify-content-center gap-2 flex-wrap">
                @if ($game->min_age)
                    <span class="small text-bg-light border rounded label-sm">Tuổi: {{ $game->min_age }}+</span>
                @endif
                <span class="small rounded text-white label-sm border {{ $game->difficultyBadgeClass() }}" style="min-width: 60px">{{ $game->difficultyLabel() }}</span>
            </div>
        </div>
    </a>
</div>
