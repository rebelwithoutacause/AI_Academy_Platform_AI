<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Show the dashboard.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return view('dashboard', [
            'user' => $user,
            'greeting' => "Welcome, {$user->name}! Your role: {$user->getRoleDisplayName()}.",
            'roleAccess' => $this->getRoleAccess($user),
        ]);
    }

    /**
     * Get dashboard data via API.
     */
    public function apiIndex(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_display' => $user->getRoleDisplayName(),
                'role_color' => $user->getRoleColor(),
            ],
            'greeting' => "Welcome, {$user->name}! Your role: {$user->getRoleDisplayName()}.",
            'role_access' => $this->getRoleAccess($user),
        ]);
    }

    /**
     * Get role-specific access message
     */
    private function getRoleAccess($user): string
    {
        return match($user->role) {
            'owner' => 'You have full access to all platform features including user management, analytics, and system settings.',
            'frontend' => 'You have access to frontend development tools, UI components, and design systems.',
            'backend' => 'You have access to backend development tools, APIs, databases, and server configurations.',
            'pm' => 'You have access to project management tools, team coordination, and progress tracking.',
            'qa' => 'You have access to testing tools, bug tracking, quality assurance, and test automation.',
            'designer' => 'You have access to design tools, prototyping, user experience research, and design systems.',
            default => 'You have basic access to the platform.',
        };
    }
}