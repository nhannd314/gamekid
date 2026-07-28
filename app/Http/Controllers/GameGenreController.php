<?php

namespace App\Http\Controllers;

use App\Models\Genre;

class GameGenreController extends Controller
{
    public function show(Genre $genre)
    {
        $games = $genre->games()
            ->with('categories')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return view('genre', compact('genre', 'games'));
    }
}
