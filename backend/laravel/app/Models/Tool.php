<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'link',
        'documentation',
        'description',
        'usage',
        'examples',
        'images',
        'difficulty_level',
        'video_links',
        'rating',
        'created_by'
    ];

    protected $casts = [
        'images' => 'array',
        'video_links' => 'array',
        'rating' => 'decimal:2',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected $with = ['createdBy', 'categories', 'roles', 'tags'];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'tool_categories');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'tool_roles');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'tool_tags');
    }
}