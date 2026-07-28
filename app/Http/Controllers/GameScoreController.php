<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGameScoreRequest;
use App\Models\Game;
use App\Models\GameUserScore;
use Illuminate\Http\JsonResponse;

class GameScoreController extends Controller
{
    /**
     * Save the authenticated player's score for a game, keeping only their best result.
     */
    public function store(StoreGameScoreRequest $request, Game $game): JsonResponse
    {
        $record = GameUserScore::recordScore($game, $request->user(), $request->integer('score'));

        return response()->json([
            'best_score' => $record->best_score,
        ]);
    }
}
