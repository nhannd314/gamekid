<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Game;
use App\Models\Genre;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by(Str::lower((string) $request->input('login')).'|'.$request->ip());
        });

        View::composer('partials.sidebar', function ($view) {
            $activeCategory = request()->route('category');

            if (! $activeCategory && $game = request()->route('game')) {
                $activeCategory = $game->categories->first();
            }

            $view->with('categories', Category::orderBy('sort_order')->get());
            $view->with('activeCategory', $activeCategory);
        });

        View::composer('partials.header', function ($view) {
            $view->with('genres', Genre::orderBy('sort_order')->get());
            $view->with('activeGenre', request()->route('genre'));
        });

        View::composer('partials.sidebar-games', function ($view) {
            $featuredGames = Game::with('categories')
                ->where('is_featured', true)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->limit(5)
                ->get();

            $view->with('featuredGames', $featuredGames);
        });
    }
}
