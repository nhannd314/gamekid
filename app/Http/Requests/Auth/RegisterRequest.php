<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
        $field = $this->field();

        return [
            'name' => ['required', 'string', 'max:255'],
            'login' => [
                'required',
                'string',
                ...($field === 'email' ? ['email'] : []),
                Rule::unique('users', $field),
            ],
            'password' => ['required', 'confirmed', Password::min(8)],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'login.unique' => 'Email hoặc số điện thoại này đã được đăng ký.',
        ];
    }

    /**
     * Determine whether the login field should be treated as an email or a phone number.
     */
    public function field(): string
    {
        return Str::contains($this->string('login'), '@') ? 'email' : 'phone';
    }

    /**
     * Build the attributes used to create the new user.
     *
     * @return array<string, string>
     */
    public function userData(): array
    {
        return [
            'name' => $this->string('name'),
            $this->field() => $this->string('login'),
            'password' => $this->string('password'),
        ];
    }
}
