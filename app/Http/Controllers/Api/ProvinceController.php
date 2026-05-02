<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ProvinceResource;
use App\Http\Resources\ProvinceCollection;
use App\Services\ProvinceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProvinceController
{
    public function __construct(private ProvinceService $service)
    {
    }

    /**
     * Get all provinces with statistics
     */
    public function index(): ProvinceCollection
    {
        $provinces = $this->service->getAllProvinces();

        return new ProvinceCollection(
            $provinces->map(fn($province) => new ProvinceResource($province))
        );
    }

    /**
     * Get specific province by ID
     */
    public function show(int $id): JsonResponse
    {
        $province = $this->service->getProvinceById($id);

        if (!$province) {
            return response()->json(['message' => 'Province not found'], 404);
        }

        return response()->json([
            'data' => new ProvinceResource($province),
        ]);
    }

    /**
     * Search provinces by name
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q', '');

        if (empty($query)) {
            return response()->json([
                'data' => [],
                'message' => 'Search query is required',
            ], 400);
        }

        $provinces = $this->service->searchProvinces($query);

        return response()->json([
            'data' => $provinces->map(fn($province) => new ProvinceResource($province)),
            'total' => $provinces->count(),
        ]);
    }

    /**
     * Get top provinces by poverty level
     */
    public function topProvinces(Request $request): JsonResponse
    {
        $semester = (int) $request->query('semester', 1);
        $limit = (int) $request->query('limit', 10);

        $provinces = $this->service->getTopProvincesBySemester($semester, $limit);

        return response()->json([
            'data' => $provinces->map(fn($province) => new ProvinceResource($province)),
            'semester' => $semester,
            'total' => $provinces->count(),
        ]);
    }

    /**
     * Get overall statistics summary
     */
    public function statistics(): JsonResponse
    {
        $stats = $this->service->getOverallStatistics();

        return response()->json([
            'data' => $stats,
        ]);
    }
}
