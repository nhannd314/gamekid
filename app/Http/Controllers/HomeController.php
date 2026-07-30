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
                $query->with('categories')->where('is_active', true)->limit(8)->orderBy('sort_order');
            }])
            ->get();

        return view('home', compact('featuredGames', 'genres'));
    }
}
