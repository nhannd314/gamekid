<?php

namespace App\Http\Controllers;

use App\Models\Game;

class GameController extends Controller
{
    public function game(Game $game)
    {
        $game->load('categories');

        $topScores = $game->scores()->with('user')->orderByDesc('best_score')->limit(10)->get();

        return view('game', compact('game', 'topScores'));
    }
}
