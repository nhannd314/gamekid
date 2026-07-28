<?php

namespace App\Http\Controllers;

use App\Models\Category;

class CategoryController extends Controller
{
    public function show(Category $category)
    {
        $games = $category->games()
            ->with('categories')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return view('game-category', compact('category', 'games'));
    }
}
