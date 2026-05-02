<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProvinceController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::prefix('provinces')->group(function () {
    Route::get('/', [ProvinceController::class, 'index']);
    Route::get('/search', [ProvinceController::class, 'search']);
    Route::get('/top', [ProvinceController::class, 'topProvinces']);
    Route::get('/{id}', [ProvinceController::class, 'show']);
});

Route::get('/statistics/summary', [ProvinceController::class, 'statistics']);
