<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Province extends Model
{
    protected $table = 'provinces';

    protected $fillable = [
        'name',
        'population',
    ];

    protected $casts = [
        'population' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the semesters for this province
     */
    public function semesters(): HasMany
    {
        return $this->hasMany(Semester::class);
    }

    /**
     * Get semester 1 data
     */
    public function getSemester1Data()
    {
        return $this->semesters()->where('semester', 1)->first();
    }

    /**
     * Get semester 2 data
     */
    public function getSemester2Data()
    {
        return $this->semesters()->where('semester', 2)->first();
    }

    /**
     * Calculate poverty percentage
     */
    public function getPovertyPercentage(int $semester): ?float
    {
        $data = $this->semesters()->where('semester', $semester)->first();

        if (!$data || !$this->population) {
            return null;
        }

        return round(($data->misery_count / $this->population) * 100, 2);
    }
}
