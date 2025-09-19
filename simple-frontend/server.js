const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>AI Tools Platform</title>
        <style>
          body { font-family: Arial; padding: 20px; background: #f5f5f5; }
          h1 { color: #2563eb; }
          .status { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>🚀 AI Tools Platform</h1>
        <div class="status">
          <p><strong>Status:</strong> ✅ Running Successfully!</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Frontend Port:</strong> 8080</p>
          <p><strong>Backend Port:</strong> 8000</p>
        </div>
        <hr>
        <p>✨ Platform is ready! Next step: Set up Laravel and Next.js projects</p>
        <p>🔗 Backend: <a href="http://localhost:8000">http://localhost:8000</a></p>
      </body>
    </html>
  `);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Frontend server running on port 3000');
});