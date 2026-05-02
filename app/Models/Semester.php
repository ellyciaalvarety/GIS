<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Semester extends Model
{
    protected $table = 'semesters';

    protected $fillable = [
        'province_id',
        'semester',
        'year',
        'misery_count',
    ];

    protected $casts = [
        'province_id' => 'integer',
        'semester' => 'integer',
        'year' => 'integer',
        'misery_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the province this semester belongs to
     */
    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    /**
     * Calculate poverty percentage
     */
    public function getPovertyPercentage(): float
    {
        if (!$this->province || !$this->province->population) {
            return 0;
        }

        return round(($this->misery_count / $this->province->population) * 100, 2);
    }
}
