<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\View\View;

class GamesController extends Controller
{
    public function index(Request $request): View|string
    {
        $games = Game::query()
            ->with('categories')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->paginate(20);

        return view('games', compact('games'))
            ->fragmentIf($request->ajax(), 'games-grid');
    }
}
