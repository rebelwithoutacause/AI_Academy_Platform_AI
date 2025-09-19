<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Owner
        User::create([
            'name' => 'Ivan Ivanov',
            'email' => 'ivan.ivanov@company.com',
            'role' => 'owner',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Frontend Developer
        User::create([
            'name' => 'Elena Petrova',
            'email' => 'elena.petrova@company.com',
            'role' => 'frontend',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Backend Developer
        User::create([
            'name' => 'Peter Georgiev',
            'email' => 'peter.georgiev@company.com',
            'role' => 'backend',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Project Manager
        User::create([
            'name' => 'Maria Dimitrova',
            'email' => 'maria.dimitrova@company.com',
            'role' => 'pm',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // QA Engineer
        User::create([
            'name' => 'Stefan Nikolov',
            'email' => 'stefan.nikolov@company.com',
            'role' => 'qa',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Designer
        User::create([
            'name' => 'Anna Petrova',
            'email' => 'anna.petrova@company.com',
            'role' => 'designer',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
    }
}