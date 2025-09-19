@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-10">
            <div class="card">
                <div class="card-header">{{ __('Dashboard') }}</div>

                <div class="card-body">
                    <div class="alert alert-success">
                        {{ $greeting }}
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <h5>User Information</h5>
                            <ul class="list-group">
                                <li class="list-group-item">
                                    <strong>Name:</strong> {{ $user->name }}
                                </li>
                                <li class="list-group-item">
                                    <strong>Email:</strong> {{ $user->email }}
                                </li>
                                <li class="list-group-item">
                                    <strong>Role:</strong>
                                    <span class="badge bg-{{ $user->getRoleColor() }}">{{ $user->getRoleDisplayName() }}</span>
                                </li>
                                <li class="list-group-item">
                                    <strong>User ID:</strong> #{{ $user->id }}
                                </li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h5>Current Time</h5>
                            <p class="lead" id="current-time">{{ now()->format('Y-m-d H:i:s') }}</p>

                            <div class="alert alert-info">
                                <strong>{{ $user->getRoleDisplayName() }} Access:</strong><br>
                                {{ $roleAccess }}
                            </div>
                        </div>
                    </div>

                    <hr>

                    <h5>Role-Based Quick Actions</h5>
                    <div class="row">
                        @if($user->isOwner())
                            <div class="col-md-4 mb-3">
                                <div class="card bg-success text-white">
                                    <div class="card-body">
                                        <h6>👑 Admin Panel</h6>
                                        <p class="small">Manage users and system settings</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card bg-info text-white">
                                    <div class="card-body">
                                        <h6>📊 Analytics</h6>
                                        <p class="small">View platform usage statistics</p>
                                    </div>
                                </div>
                            </div>
                        @endif

                        @if($user->isFrontend())
                            <div class="col-md-4 mb-3">
                                <div class="card bg-primary text-white">
                                    <div class="card-body">
                                        <h6>🎨 UI Components</h6>
                                        <p class="small">Browse and test UI elements</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card bg-info text-white">
                                    <div class="card-body">
                                        <h6>📱 Design System</h6>
                                        <p class="small">Access design tokens and guidelines</p>
                                    </div>
                                </div>
                            </div>
                        @endif

                        @if($user->isBackend())
                            <div class="col-md-4 mb-3">
                                <div class="card bg-dark text-white">
                                    <div class="card-body">
                                        <h6>🔧 API Documentation</h6>
                                        <p class="small">Browse API endpoints and schemas</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card bg-secondary text-white">
                                    <div class="card-body">
                                        <h6>🗄️ Database Tools</h6>
                                        <p class="small">Manage database and migrations</p>
                                    </div>
                                </div>
                            </div>
                        @endif

                        @if($user->isPM())
                            <div class="col-md-4 mb-3">
                                <div class="card bg-warning text-dark">
                                    <div class="card-body">
                                        <h6>📋 Project Board</h6>
                                        <p class="small">Track tasks and milestones</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card bg-info text-white">
                                    <div class="card-body">
                                        <h6>📈 Reports</h6>
                                        <p class="small">Generate progress reports</p>
                                    </div>
                                </div>
                            </div>
                        @endif

                        @if($user->isQA())
                            <div class="col-md-4 mb-3">
                                <div class="card bg-danger text-white">
                                    <div class="card-body">
                                        <h6>🐛 Bug Tracker</h6>
                                        <p class="small">Report and track issues</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card bg-warning text-dark">
                                    <div class="card-body">
                                        <h6>🧪 Test Suites</h6>
                                        <p class="small">Run automated tests</p>
                                    </div>
                                </div>
                            </div>
                        @endif

                        @if($user->isDesigner())
                            <div class="col-md-4 mb-3">
                                <div class="card" style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white;">
                                    <div class="card-body">
                                        <h6>🎨 Design Tools</h6>
                                        <p class="small">Access design software and assets</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card" style="background: linear-gradient(45deg, #667eea, #764ba2); color: white;">
                                    <div class="card-body">
                                        <h6>🖼️ Prototypes</h6>
                                        <p class="small">View and create prototypes</p>
                                    </div>
                                </div>
                            </div>
                        @endif

                        <!-- Common actions for all roles -->
                        <div class="col-md-4 mb-3">
                            <div class="card bg-light">
                                <div class="card-body">
                                    <h6>🔧 AI Tools</h6>
                                    <p class="small">Browse available AI tools</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    // Update time every second
    setInterval(function() {
        document.getElementById('current-time').textContent = new Date().toLocaleString();
    }, 1000);
</script>
@endsection