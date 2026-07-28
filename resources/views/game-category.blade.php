@extends('layouts.app-sidebar')

@section('content')

    <h2 class="mb-4">
        {{ $category->name }}
    </h2>
    <div class="row g-4">

        @forelse ($games as $game)
            @include('partials.game-item')
        @empty

        @endforelse

    </div>

    @include('partials.benefits')

@endsection
