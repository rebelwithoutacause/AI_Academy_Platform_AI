<?php
?>
<!DOCTYPE html>
<html>
<head>
    <title>AI Tools Platform - Backend</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f8f9fa; }
        h1 { color: #dc3545; }
        .status { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #dc3545; }
    </style>
</head>
<body>
    <h1>🔧 Laravel Backend</h1>
    <div class="status">
        <p><strong>Status:</strong> ✅ PHP Server Running!</p>
        <p><strong>Time:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
        <p><strong>PHP Version:</strong> <?php echo phpversion(); ?></p>
        <p><strong>Backend Port:</strong> 8000</p>
    </div>
    <hr>
    <p>📡 Backend API is ready!</p>
    <p>🌐 Frontend: <a href="http://localhost:8080">http://localhost:8080</a></p>
</body>
</html>