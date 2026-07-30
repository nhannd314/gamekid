<div data-lazy-games>
@fragment('games-grid')
    <div class="row g-3 g-md-4" id="games-grid">
        @foreach ($games as $game)
            @include('partials.game-item')
        @endforeach
    </div>

    @if ($games->hasMorePages())
        <div class="text-center py-4" data-lazy-load-trigger data-next-page-url="{{ $games->nextPageUrl() }}">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
        </div>
    @endif
@endfragment
</div>
