<div class="col-12 col-md-3">
    <a href="{{ route('game.show', $game->slug) }}" class="h-100 game-card bg-white mb-2 rounded-3 overflow-hidden d-block shadow hover-bounce">
        <div class="thumbnail ratio ratio-4x3" aria-hidden="true">
            <img src="{{ asset('storage/' . $game->thumbnail) }}"
                 alt="{{ $game->name }}" class="w-100 h-100 object-fit-cover">
        </div>
        <div class="py-3">
            <h3 class="title h4 text-center mb-0">{{ $game->name }}</h3>
            <div class="text-center fs-sm mb-1 text-muted">
                {{ $game->categories->pluck('name')->implode(', ') }}
            </div>
            <div class="text-center small mb-1 d-flex justify-content-center gap-1 flex-wrap">
                @if ($game->min_age)
                    <span class="text-bg-light border rounded label-sm">{{ $game->min_age }}+ tuổi</span>
                @endif
                <span class="text-white rounded label-sm {{ $game->difficultyBadgeClass() }}" style="min-width: 50px">{{ $game->difficultyLabel() }}</span>
            </div>
            <div class="text-center fs-sm">
                <span class="stars text-warning" aria-label="{{ $game->rating }} sao">
                    @for ($i=0;$i<$game->rating;$i++)⭐@endfor
                </span>
            </div>
        </div>
    </a>
</div>
