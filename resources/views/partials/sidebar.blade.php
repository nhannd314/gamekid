<aside class="sidebar h-100 p-3">
    <nav class="nav flex-row flex-lg-column flex-nowrap flex-lg-wrap gap-1 mb-3 pb-3" aria-label="Danh mục trò chơi">
        <a href="{{ route('games.index') }}" class="link flex-shrink-0 @if (request()->routeIs('games.index')) active @endif">
            <span class="icon">🎮</span> Tất cả trò chơi
        </a>

        @foreach ($categories as $cat)
            <a href="{{ route('game.category', $cat->slug) }}"
               class="link flex-shrink-0 @if ($activeCategory?->is($cat)) active @endif">
                <span class="icon">{{ $cat->icon }}</span> {{ $cat->name }}
            </a>
        @endforeach

    </nav>
    <div class="bg-kid-purple p-3 rounded-3 me-1 mb-4">
        <a href="#" class="sidebar_reward bg-kid-yellow px-3 py-2 rounded-2 d-flex gap-2 hover-boxshadow hover-bg-kid-yellow align-items-center">
            <span aria-hidden="true" class="fs-1">🎁</span>
            <span class="text-body fw-bold fs-6" style="line-height: 1.1em">Phần thưởng<br>hằng ngày</span>
        </a>
    </div>

    <div class="contact me-1">
        <h4 class="text-white mb-3">
            Liên hệ admin
        </h4>
        <a href="https://zalo.me/0965991099" target="_blank" rel="noopener"
           class="d-flex mb-2 align-items-center gap-2 bg-kid-purple text-white p-2 rounded">
            <span aria-hidden="true">💬</span> Zalo: 0965991099
        </a>
        <a href="https://facebook.com/nhannd314" target="_blank" rel="noopener"
           class="d-flex align-items-center gap-2 bg-kid-purple text-white p-2 rounded">
            <span aria-hidden="true">📘</span> Facebook
        </a>
    </div>
</aside>
