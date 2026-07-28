<a href="{{ route('game.show', $game->slug) }}" class="d-flex align-items-center mb-3 p-3 rounded hover-bounce bg-white shadow-sm">
    <div class="flex-shrink-0" style="width: 120px; height: 90px;">
        <img src="{{ asset('storage/' . $game->thumbnail) }}"
             alt="{{ $game->name }}"
             class="w-100 h-100 object-fit-cover rounded-1">
    </div>
    <div class="flex-grow-1 ms-3 overflow-hidden">
        <h4 class="h5 mb-1 text-truncate fw-bold">{{ $game->name }}</h4>
        <div class="mb-1">
            <span class="badge bg-kid-purple px-2 py-1 text-white small">{{ $game->categories->pluck('name')->implode(', ') }}</span>
        </div>
        <div class="">
            <small class="text-warning">
                @for ($i = 0; $i < $game->rating; $i++)⭐@endfor
            </small>
        </div>
    </div>
</a>
