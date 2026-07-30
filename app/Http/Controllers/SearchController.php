<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SearchController extends Controller
{
    public function index(Request $request): View|string
    {
        $query = trim((string) $request->string('q'));

        $games = Game::query()
            ->with('categories')
            ->where('is_active', true)
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($builder) use ($query) {
                    $builder->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                });
            })
            ->orderBy('sort_order')
            ->paginate(20)
            ->withQueryString();

        return view('search', compact('games', 'query'))
            ->fragmentIf($request->ajax(), 'games-grid');
    }
}
