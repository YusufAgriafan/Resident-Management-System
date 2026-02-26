<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HouseResidentHistory extends Model
{
    protected $table = 'house_resident_history';

    protected $fillable = [
        'house_id',
        'resident_id',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class);
    }

    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }
}
