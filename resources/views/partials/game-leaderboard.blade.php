<aside class="game-leaderboard mb-4">
    <h3 class="mb-3 d-flex align-items-center gap-2">
        <span aria-hidden="true">🏆</span> Bảng xếp hạng
    </h3>
    <div class="leaderboard-list bg-white rounded shadow-sm p-3 pb-2">
        @forelse ($topScores as $index => $entry)
            @php
                $rank = $index + 1;
                $medal = match ($rank) {
                    1 => '🥇',
                    2 => '🥈',
                    3 => '🥉',
                    default => null,
                };
            @endphp
            <div class="leaderboard-row mb-2 d-flex align-items-center gap-2 py-2 px-2 {{ ! $loop->last ? 'border-bottom' : '' }} {{ $rank <= 3 ? 'rank-' . $rank : '' }}">
                <div class="leaderboard-rank fw-bold text-center flex-shrink-0">
                    @if ($medal)
                        <span class="fs-5" aria-hidden="true">{{ $medal }}</span>
                    @else
                        <span class="text-kid-purple">{{ $rank }}</span>
                    @endif
                </div>
                <div class="flex-shrink-0">
                    @if ($entry->user->avatar_url)
                        <img src="{{ $entry->user->avatar_url }}" alt="{{ $entry->user->name }}" class="rounded-circle leaderboard-avatar">
                    @else
                        <span class="rounded-circle bg-kid-purple text-white d-inline-flex align-items-center justify-content-center leaderboard-avatar">
                            {{ $entry->user->initials() }}
                        </span>
                    @endif
                </div>
                <div class="flex-grow-1 text-truncate fw-semibold">{{ $entry->user->name }}</div>
                <div class="leaderboard-score fw-bold flex-shrink-0">{{ number_format($entry->best_score) }}</div>
            </div>
        @empty
            <div class="text-center text-muted py-4">
                <div class="fs-1 mb-2" aria-hidden="true">🎯</div>
                <p class="small mb-0">Chưa có điểm số nào cho game này.<br>Hãy là người đầu tiên chinh phục!</p>
            </div>
        @endforelse
    </div>
</aside>
