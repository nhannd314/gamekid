<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>KiddoPlay — Học mà chơi, chơi mà nhớ!</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400..800&display=swap" rel="stylesheet">

    @vite(['resources/scss/app.scss', 'resources/js/app.js'])

</head>
<body class="page-home">
<header class="header bg-white shadow position-relative z-index-10">
    <div class="container-fluid">
        <div class="navbar navbar-expand-lg p-0">

            @include('partials.brand')

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false"
                    aria-label="Mở/đóng menu">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="mainNav">
                <nav class="nav flex-column flex-lg-row gap-2 gap-lg-3 py-3 py-lg-0 mx-lg-auto" aria-label="Menu chính">
                    <a class="link @if (! $activeGenre) active @endif" href="{{ route('home') }}">
                        <span class="icon">🏠</span> Trang chủ
                    </a>
                    @foreach ($genres as $genre)
                        <a class="link @if ($activeGenre?->is($genre)) active @endif" href="{{ route('game.genre', $genre->slug) }}">
                            <span class="icon">{{ match ($genre->slug) {
                                'tro-choi-tri-nho' => '🧠',
                                'tro-choi-tri-tue' => '🧩',
                                'tro-choi-hoc-tieng-anh' => '🔤',
                                default => '🎮',
                            } }}</span> {{ $genre->name }}
                        </a>
                    @endforeach
                </nav>
                <div class="nav user flex-row align-items-center gap-2 pb-3 pb-lg-0 pe-lg-2">
{{--                    <a href="" class="points-pill link" title="Điểm thưởng">--}}
{{--                        <span class="icon" aria-hidden="true">⭐</span> 1250--}}
{{--                    </a>--}}
                    @auth
                        <div class="dropdown">
                            <button type="button" class="avatar border-0 bg-transparent p-0" data-bs-toggle="dropdown" aria-expanded="false" title="Tài khoản" aria-label="Tài khoản">
                                @if (auth()->user()->avatar_url)
                                    <img src="{{ auth()->user()->avatar_url }}" alt="{{ auth()->user()->name }}" class="rounded-circle border" style="width: 50px; height: 50px; object-fit: cover;">
                                @else
                                    <span class="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style="width: 50px; height: 50px; font-size: 1.5rem;">
                                        {{ auth()->user()->initials() }}
                                    </span>
                                @endif
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a class="dropdown-item" href="{{ route('profile.edit') }}">Hồ sơ</a>
                                </li>
                                <li>
                                    <form method="POST" action="{{ route('logout') }}">
                                        @csrf
                                        <button type="submit" class="dropdown-item">Đăng xuất</button>
                                    </form>
                                </li>
                            </ul>
                        </div>
                    @else
                        <a href="{{ route('login') }}" class="link bg-primary text-white">
                            Đăng nhập
                        </a>
                    @endauth
                </div>
            </div>
        </div>
    </div>
</header>
