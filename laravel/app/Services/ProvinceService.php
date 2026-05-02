<?php

namespace App\Services;

use App\Models\Province;
use App\Repositories\ProvinceRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ProvinceService
{
    public function __construct(private ProvinceRepositoryInterface $repository)
    {
    }

    /**
     * Get all provinces
     */
    public function getAllProvinces(): Collection
    {
        return $this->repository->all();
    }

    /**
     * Get province by ID
     */
    public function getProvinceById(int $id): ?Province
    {
        return $this->repository->findById($id);
    }

    /**
     * Get province by name
     */
    public function getProvinceByName(string $name): ?Province
    {
        return $this->repository->findByName($name);
    }

    /**
     * Search provinces
     */
    public function searchProvinces(string $query): Collection
    {
        if (empty($query)) {
            return new Collection();
        }

        return $this->repository->search($query);
    }

    /**
     * Get top N provinces by poverty percentage
     */
    public function getTopProvincesBySemester(int $semester, int $limit = 10): Collection
    {
        return $this->getAllProvinces()
            ->sortByDesc(fn(Province $province) => $province->getPovertyPercentage($semester))
            ->take($limit);
    }

    /**
     * Calculate overall statistics
     */
    public function getOverallStatistics(): array
    {
        $provinces = $this->getAllProvinces();

        $totalPopulation = $provinces->sum('population');
        $totalMiserySem1 = $provinces->sum(
            fn(Province $p) => $p->getSemester1Data()?->misery_count ?? 0
        );
        $totalMiserySem2 = $provinces->sum(
            fn(Province $p) => $p->getSemester2Data()?->misery_count ?? 0
        );

        return [
            'total_provinces' => $provinces->count(),
            'total_population' => $totalPopulation,
            'semester_1' => [
                'misery_count' => $totalMiserySem1,
                'percentage' => round(($totalMiserySem1 / $totalPopulation) * 100, 2),
            ],
            'semester_2' => [
                'misery_count' => $totalMiserySem2,
                'percentage' => round(($totalMiserySem2 / $totalPopulation) * 100, 2),
            ],
            'trend' => round(($totalMiserySem2 - $totalMiserySem1) / $totalMiserySem1 * 100, 2),
        ];
    }
}
