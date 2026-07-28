<?php

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertStatus(200);
});

test('users can register using an email', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Nguyen Van A',
        'login' => 'nguyenvana@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('home'));

    $this->assertDatabaseHas('users', [
        'name' => 'Nguyen Van A',
        'email' => 'nguyenvana@example.com',
        'phone' => null,
    ]);
});

test('users can register using a phone number', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Nguyen Van B',
        'login' => '0987654321',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('home'));

    $this->assertDatabaseHas('users', [
        'name' => 'Nguyen Van B',
        'phone' => '0987654321',
        'email' => null,
    ]);
});

test('registration requires a password confirmation', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Nguyen Van C',
        'login' => 'nguyenvanc@example.com',
        'password' => 'password',
        'password_confirmation' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('password');
    $this->assertGuest();
});

test('users cannot register with an email that is already taken', function () {
    $user = User::factory()->create();

    $response = $this->post(route('register.store'), [
        'name' => 'Another Name',
        'login' => $user->email,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('login');
    $this->assertGuest();
});

test('users cannot register with a phone number that is already taken', function () {
    $user = User::factory()->create();

    $response = $this->post(route('register.store'), [
        'name' => 'Another Name',
        'login' => $user->phone,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('login');
    $this->assertGuest();
});

test('authenticated users are redirected away from the registration page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('register'));

    $response->assertRedirect(route('home'));
});
