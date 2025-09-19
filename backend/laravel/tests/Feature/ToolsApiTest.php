<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tool;
use App\Models\Category;
use App\Models\Role;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class ToolsApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'frontend'
        ]);
    }

    /** @test */
    public function can_get_all_tools_without_authentication()
    {
        $category = Category::factory()->create(['name' => 'Testing']);
        $role = Role::factory()->create(['name' => 'Tester']);

        $tool = Tool::factory()->create([
            'name' => 'Test Tool',
            'created_by' => $this->user->id
        ]);

        $tool->categories()->attach($category->id);
        $tool->roles()->attach($role->id);

        $response = $this->getJson('/api/tools');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'link',
                            'description',
                            'usage',
                            'difficulty_level',
                            'rating',
                            'categories',
                            'roles',
                            'tags',
                            'created_by'
                        ]
                    ]
                ]);
    }

    /** @test */
    public function can_get_single_tool()
    {
        $tool = Tool::factory()->create([
            'name' => 'Single Test Tool',
            'created_by' => $this->user->id
        ]);

        $response = $this->getJson("/api/tools/{$tool->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'name' => 'Single Test Tool'
                ]);
    }

    /** @test */
    public function can_create_tool_when_authenticated()
    {
        Sanctum::actingAs($this->user);

        $category = Category::factory()->create(['name' => 'Development']);
        $role = Role::factory()->create(['name' => 'Developer']);

        $toolData = [
            'name' => 'New API Tool',
            'link' => 'https://example.com',
            'documentation' => 'https://docs.example.com',
            'description' => 'A powerful API tool for developers',
            'usage' => 'Install and configure according to docs',
            'examples' => 'Example usage scenarios',
            'difficulty_level' => 'Intermediate',
            'video_links' => ['https://youtube.com/watch?v=example'],
            'rating' => 4.5,
            'categories' => [$category->id],
            'roles' => [$role->id],
            'tags' => ['api', 'development', 'testing']
        ];

        $response = $this->postJson('/api/tools', $toolData);

        $response->assertStatus(201)
                ->assertJson([
                    'name' => 'New API Tool',
                    'difficulty_level' => 'Intermediate',
                    'rating' => 4.5
                ]);

        $this->assertDatabaseHas('tools', [
            'name' => 'New API Tool',
            'difficulty_level' => 'Intermediate',
            'rating' => 4.5
        ]);
    }

    /** @test */
    public function cannot_create_tool_without_authentication()
    {
        $toolData = [
            'name' => 'Unauthorized Tool',
            'link' => 'https://example.com',
            'description' => 'Should not be created',
            'usage' => 'Cannot be used'
        ];

        $response = $this->postJson('/api/tools', $toolData);

        $response->assertStatus(401);
    }

    /** @test */
    public function can_update_own_tool()
    {
        Sanctum::actingAs($this->user);

        $tool = Tool::factory()->create([
            'name' => 'Original Tool',
            'created_by' => $this->user->id,
            'difficulty_level' => 'Beginner'
        ]);

        $updateData = [
            'name' => 'Updated Tool Name',
            'link' => 'https://updated-example.com',
            'description' => 'Updated description',
            'usage' => 'Updated usage instructions',
            'difficulty_level' => 'Advanced',
            'rating' => 4.8
        ];

        $response = $this->putJson("/api/tools/{$tool->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'name' => 'Updated Tool Name',
                    'difficulty_level' => 'Advanced',
                    'rating' => 4.8
                ]);

        $this->assertDatabaseHas('tools', [
            'id' => $tool->id,
            'name' => 'Updated Tool Name',
            'difficulty_level' => 'Advanced'
        ]);
    }

    /** @test */
    public function cannot_update_others_tool()
    {
        $otherUser = User::factory()->create();
        Sanctum::actingAs($this->user);

        $tool = Tool::factory()->create([
            'name' => 'Other User Tool',
            'created_by' => $otherUser->id
        ]);

        $updateData = [
            'name' => 'Hacked Tool',
            'link' => 'https://malicious.com',
            'description' => 'Should not work',
            'usage' => 'Unauthorized update'
        ];

        $response = $this->putJson("/api/tools/{$tool->id}", $updateData);

        $response->assertStatus(403);
    }

    /** @test */
    public function can_delete_own_tool()
    {
        Sanctum::actingAs($this->user);

        $tool = Tool::factory()->create([
            'name' => 'Tool To Delete',
            'created_by' => $this->user->id
        ]);

        $response = $this->deleteJson("/api/tools/{$tool->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Tool deleted successfully'
                ]);

        $this->assertDatabaseMissing('tools', [
            'id' => $tool->id
        ]);
    }

    /** @test */
    public function cannot_delete_others_tool()
    {
        $otherUser = User::factory()->create();
        Sanctum::actingAs($this->user);

        $tool = Tool::factory()->create([
            'name' => 'Protected Tool',
            'created_by' => $otherUser->id
        ]);

        $response = $this->deleteJson("/api/tools/{$tool->id}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('tools', [
            'id' => $tool->id
        ]);
    }

    /** @test */
    public function can_filter_tools_by_difficulty()
    {
        $beginnerTool = Tool::factory()->create([
            'name' => 'Beginner Tool',
            'difficulty_level' => 'Beginner',
            'created_by' => $this->user->id
        ]);

        $advancedTool = Tool::factory()->create([
            'name' => 'Advanced Tool',
            'difficulty_level' => 'Advanced',
            'created_by' => $this->user->id
        ]);

        $response = $this->getJson('/api/tools?difficulty=Beginner');

        $response->assertStatus(200)
                ->assertJsonCount(1, 'data')
                ->assertJson([
                    'data' => [
                        ['name' => 'Beginner Tool']
                    ]
                ]);
    }

    /** @test */
    public function can_filter_tools_by_rating()
    {
        $highRatedTool = Tool::factory()->create([
            'name' => 'High Rated Tool',
            'rating' => 4.8,
            'created_by' => $this->user->id
        ]);

        $lowRatedTool = Tool::factory()->create([
            'name' => 'Low Rated Tool',
            'rating' => 2.5,
            'created_by' => $this->user->id
        ]);

        $response = $this->getJson('/api/tools?min_rating=4.0');

        $response->assertStatus(200)
                ->assertJsonCount(1, 'data')
                ->assertJson([
                    'data' => [
                        ['name' => 'High Rated Tool']
                    ]
                ]);
    }

    /** @test */
    public function can_search_tools_by_name_and_description()
    {
        $reactTool = Tool::factory()->create([
            'name' => 'React Developer Tools',
            'description' => 'Tools for React development',
            'created_by' => $this->user->id
        ]);

        $vueTool = Tool::factory()->create([
            'name' => 'Vue.js Framework',
            'description' => 'Vue.js development framework',
            'created_by' => $this->user->id
        ]);

        $response = $this->getJson('/api/tools?search=React');

        $response->assertStatus(200)
                ->assertJsonCount(1, 'data')
                ->assertJson([
                    'data' => [
                        ['name' => 'React Developer Tools']
                    ]
                ]);
    }

    /** @test */
    public function validates_tool_creation_data()
    {
        Sanctum::actingAs($this->user);

        $invalidData = [
            'name' => '', // required
            'link' => 'not-a-url', // must be valid URL
            'description' => '', // required
            'usage' => '', // required
            'difficulty_level' => 'Invalid', // must be valid enum
            'rating' => 10 // must be between 0-5
        ];

        $response = $this->postJson('/api/tools', $invalidData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors([
                    'name',
                    'link',
                    'description',
                    'usage',
                    'difficulty_level',
                    'rating'
                ]);
    }

    /** @test */
    public function can_get_filter_options()
    {
        $category = Category::factory()->create(['name' => 'Test Category']);
        $role = Role::factory()->create(['name' => 'Test Role']);
        $tag = Tag::factory()->create(['name' => 'test-tag']);

        $response = $this->getJson('/api/tools/filters/options');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'categories',
                    'roles',
                    'tags',
                    'difficulty_levels',
                    'sort_options'
                ])
                ->assertJson([
                    'difficulty_levels' => ['Beginner', 'Intermediate', 'Advanced']
                ]);
    }

    /** @test */
    public function can_sort_tools_by_different_fields()
    {
        $toolA = Tool::factory()->create([
            'name' => 'A Tool',
            'rating' => 3.5,
            'created_by' => $this->user->id
        ]);

        $toolB = Tool::factory()->create([
            'name' => 'B Tool',
            'rating' => 4.5,
            'created_by' => $this->user->id
        ]);

        // Sort by rating descending
        $response = $this->getJson('/api/tools?sort_by=rating&sort_order=desc');

        $response->assertStatus(200);
        $tools = $response->json('data');
        $this->assertEquals('B Tool', $tools[0]['name']);
        $this->assertEquals('A Tool', $tools[1]['name']);
    }
}