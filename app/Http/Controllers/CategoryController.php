<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CategoryController extends Controller
{
    public function show(Category $category, Request $request): View|string
    {
        $games = $category->games()
            ->with('categories')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->paginate(20);

        return view('game-category', compact('category', 'games'))
            ->fragmentIf($request->ajax(), 'games-grid');
    }
}
