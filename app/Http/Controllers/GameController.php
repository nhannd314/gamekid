<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function game(Game $game)
    {
        $game->load('categories');

        return view('game', compact('game'));
    }
}
