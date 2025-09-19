<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Check if user has specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is owner
     */
    public function isOwner(): bool
    {
        return $this->hasRole('owner');
    }

    /**
     * Check if user is frontend developer
     */
    public function isFrontend(): bool
    {
        return $this->hasRole('frontend');
    }

    /**
     * Check if user is backend developer
     */
    public function isBackend(): bool
    {
        return $this->hasRole('backend');
    }

    /**
     * Check if user is project manager
     */
    public function isPM(): bool
    {
        return $this->hasRole('pm');
    }

    /**
     * Check if user is QA engineer
     */
    public function isQA(): bool
    {
        return $this->hasRole('qa');
    }

    /**
     * Check if user is designer
     */
    public function isDesigner(): bool
    {
        return $this->hasRole('designer');
    }

    /**
     * Get role display name
     */
    public function getRoleDisplayName(): string
    {
        return match($this->role) {
            'owner' => 'Owner',
            'frontend' => 'Frontend Developer',
            'backend' => 'Backend Developer',
            'pm' => 'Project Manager',
            'qa' => 'QA Engineer',
            'designer' => 'Designer',
            default => 'User',
        };
    }

    /**
     * Get role color for UI
     */
    public function getRoleColor(): string
    {
        return match($this->role) {
            'owner' => 'green',
            'frontend' => 'blue',
            'backend' => 'purple',
            'pm' => 'orange',
            'qa' => 'red',
            'designer' => 'pink',
            default => 'gray',
        };
    }

    /**
     * Get tools created by this user
     */
    public function tools(): HasMany
    {
        return $this->hasMany(Tool::class, 'created_by');
    }
}