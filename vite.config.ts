import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "GSphere - UPSC Newspaper Analysis",
        short_name: "GSphere",
        description: "Transform daily newspapers into smart UPSC notes. AI-powered analysis, syllabus mapping, and progress tracking for efficient exam preparation.",
        theme_color: "#1A1F2C",
        background_color: "#1A1F2C",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "https://storage.googleapis.com/gpt-engineer-file-uploads/KSfmSPMjEnTQXYLWaPGgpqUDfU83/uploads/1761406231794-Picture 1.jpg",
            sizes: "192x192",
            type: "image/jpeg",
            purpose: "any maskable"
          },
          {
            src: "https://storage.googleapis.com/gpt-engineer-file-uploads/KSfmSPMjEnTQXYLWaPGgpqUDfU83/uploads/1761406231794-Picture 1.jpg",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
