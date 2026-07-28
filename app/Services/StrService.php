<?php

namespace App\Services;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Str;

class StrService
{
    /**
     * @param string $modelClass    Tên class model, ví dụ App\Models\Page::class
     * @param string $title         Tiêu đề gốc để tạo slug
     * @return string
     */
    public static function generateUniqueSlug(string $modelClass, string $title): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 1;

        while ($modelClass::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    public static function normalizeName(string $name): string
    {
        $name = trim(preg_replace('/\s+/u', ' ', $name));
        return ucwords(mb_strtolower($name));
    }

    public static function formatDate($date): string
    {
        return \Illuminate\Support\Carbon::parse($date)->format('d-m-Y');
    }

    public static function printStars(int $number): string
    {
        $stars = '';

        for ($i = 0; $i < $number; $i++) {
            $stars .= Blade::render('<x-lucide-star class="mx-1" />');
        }

        return $stars;
    }
}
