<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bill extends Model
{
    protected $fillable = [
        'resident_id',
        'house_id',
        'billing_year',
        'billing_month',
        'due_date',
        'security_fee',
        'maintenance_fee',
        'total',
        'status',
    ];

    protected $casts = [
        'billing_year' => 'integer',
        'billing_month' => 'integer',
        'due_date' => 'date',
        'security_fee' => 'decimal:2',
        'maintenance_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'status' => 'string',
    ];

    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
