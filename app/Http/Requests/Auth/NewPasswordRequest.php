<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class NewPasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ];
    }

    /**
     * Reset the password, throwing a validation exception on failure.
     */
    public function resetPassword(): void
    {
        $status = Password::reset(
            $this->only('email', 'password', 'password_confirmation', 'token'),
            function ($user): void {
                $user->forceFill(['password' => $this->string('password')])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => $this->statusMessage($status),
            ]);
        }
    }

    /**
     * Map a password broker status to a user-facing Vietnamese message.
     */
    protected function statusMessage(string $status): string
    {
        return match ($status) {
            Password::INVALID_USER => 'Chúng tôi không tìm thấy người dùng với email này.',
            Password::INVALID_TOKEN => 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
            default => 'Không thể đặt lại mật khẩu. Vui lòng thử lại.',
        };
    }
}
