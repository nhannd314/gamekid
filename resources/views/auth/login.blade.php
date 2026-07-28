@extends('layouts.app-nosidebar')

@section('content')

    <div class="row justify-content-center py-5">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">

            <div class="mx-auto mb-4" style="max-width: 300px">
                @include('partials.brand')
            </div>

            <div class="card shadow-sm p-4">
                <h2 class="mb-4 text-center">Đăng nhập</h2>

                @if (session('status'))
                    <div class="alert alert-success">{{ session('status') }}</div>
                @endif

                <form method="POST" action="{{ route('login.store') }}">
                    @csrf

                    <div class="mb-3">
                        <label for="login" class="form-label">Email hoặc số điện thoại</label>
                        <input id="login" type="text" name="login" value="{{ old('login') }}"
                               class="form-control @error('login') is-invalid @enderror"
                               autofocus autocomplete="username" required>
                        @error('login')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="password" class="form-label">Mật khẩu</label>
                        <input id="password" type="password" name="password"
                               class="form-control @error('password') is-invalid @enderror"
                               autocomplete="current-password" required>
                        @error('password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="mt-1">
                            <a href="{{ route('password.request') }}" class="small">Quên mật khẩu?</a>
                        </div>
                    </div>

                    <div class="mb-3 form-check">
                        <input type="checkbox" name="remember" id="remember" class="form-check-input">
                        <label for="remember" class="form-check-label">Ghi nhớ đăng nhập</label>
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Đăng nhập</button>
                </form>

                <p class="text-center mt-3 mb-0">
                    Chưa có tài khoản? <a href="{{ route('register') }}">Đăng ký</a>
                </p>
            </div>
        </div>
    </div>

@endsection
