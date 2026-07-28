<div class="col-12 col-md-3">
    <a href="{{ route('game.show', $game->slug) }}" class="game-card rounded-3 overflow-hidden d-block shadow hover-bounce">
        <div class="thumbnail ratio ratio-4x3" aria-hidden="true">
            <img src="{{ asset('storage/' . $game->thumbnail) }}"
                 alt="{{ $game->name }}" class="w-100 h-100 object-fit-cover">
        </div>
        <div class="p-3">
            <h3 class="title h4 text-center">{{ $game->name }}</h3>
            <div class="meta d-flex justify-content-between align-items-center">
                <span class="text-muted">{{ $game->categories->pluck('name')->implode(', ') }}</span>
                <span class="stars text-warning fs-6" aria-label="{{ $game->rating }} sao">
                    @for ($i=0;$i<$game->rating;$i++)⭐@endfor
                </span>
            </div>
        </div>
    </a>
</div>
