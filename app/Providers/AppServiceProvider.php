<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\ProvinceRepositoryInterface;
use App\Repositories\ProvinceRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Tambahin baris ini buat ngejodohin Interface sama Class aslinya
        $this->app->bind(
            \App\Repositories\ProvinceRepositoryInterface::class,
            \App\Repositories\ProvinceRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
