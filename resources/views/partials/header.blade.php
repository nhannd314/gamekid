<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'KiddoPlay — Học mà chơi, chơi mà nhớ!')</title>
    <meta name="description" content="@yield('meta_description', 'KiddoPlay - Nền tảng trò chơi giáo dục trí tuệ dành cho trẻ em. Giúp bé rèn luyện trí nhớ, tư duy và khả năng quan sát một cách vui nhộn.')">
    <meta name="keywords" content="@yield('meta_keywords', 'trò chơi trẻ em, game giáo dục, rèn luyện trí nhớ, phát triển tư duy, kidplay, game cho bé')">

    <!-- Favicons -->
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('images/favicon-16.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/favicon-32.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('images/apple-touch-icon.png') }}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="@yield('title', 'KiddoPlay — Học mà chơi, chơi mà nhớ!')">
    <meta property="og:description" content="@yield('meta_description', 'KiddoPlay - Nền tảng trò chơi giáo dục trí tuệ dành cho trẻ em. Giúp bé rèn luyện trí nhớ, tư duy và khả năng quan sát một cách vui nhộn.')">
    <meta property="og:image" content="@yield('meta_image', asset('images/logo.png'))">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url()->current() }}">
    <meta property="twitter:title" content="@yield('title', 'KiddoPlay — Học mà chơi, chơi mà nhớ!')">
    <meta property="twitter:description" content="@yield('meta_description', 'KiddoPlay - Nền tảng trò chơi giáo dục trí tuệ dành cho trẻ em. Giúp bé rèn luyện trí nhớ, tư duy và khả năng quan sát một cách vui nhộn.')">
    <meta property="twitter:image" content="@yield('meta_image', asset('images/logo.png'))">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400..800&display=swap" rel="stylesheet">

    @vite(['resources/scss/app.scss', 'resources/js/app.js'])

</head>
<body class="page-home">
<header class="header bg-white shadow">
    <div class="navbar navbar-expand-lg p-0">
        <div class="container-fluid">
            @include('partials.brand')

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Mở/đóng menu">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="mainNav">
                <nav class="nav flex-column flex-lg-row gap-2 gap-lg-3 py-3 py-lg-0 mx-lg-auto" aria-label="Menu chính">
                    <a class="link @if (! $activeGenre) active @endif" href="{{ route('home') }}">
                        <span class="icon">🏠</span> Trang chủ
                    </a>
                    @foreach ($genres as $genre)
                        <a class="link @if ($activeGenre?->is($genre)) active @endif" href="{{ route('game.genre', $genre->slug) }}">
                            <span class="icon">{{ $genre->icon }}</span> {{ $genre->name }}
                        </a>
                    @endforeach
                </nav>
                <div class="nav user d-flex align-items-center gap-2 pb-3 pb-lg-0 pe-lg-2">
                    <form action="{{ route('search') }}" method="GET" role="search" class="search-form me-2">
                        <div class="position-relative">
                            <input type="search" name="q" value="{{ $query ?? '' }}" class="search-input form-control rounded-pill"
                                   placeholder="Tìm game..." aria-label="Tìm kiếm trò chơi">
                            <button type="submit" class="search-btn position-absolute" aria-label="Tìm kiếm">
                                <x-heroicon-o-magnifying-glass class="heroicon" style="width: 1em; height: 1em;" />
                            </button>
                        </div>
                    </form>

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
                            <ul class="dropdown-menu dropdown-menu-lg-end">
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
                        <a href="{{ route('login', ['redirect' => url()->full()]) }}" class="text-body ms-1 border-bottom border-2 fw-semibold">
                            Đăng nhập
                        </a>
                    @endauth

                </div>
            </div>
        </div>
    </div>
</header>
