<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Tools Platform API</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            color: white;
            max-width: 600px;
            padding: 2rem;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 300;
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .api-info {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 1.5rem;
            margin: 2rem 0;
            backdrop-filter: blur(10px);
        }
        .endpoint {
            font-family: 'Courier New', monospace;
            background: rgba(0, 0, 0, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 5px;
            margin: 0.5rem 0;
            display: inline-block;
        }
        .status-ok {
            color: #4ade80;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 AI Tools Platform</h1>
        <p>Laravel API Backend is running</p>

        <div class="api-info">
            <h3>API Status: <span class="status-ok">✅ Online</span></h3>
            <div>Health Check: <code class="endpoint">GET /health</code></div>
            <div>Login: <code class="endpoint">POST /api/login</code></div>
            <div>User Info: <code class="endpoint">GET /api/user</code></div>
        </div>

        <p>
            Frontend available at: <strong>localhost:8080</strong><br>
            API documentation: <strong>localhost:8000/api</strong>
        </p>
    </div>
</body>
</html>