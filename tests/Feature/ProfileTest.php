<?php

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(LazilyRefreshDatabase::class);

test('guests cannot view the profile page', function () {
    $response = $this->get(route('profile.edit'));

    $response->assertRedirect(route('login'));
});

test('profile page can be rendered', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('profile.edit'));

    $response->assertOk();
});

test('users without an avatar see their initials', function () {
    $user = User::factory()->create(['name' => 'Nhan Nguyen']);

    expect($user->initials())->toBe('N');
    expect($user->avatar_url)->toBeNull();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->put(route('profile.update'), [
        'name' => 'Tên Mới',
        'phone' => $user->phone,
    ]);

    $response->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Tên Mới');
});

test('email can be changed via the profile form', function () {
    $user = User::factory()->create(['email' => 'original@example.com']);

    $response = $this->actingAs($user)->put(route('profile.update'), [
        'name' => $user->name,
        'phone' => $user->phone,
        'email' => 'changed@example.com',
    ]);

    $response->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->email)->toBe('changed@example.com');
});

test('email must be unique when updating the profile', function () {
    User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create();

    $response = $this->actingAs($user)->put(route('profile.update'), [
        'name' => $user->name,
        'phone' => $user->phone,
        'email' => 'taken@example.com',
    ]);

    $response->assertSessionHasErrors('email');

    $user->refresh();

    expect($user->email)->not->toBe('taken@example.com');
});

test('profile update requires an email or a phone number', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->put(route('profile.update'), [
        'name' => $user->name,
        'email' => '',
        'phone' => '',
    ]);

    $response->assertSessionHasErrors('email');

    $user->refresh();

    expect($user->email)->not->toBeNull();
});

test('users can upload an avatar', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $response = $this->actingAs($user)->put(route('profile.update'), [
        'name' => $user->name,
        'phone' => $user->phone,
        'avatar' => UploadedFile::fake()->image('avatar.jpg'),
    ]);

    $response->assertRedirect(route('profile.edit'));

    $user->refresh();

    Storage::disk('public')->assertExists($user->avatar);
    expect($user->avatar_url)->not->toBeNull();
});
