import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // You already have this

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Your existing alias
    },
  },
  // Add the server configuration block here
  server: {
    proxy: {
      // Any request from your frontend starting with '/api'
      // during development (e.g., fetch('/api/users'))
      // will be forwarded to your local Flask backend.
      "/api": {
        target: "http://localhost:8080", // The address of your local Flask server
        changeOrigin: true, // Recommended for virtual hosted sites, good practice
        // secure: false,      // Uncomment if your Flask server is HTTPS with self-signed cert (not typical for local dev)
        // rewrite: (path) => path.replace(/^\/api/, '') // Use this ONLY if your Flask routes DO NOT start with /api.
        // If your Flask routes are like @app.route('/api/users'),
        // then you DO NOT need this rewrite line.
        // If Flask routes are @app.route('/users'), then you would need it.
      },
    },
  },
});
