<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetLinkRequest extends FormRequest
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
            'email' => ['required', 'email'],
        ];
    }

    /**
     * Send the password reset link, throwing a validation exception on failure.
     */
    public function sendResetLink(): void
    {
        $status = Password::sendResetLink($this->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
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
            Password::RESET_THROTTLED => 'Vui lòng đợi trước khi thử lại.',
            default => 'Không thể gửi liên kết đặt lại mật khẩu. Vui lòng thử lại.',
        };
    }
}
