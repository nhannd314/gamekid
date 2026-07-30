@extends('layouts.app')

@section('main')

    @include('partials.hero')

    <div class="row g-0 has-sidebar">
        <div class="col sidebar-col">

            @include('partials.sidebar')

        </div>
        <div id="content" class="col main-col bg-kid-light p-3 p-md-4">

            @yield('content')

        </div>
    </div>

@endsection
