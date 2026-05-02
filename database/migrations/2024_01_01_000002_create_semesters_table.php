<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('semesters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_id')->constrained()->onDelete('cascade');
            $table->integer('semester')->comment('Semester number: 1 or 2');
            $table->integer('year');
            $table->integer('misery_count')->comment('Count of misery/poor people');
            $table->timestamps();

            $table->unique(['province_id', 'semester', 'year']);
            $table->index(['semester', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('semesters');
    }
};
