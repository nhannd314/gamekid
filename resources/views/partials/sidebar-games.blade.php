<aside class="sidebar-games">
    <h3 class="mb-4">Games nổi bật</h3>
    <div class="featured-games-list">
        @forelse($featuredGames as $game)
            @include('partials.game-sidebar-item', ['game' => $game])
        @empty
            <p class="text-muted small">Chưa có game nổi bật nào.</p>
        @endforelse
    </div>
</aside>
