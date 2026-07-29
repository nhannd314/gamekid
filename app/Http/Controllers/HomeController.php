<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Genre;

class HomeController extends Controller
{
    public function index()
    {
        $featuredGames = Game::query()
            ->with('categories')
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('sort_order')
            ->get();

        $genres = Genre::query()
            ->orderBy('sort_order')
            ->with(['games' => function ($query) {
                $query->with('categories')->where('is_active', true)->orderBy('sort_order');
            }])
            ->get();

        $otherGames = Game::query()
            ->with('categories')
            ->where('is_active', true)
            ->whereDoesntHave('genres')
            ->orderBy('sort_order')
            ->get();

        return view('home', compact('featuredGames', 'genres', 'otherGames'));
    }
}
