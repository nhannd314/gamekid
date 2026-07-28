<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(LazilyRefreshDatabase::class);

test('forgot password screen can be rendered', function () {
    $response = $this->get(route('password.request'));

    $response->assertStatus(200);
});

test('password reset link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $response = $this->post(route('password.email'), [
        'email' => $user->email,
    ]);

    $response->assertSessionHasNoErrors();

    Notification::assertSentTo($user, ResetPassword::class);
});

test('password reset link request fails for an unknown email', function () {
    Notification::fake();

    $response = $this->post(route('password.email'), [
        'email' => 'unknown@example.com',
    ]);

    $response->assertSessionHasErrors('email');

    Notification::assertNothingSent();
});

test('authenticated users are redirected away from the forgot password page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('password.request'));

    $response->assertRedirect(route('home'));
});
