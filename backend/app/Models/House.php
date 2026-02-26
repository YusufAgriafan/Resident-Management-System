<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class House extends Model
{
    protected $fillable = [
        'code',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
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
