<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProvinceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'population' => $this->population,
            'semester_1' => [
                'misery_count' => $this->getSemester1Data()?->misery_count,
                'percentage' => $this->getPovertyPercentage(1),
            ],
            'semester_2' => [
                'misery_count' => $this->getSemester2Data()?->misery_count,
                'percentage' => $this->getPovertyPercentage(2),
            ],
            'created_at' => $this->created_at,
        ];
    }
}
