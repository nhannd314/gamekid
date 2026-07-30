@extends('layouts.app-sidebar')

@section('title', ($query !== '' ? "Kết quả tìm kiếm cho \"{$query}\"" : 'Tìm kiếm trò chơi') . ' — KiddoPlay')
@section('meta_description', 'Tìm kiếm trò chơi giáo dục trên KiddoPlay.')

@section('content')

    <h1 class="h2 mb-3">
        @if ($query !== '')
            Kết quả tìm kiếm cho &ldquo;{{ $query }}&rdquo;
        @else
            Tìm kiếm trò chơi
        @endif
    </h1>

    @if ($games->isEmpty())
        <p class="text-muted">Không tìm thấy trò chơi nào phù hợp. Hãy thử từ khóa khác nhé!</p>
    @else
        @include('partials.game-grid')
    @endif

@endsection
