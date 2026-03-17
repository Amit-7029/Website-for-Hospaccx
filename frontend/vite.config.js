import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        gallery: resolve(__dirname, "gallery.html"),
        blog: resolve(__dirname, "blog.html"),
        treatments: resolve(__dirname, "treatments.html"),
        doctorProfile: resolve(__dirname, "doctor-profile.html"),
        insurance: resolve(__dirname, "insurance.html")
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  },
  preview: {
    host: "0.0.0.0",
    port: 4173
  }
});
