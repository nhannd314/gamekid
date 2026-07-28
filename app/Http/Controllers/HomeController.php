<?php

namespace App\Http\Controllers;

use App\Models\Game;

class HomeController extends Controller
{
    public function index()
    {
        $games = Game::query()
            ->with('categories')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return view('home', compact('games'));
    }
}
