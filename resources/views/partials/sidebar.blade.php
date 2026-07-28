<aside class="sidebar h-100 px-3 py-4">
    <nav class="nav flex-row flex-lg-column flex-nowrap flex-lg-wrap gap-1 mb-3" aria-label="Danh mục trò chơi">
        <a href="{{ route('home') }}"
           class="link flex-shrink-0 @if (request()->routeIs('home')) active @endif">
            🏠 Tất cả trò chơi
        </a>

        @foreach ($categories as $cat)
            <a href="{{ route('game.category', $cat->slug) }}"
               class="link flex-shrink-0 @if ($activeCategory?->is($cat)) active @endif">
                {{ $cat->name }}
            </a>
        @endforeach

    </nav>
    <div class="bg-kid-purple p-3 rounded-3 me-1">
        <a href="#" class="sidebar_reward bg-kid-yellow px-3 py-2 rounded-2 d-flex gap-2 align-items-center">
            <span aria-hidden="true" class="fs-1">🎁</span>
            <span class="text-body fw-bold fs-6" style="line-height: 1.1em">Phần thưởng<br>hằng ngày</span>
        </a>
    </div>
</aside>
