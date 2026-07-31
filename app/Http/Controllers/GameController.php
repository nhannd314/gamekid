<?php

namespace App\Http\Controllers;

use App\Models\Game;

class GameController extends Controller
{
    public function game(Game $game)
    {
        $game->increment('plays_count');

        $game->load('categories');

        $topScores = $game->scores()
            ->with('user')
            ->orderBy('best_score', $game->ranking_order === 'asc' ? 'asc' : 'desc')
            ->limit(10)
            ->get();

        return view('game', compact('game', 'topScores'));
    }
}
