@extends('layouts.app-nosidebar')

@section('content')

    <div class="row justify-content-center py-5">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">

            <div class="mx-auto mb-4" style="max-width: 300px">
                @include('partials.brand')
            </div>

            <div class="card shadow-sm p-4">
                <h2 class="mb-4 text-center">Đăng ký</h2>

                <form method="POST" action="{{ route('register.store') }}">
                    @csrf

                    <div class="mb-3">
                        <label for="name" class="form-label">Họ và tên</label>
                        <input id="name" type="text" name="name" value="{{ old('name') }}"
                               class="form-control @error('name') is-invalid @enderror"
                               autofocus autocomplete="name" required>
                        @error('name')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="login" class="form-label">Email hoặc số điện thoại</label>
                        <input id="login" type="text" name="login" value="{{ old('login') }}"
                               class="form-control @error('login') is-invalid @enderror"
                               autocomplete="username" required>
                        @error('login')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="password" class="form-label">Mật khẩu</label>
                        <input id="password" type="password" name="password"
                               class="form-control @error('password') is-invalid @enderror"
                               autocomplete="new-password" required>
                        @error('password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="password_confirmation" class="form-label">Xác nhận mật khẩu</label>
                        <input id="password_confirmation" type="password" name="password_confirmation"
                               class="form-control" autocomplete="new-password" required>
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Đăng ký</button>
                </form>

                <p class="text-center mt-3 mb-0">
                    Đã có tài khoản? <a href="{{ route('login') }}">Đăng nhập</a>
                </p>
            </div>
        </div>
    </div>

@endsection
