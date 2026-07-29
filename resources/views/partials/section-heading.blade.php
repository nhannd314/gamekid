@php
    $icon ??= '🎮';
    $href ??= null;
@endphp

<div class="d-flex align-items-center justify-content-between mb-3">
    <h2 class="section-title mb-0 d-flex align-items-center gap-2">
        <span class="section-title-icon" aria-hidden="true">{{ $icon }}</span>
        {{ $title }}
    </h2>
    @if ($href)
        <a href="{{ $href }}" class="section-link fw-semibold text-nowrap">Xem tất cả →</a>
    @endif
</div>
