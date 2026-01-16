import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Two modes:
 * - default (dev/build): demo app (index.html) that renders <meta-schema-widget> + mock Jmix panel
 * - lib mode (build:lib): outputs dist/meta-schema-widget.js (LitElement webcomponent) for embedding into Jmix
 */
export default defineConfig(({ mode }) => {
  const isLib = mode === "lib";

  if (isLib) {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      build: {
        lib: {
          entry: "src/main-lib.ts",
          name: "MetaSchemaWidget",
          formats: ["es"],
          fileName: () => "meta-schema-widget.js",
        },
        // bundle everything for simplest embedding
        rollupOptions: {
          external: [],
          output: {
            format: "es",
          },
        },
      },
      esbuild: {
        jsx: "automatic",
      },
    };
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
})
