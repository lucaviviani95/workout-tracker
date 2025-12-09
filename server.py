# server.py
import http.server
import socketserver

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def guess_type(self, path):
        # Set correct MIME types
        if path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.json'):
            return 'application/json'
        if path.endswith('.css'):
            return 'text/css'
        return super().guess_type(path)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    print("Press Ctrl+C to stop")
    httpd.serve_forever()