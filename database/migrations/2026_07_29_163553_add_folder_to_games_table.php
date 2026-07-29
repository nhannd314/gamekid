<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->string('folder')->nullable()->after('slug');
        });

        // Backfill: until now, every game's assets were resolved at
        // resources/games/{slug}/index.js, so slug and folder are identical
        // for all existing rows. New rows must set folder explicitly going
        // forward — slug (auto-derived from name) is no longer assumed to
        // match the on-disk directory.
        DB::table('games')->update(['folder' => DB::raw('slug')]);

        Schema::table('games', function (Blueprint $table) {
            $table->string('folder')->nullable(false)->change();
            $table->unique('folder');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropUnique(['folder']);
            $table->dropColumn('folder');
        });
    }
};
