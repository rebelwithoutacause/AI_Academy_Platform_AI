<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->enum('difficulty_level', ['Beginner', 'Intermediate', 'Advanced'])->nullable()->after('examples');
            $table->json('video_links')->nullable()->after('difficulty_level');
            $table->decimal('rating', 3, 2)->nullable()->default(0)->after('video_links');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropColumn(['difficulty_level', 'video_links', 'rating']);
        });
    }
};