<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use App\Models\Category;
use App\Models\Role;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ToolController extends Controller
{
    /**
     * Display a listing of tools with advanced filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tool::with(['categories', 'roles', 'tags', 'createdBy']);

        // Apply filters
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('usage', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('category') && $request->category) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        if ($request->has('role') && $request->role) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        if ($request->has('tag') && $request->tag) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('name', $request->tag);
            });
        }

        // New filters for enhanced functionality
        if ($request->has('difficulty') && $request->difficulty) {
            $query->where('difficulty_level', $request->difficulty);
        }

        if ($request->has('min_rating') && $request->min_rating) {
            $query->where('rating', '>=', $request->min_rating);
        }

        if ($request->has('has_videos') && $request->has_videos === 'true') {
            $query->whereNotNull('video_links')
                  ->where('video_links', '!=', '[]');
        }

        // Sorting options
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSorts = ['created_at', 'name', 'rating', 'difficulty_level'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = min($request->get('per_page', 20), 100); // Max 100 items per page
        $tools = $query->paginate($perPage);

        return response()->json($tools);
    }

    /**
     * Get filter options for frontend
     */
    public function getFilterOptions(): JsonResponse
    {
        return response()->json([
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'roles' => Role::orderBy('name')->get(['id', 'name']),
            'tags' => Tag::orderBy('name')->get(['id', 'name']),
            'difficulty_levels' => ['Beginner', 'Intermediate', 'Advanced'],
            'sort_options' => [
                ['value' => 'created_at', 'label' => 'Date Created'],
                ['value' => 'name', 'label' => 'Name'],
                ['value' => 'rating', 'label' => 'Rating'],
                ['value' => 'difficulty_level', 'label' => 'Difficulty']
            ]
        ]);
    }

    /**
     * Store a newly created tool
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'link' => 'required|url',
            'documentation' => 'nullable|string',
            'description' => 'required|string',
            'usage' => 'required|string',
            'examples' => 'nullable|string',
            'difficulty_level' => 'nullable|in:Beginner,Intermediate,Advanced',
            'video_links' => 'nullable|array',
            'video_links.*' => 'url',
            'rating' => 'nullable|numeric|min:0|max:5',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'categories' => 'nullable|array',
            'categories.*' => 'integer|exists:categories,id',
            'roles' => 'nullable|array',
            'roles.*' => 'integer|exists:roles,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tool = Tool::create([
            'name' => $request->name,
            'link' => $request->link,
            'documentation' => $request->documentation,
            'description' => $request->description,
            'usage' => $request->usage,
            'examples' => $request->examples,
            'difficulty_level' => $request->difficulty_level,
            'video_links' => $request->video_links ?: [],
            'rating' => $request->rating ?: 0,
            'images' => $request->images ?: [],
            'created_by' => $request->user()->id,
        ]);

        // Attach categories
        if ($request->has('categories')) {
            $tool->categories()->attach($request->categories);
        }

        // Attach roles
        if ($request->has('roles')) {
            $tool->roles()->attach($request->roles);
        }

        // Handle tags (create if not exists)
        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                if (!empty($tagName)) {
                    $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                    $tagIds[] = $tag->id;
                }
            }
            $tool->tags()->attach($tagIds);
        }

        return response()->json($tool->load(['categories', 'roles', 'tags', 'createdBy']), 201);
    }

    /**
     * Display the specified tool
     */
    public function show(string $id): JsonResponse
    {
        $tool = Tool::with(['categories', 'roles', 'tags', 'createdBy'])->find($id);

        if (!$tool) {
            return response()->json(['error' => 'Tool not found'], 404);
        }

        return response()->json($tool);
    }

    /**
     * Update the specified tool
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tool = Tool::find($id);

        if (!$tool) {
            return response()->json(['error' => 'Tool not found'], 404);
        }

        // Check if user owns the tool
        if ($tool->created_by !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'link' => 'required|url',
            'documentation' => 'nullable|string',
            'description' => 'required|string',
            'usage' => 'required|string',
            'examples' => 'nullable|string',
            'difficulty_level' => 'nullable|in:Beginner,Intermediate,Advanced',
            'video_links' => 'nullable|array',
            'video_links.*' => 'url',
            'rating' => 'nullable|numeric|min:0|max:5',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'categories' => 'nullable|array',
            'categories.*' => 'integer|exists:categories,id',
            'roles' => 'nullable|array',
            'roles.*' => 'integer|exists:roles,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tool->update([
            'name' => $request->name,
            'link' => $request->link,
            'documentation' => $request->documentation,
            'description' => $request->description,
            'usage' => $request->usage,
            'examples' => $request->examples,
            'difficulty_level' => $request->difficulty_level,
            'video_links' => $request->video_links ?: [],
            'rating' => $request->rating ?: $tool->rating,
            'images' => $request->images ?: [],
        ]);

        // Sync categories
        if ($request->has('categories')) {
            $tool->categories()->sync($request->categories);
        }

        // Sync roles
        if ($request->has('roles')) {
            $tool->roles()->sync($request->roles);
        }

        // Handle tags
        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                if (!empty($tagName)) {
                    $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                    $tagIds[] = $tag->id;
                }
            }
            $tool->tags()->sync($tagIds);
        }

        return response()->json($tool->load(['categories', 'roles', 'tags', 'createdBy']));
    }

    /**
     * Remove the specified tool
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tool = Tool::find($id);

        if (!$tool) {
            return response()->json(['error' => 'Tool not found'], 404);
        }

        // Check if user owns the tool
        if ($tool->created_by !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete associated images from storage
        if ($tool->images) {
            foreach ($tool->images as $imagePath) {
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
        }

        $tool->delete();

        return response()->json(['message' => 'Tool deleted successfully']);
    }

    /**
     * Upload images for a tool
     */
    public function uploadImages(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'images' => 'required|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $uploadedPaths = [];

        foreach ($request->file('images') as $image) {
            $path = $image->store('tools', 'public');
            $uploadedPaths[] = $path;
        }

        return response()->json(['urls' => $uploadedPaths]);
    }

    /**
     * Delete an image from a tool
     */
    public function deleteImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tool_id' => 'required|integer|exists:tools,id',
            'image_url' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tool = Tool::find($request->tool_id);

        // Check if user owns the tool
        if ($tool->created_by !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $images = $tool->images ?: [];
        $updatedImages = array_filter($images, function ($img) use ($request) {
            return $img !== $request->image_url;
        });

        $tool->update(['images' => array_values($updatedImages)]);

        // Delete file from storage
        if (Storage::disk('public')->exists($request->image_url)) {
            Storage::disk('public')->delete($request->image_url);
        }

        return response()->json([
            'message' => 'Image deleted successfully',
            'images' => $tool->fresh()->images
        ]);
    }

    /**
     * Get all categories
     */
    public function getCategories(): JsonResponse
    {
        return response()->json(Category::all());
    }

    /**
     * Get all roles
     */
    public function getRoles(): JsonResponse
    {
        return response()->json(Role::all());
    }

    /**
     * Get all tags
     */
    public function getTags(): JsonResponse
    {
        return response()->json(Tag::all());
    }

    /**
     * Create a new category
     */
    public function createCategory(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = Category::create([
            'name' => $request->name
        ]);

        return response()->json($category, 201);
    }

    /**
     * Create a new role
     */
    public function createRole(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role = Role::create([
            'name' => $request->name
        ]);

        return response()->json($role, 201);
    }
}