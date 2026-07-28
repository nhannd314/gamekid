@extends('layouts.app-nosidebar')

@section('content')

    <div class="row justify-content-center py-5">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">

            <div class="mx-auto mb-4" style="max-width: 300px">
                @include('partials.brand')
            </div>

            <div class="card shadow-sm p-4">
                <h2 class="mb-4 text-center">Đặt lại mật khẩu</h2>

                <form method="POST" action="{{ route('password.update') }}">
                    @csrf

                    <input type="hidden" name="token" value="{{ $token }}">

                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input id="email" type="email" name="email" value="{{ old('email', $email) }}"
                               class="form-control @error('email') is-invalid @enderror"
                               autofocus autocomplete="username" required>
                        @error('email')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="password" class="form-label">Mật khẩu mới</label>
                        <input id="password" type="password" name="password"
                               class="form-control @error('password') is-invalid @enderror"
                               autocomplete="new-password" required>
                        @error('password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="password_confirmation" class="form-label">Xác nhận mật khẩu mới</label>
                        <input id="password_confirmation" type="password" name="password_confirmation"
                               class="form-control" autocomplete="new-password" required>
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Đặt lại mật khẩu</button>
                </form>
            </div>
        </div>
    </div>

@endsection
