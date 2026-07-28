@extends('layouts.app-nosidebar')

@section('content')

    <div class="row justify-content-center py-5">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">

            <div class="mx-auto mb-4" style="max-width: 300px">
                @include('partials.brand')
            </div>

            <div class="card shadow-sm p-4">
                <h2 class="mb-4 text-center">Quên mật khẩu</h2>

                <p class="text-muted mb-4">Nhập email của bạn, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.</p>

                @if (session('status'))
                    <div class="alert alert-success">{{ session('status') }}</div>
                @endif

                <form method="POST" action="{{ route('password.email') }}">
                    @csrf

                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input id="email" type="email" name="email" value="{{ old('email') }}"
                               class="form-control @error('email') is-invalid @enderror"
                               autofocus autocomplete="username" required>
                        @error('email')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Gửi liên kết đặt lại mật khẩu</button>
                </form>

                <p class="text-center mt-3 mb-0">
                    <a href="{{ route('login') }}">Quay lại đăng nhập</a>
                </p>
            </div>
        </div>
    </div>

@endsection
