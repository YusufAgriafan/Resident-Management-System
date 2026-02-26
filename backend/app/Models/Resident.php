<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resident extends Model
{
    protected $fillable = [
        'name',
        'ktp',
        'phone',
        'resident_type',
        'marital_status',
    ];

    protected $casts = [
        'resident_type' => 'string',
        'marital_status' => 'string',
    ];

    public function houseOccupancies(): HasMany
    {
        return $this->hasMany(HouseOccupancy::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }
}
