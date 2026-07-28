<?php

use App\Models\User;
use Filament\Panel;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('new users default to the user role', function () {
    $user = User::factory()->create();

    expect($user->refresh()->role)->toBe('user');
});

test('regular users cannot access the filament admin panel', function () {
    $user = User::factory()->create();

    expect($user->canAccessPanel(new Panel))->toBeFalse();
});

test('admin users can access the filament admin panel', function () {
    $admin = User::factory()->admin()->create();

    expect($admin->canAccessPanel(new Panel))->toBeTrue();
});
