<?php

namespace App\Repositories;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

use App\Models\Province;
use Illuminate\Database\Eloquent\Collection;

class ProvinceRepository implements ProvinceRepositoryInterface
{
    public function __construct(private Province $model)
    {
    }

    /**
     * Get all provinces with their semesters
     */
    public function all(): Collection
    {
        return $this->model->with('semesters')->get();
    }

    /**
     * Get paginated provinces
     */
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->with('semesters')->paginate($perPage);
    }

    /**
     * Find province by ID with relations
     */
    public function findById(int $id): ?Province
    {
        return $this->model->with('semesters')->find($id);
    }

    /**
     * Find province by name
     */
    public function findByName(string $name): ?Province
    {
        return $this->model->with('semesters')->where('name', $name)->first();
    }

    /**
     * Search provinces by name
     */
    public function search(string $query): Collection
    {
        return $this->model
            ->with('semesters')
            ->where('name', 'like', "%{$query}%")
            ->get();
    }
}
