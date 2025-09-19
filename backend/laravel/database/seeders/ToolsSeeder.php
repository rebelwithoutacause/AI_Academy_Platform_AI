<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Role;
use App\Models\Tool;
use App\Models\User;

class ToolsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Categories
        $categories = [
            'AI Assistant',
            'Frontend Development',
            'Backend Development',
            'Database',
            'DevOps',
            'Testing',
            'Design',
            'Project Management',
            'API Development',
            'Mobile Development',
            'Cloud Services',
            'Version Control',
            'Code Quality',
            'Documentation',
            'Monitoring',
            'Security'
        ];

        foreach ($categories as $categoryName) {
            Category::firstOrCreate(['name' => $categoryName]);
        }

        // Create Roles (based on existing user roles)
        $roles = [
            'Frontend Developer',
            'Backend Developer',
            'Full Stack Developer',
            'DevOps Engineer',
            'QA Engineer',
            'Designer',
            'Project Manager',
            'Data Engineer',
            'Mobile Developer',
            'Security Engineer'
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // Clear existing tools and their relationships
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Tool::truncate();
        \DB::table('tool_categories')->truncate();
        \DB::table('tool_roles')->truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Get first user as creator (create one if none exists)
        $user = User::first() ?? User::factory()->create();

        // Get category and role IDs for relationships
        $aiCategory = Category::where('name', 'AI Assistant')->first();
        $frontendCategory = Category::where('name', 'Frontend Development')->first();
        $backendCategory = Category::where('name', 'Backend Development')->first();
        $devopsCategory = Category::where('name', 'DevOps')->first();
        $versionControlCategory = Category::where('name', 'Version Control')->first();

        $fullStackRole = Role::where('name', 'Full Stack Developer')->first();
        $frontendRole = Role::where('name', 'Frontend Developer')->first();
        $backendRole = Role::where('name', 'Backend Developer')->first();
        $devopsRole = Role::where('name', 'DevOps Engineer')->first();

        // Create the 7 new tools
        $tools = [
            [
                'name' => 'Claude.AI',
                'link' => 'https://claude.ai',
                'documentation' => 'https://docs.anthropic.com/claude',
                'description' => 'An AI assistant developed by Anthropic for conversations, text generation, and coding assistance. Claude excels at understanding context and providing helpful, accurate responses.',
                'usage' => 'Use Claude for code reviews, debugging, writing documentation, generating test cases, and getting explanations of complex programming concepts.',
                'examples' => 'Input: "Help me debug this Python function" | Output: Detailed analysis with suggested fixes and explanations',
                'difficulty_level' => 'Beginner',
                'rating' => 5.0,
                'created_by' => $user->id,
                'categories' => [$aiCategory->id],
                'roles' => [$fullStackRole->id, $frontendRole->id, $backendRole->id]
            ],
            [
                'name' => 'ChatGPT',
                'link' => 'https://chat.openai.com',
                'documentation' => 'https://help.openai.com/en/collections/3742473-chatgpt',
                'description' => 'OpenAI\'s conversational AI model that can assist with coding, writing, analysis, and creative tasks. Excellent for brainstorming and problem-solving.',
                'usage' => 'Ideal for code generation, debugging assistance, writing technical documentation, and learning new programming concepts through interactive conversations.',
                'examples' => 'Input: "Create a React component for user authentication" | Output: Complete component with hooks and validation',
                'difficulty_level' => 'Beginner',
                'rating' => 4.8,
                'created_by' => $user->id,
                'categories' => [$aiCategory->id],
                'roles' => [$fullStackRole->id, $frontendRole->id, $backendRole->id]
            ],
            [
                'name' => 'GetMocha',
                'link' => 'https://mochajs.org',
                'documentation' => 'https://mochajs.org/#getting-started',
                'description' => 'A feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun.',
                'usage' => 'Use Mocha for unit testing, integration testing, and test-driven development in JavaScript and Node.js applications.',
                'examples' => 'Input: describe("Calculator", function() { it("should add numbers", ...} | Output: Structured test suite with assertions',
                'difficulty_level' => 'Intermediate',
                'rating' => 4.5,
                'created_by' => $user->id,
                'categories' => [$frontendCategory->id, $backendCategory->id],
                'roles' => [$fullStackRole->id, $frontendRole->id, $backendRole->id]
            ],
            [
                'name' => 'GitHub Copilot',
                'link' => 'https://github.com/features/copilot',
                'documentation' => 'https://docs.github.com/en/copilot',
                'description' => 'AI-powered code completion tool that suggests whole lines or blocks of code as you type. Trained on billions of lines of code.',
                'usage' => 'Install as VS Code extension to get real-time code suggestions, auto-completion, and coding assistance across multiple languages.',
                'examples' => 'Input: "// Function to validate email" | Output: Complete email validation function with regex and error handling',
                'difficulty_level' => 'Beginner',
                'rating' => 4.7,
                'created_by' => $user->id,
                'categories' => [$frontendCategory->id, $backendCategory->id],
                'roles' => [$fullStackRole->id, $frontendRole->id, $backendRole->id]
            ],
            [
                'name' => 'GitHub',
                'link' => 'https://github.com',
                'documentation' => 'https://docs.github.com',
                'description' => 'Web-based platform for version control and collaboration using Git. Host repositories, manage projects, and collaborate with teams worldwide.',
                'usage' => 'Create repositories, manage code versions, collaborate on projects, track issues, and deploy applications using GitHub Actions.',
                'examples' => 'Input: git push origin main | Output: Code changes synchronized to remote repository with full history tracking',
                'difficulty_level' => 'Intermediate',
                'rating' => 4.9,
                'created_by' => $user->id,
                'categories' => [$versionControlCategory->id, $frontendCategory->id, $backendCategory->id],
                'roles' => [$fullStackRole->id, $frontendRole->id, $backendRole->id, $devopsRole->id]
            ],
            [
                'name' => 'Docker',
                'link' => 'https://www.docker.com',
                'documentation' => 'https://docs.docker.com',
                'description' => 'Platform for containerizing applications, ensuring consistent environments across development, testing, and production.',
                'usage' => 'Create containers for applications, manage microservices, ensure environment consistency, and simplify deployment processes.',
                'examples' => 'Input: docker run -p 3000:3000 myapp | Output: Application running in isolated container accessible on port 3000',
                'difficulty_level' => 'Advanced',
                'rating' => 4.6,
                'created_by' => $user->id,
                'categories' => [$devopsCategory->id, $backendCategory->id],
                'roles' => [$fullStackRole->id, $backendRole->id, $devopsRole->id]
            ],
            [
                'name' => 'Developer Tools',
                'link' => 'https://developer.chrome.com/docs/devtools/',
                'documentation' => 'https://developer.chrome.com/docs/devtools/',
                'description' => 'Built-in browser tools for debugging, profiling, and optimizing web applications. Essential for frontend development and performance analysis.',
                'usage' => 'Debug JavaScript, inspect HTML/CSS, monitor network requests, analyze performance, and test responsive designs.',
                'examples' => 'Input: F12 in browser | Output: Full debugging interface with console, network, performance, and element inspection tools',
                'difficulty_level' => 'Intermediate',
                'rating' => 4.8,
                'created_by' => $user->id,
                'categories' => [$frontendCategory->id],
                'roles' => [$fullStackRole->id, $frontendRole->id]
            ]
        ];

        foreach ($tools as $toolData) {
            $categories = $toolData['categories'];
            $roles = $toolData['roles'];
            unset($toolData['categories'], $toolData['roles']);

            $tool = Tool::create($toolData);

            // Attach categories and roles
            $tool->categories()->attach($categories);
            $tool->roles()->attach($roles);
        }
    }
}