@extends('layouts.app-sidebar')

@section('content')

    <h1 class="h2 mb-3">
        {{ $category->name }}
    </h1>

    @include('partials.game-grid')

    @include('partials.benefits')

@endsection
