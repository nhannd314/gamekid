<aside class="game-leaderboard mb-4">
    <h3 class="mb-4">Bảng xếp hạng</h3>
    <div class="leaderboard-list bg-white rounded shadow-sm p-3">
        @forelse ($topScores as $index => $entry)
            <div class="d-flex align-items-center py-2 {{ ! $loop->last ? 'border-bottom' : '' }}">
                <div class="fw-bold text-kid-purple text-center" style="width: 50px;">Top {{ $index + 1 }}</div>
                <div class="flex-shrink-0 mx-2">
                    @if ($entry->user->avatar_url)
                        <img src="{{ $entry->user->avatar_url }}" alt="{{ $entry->user->name }}" class="rounded-circle" style="width: 36px; height: 36px; object-fit: cover;">
                    @else
                        <span class="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                            {{ $entry->user->initials() }}
                        </span>
                    @endif
                </div>
                <div class="flex-grow-1 text-truncate">{{ $entry->user->name }}</div>
                <div class="fw-bold ms-2">{{ number_format($entry->best_score) }}</div>
            </div>
        @empty
            <p class="text-muted small mb-0">Chưa có điểm số nào cho game này.</p>
        @endforelse
    </div>
</aside>
