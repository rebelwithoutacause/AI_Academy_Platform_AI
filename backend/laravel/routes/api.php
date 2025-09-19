<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ToolController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::post('/login', [AuthenticatedSessionController::class, 'store']);

// Public tools routes (can view without auth)
Route::get('tools', [ToolController::class, 'index']);
Route::get('tools/{id}', [ToolController::class, 'show']);
Route::get('tools/filters/options', [ToolController::class, 'getFilterOptions']);
Route::get('categories', [ToolController::class, 'getCategories']);
Route::get('roles', [ToolController::class, 'getRoles']);
Route::get('tags', [ToolController::class, 'getTags']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'role_display' => $user->getRoleDisplayName(),
            'role_color' => $user->getRoleColor(),
        ]);
    });

    Route::get('/dashboard', [DashboardController::class, 'apiIndex']);
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    // Authenticated tools routes (create, update, delete)
    Route::post('tools', [ToolController::class, 'store']);
    Route::put('tools/{id}', [ToolController::class, 'update']);
    Route::delete('tools/{id}', [ToolController::class, 'destroy']);
    Route::post('tools/upload', [ToolController::class, 'uploadImages']);
    Route::delete('tools/images', [ToolController::class, 'deleteImage']);

    // Create categories and roles
    Route::post('categories', [ToolController::class, 'createCategory']);
    Route::post('roles', [ToolController::class, 'createRole']);
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'api',
        'timestamp' => now(),
    ]);
});