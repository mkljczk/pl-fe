/// <reference types="vitest" />
import fs from 'node:fs';
import { URL, fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import compileTime from 'vite-plugin-compile-time';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import vitePluginRequire from 'vite-plugin-require';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const config = defineConfig(() => ({
  build: {
    assetsDir: 'packs',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'packs/assets/[name]-[hash].[ext]',
        chunkFileNames: 'packs/js/[name]-[hash].js',
        entryFileNames: 'packs/[name]-[hash].js',
      },
    },
    sourcemap: true,
  },
  assetsInclude: ['**/*.oga'],
  server: {
    port: Number(process.env.PORT ?? 3036),
  },
  plugins: [
    checker({ typescript: true }),
    // @ts-ignore
    vitePluginRequire.default(),
    compileTime(),
    createHtmlPlugin({
      template: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: false,
      },
      inject: {
        data: {
          snippets: readFileContents('custom/snippets.html'),
        },
      },
    }),
    react({
      // Use React plugin in all *.jsx and *.tsx files
      include: '**/*.{jsx,tsx}',
      babel: {
        configFile: './babel.config.cjs',
      },
    }),
    VitePWA({
      injectRegister: null,
      strategies: 'injectManifest',
      injectManifest: {
        injectionPoint: undefined,
        plugins: [
          // @ts-ignore
          compileTime(),
        ],
      },
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'pl-fe',
        short_name: 'pl-fe',
        description:
          'Web-based federated social media client, a fork of Soapbox',
        display: 'standalone',
        display_override: ['window-controls-overlay'],
        theme_color: '#d80482',
        categories: ['social'],
        share_target: {
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
          },
          action: 'share',
          method: 'GET',
        },
        shortcuts: [
          {
            name: 'Search',
            url: '/search',
            icons: [
              {
                src: '/instance/images/shortcuts/search.png',
                sizes: '192x192',
              },
            ],
          },
          {
            name: 'Notifications',
            url: '/notifications',
            icons: [
              {
                src: '/instance/images/shortcuts/notifications.png',
                sizes: '192x192',
              },
            ],
          },
          {
            name: 'Chats',
            url: '/chats',
            icons: [
              {
                src: '/instance/images/shortcuts/chats.png',
                sizes: '192x192',
              },
            ],
          },
        ],
        start_url: '/',
      },
      srcDir: 'src/service-worker',
      filename: 'sw.ts',
    }),
    viteStaticCopy({
      targets: [
        {
          src: './node_modules/twemoji/assets/svg/*',
          dest: 'packs/emoji/',
        },
        {
          src: './src/instance',
          dest: '.',
        },
        {
          src: './custom/instance',
          dest: '.',
        },
        {
          src: './node_modules/fasttext.wasm.js/dist/models/language-identification/assets/lid.176.ftz',
          dest: 'fastText/models/',
        },
        {
          src: './node_modules/fasttext.wasm.js/dist/core/fastText.common.wasm',
          dest: 'fastText/',
        },
      ],
    }),
    visualizer({
      emitFile: true,
      filename: 'report.html',
      title: 'pl-fe Bundle',
    }),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (/^\/api\//.test(req.url!)) {
            res.statusCode = 404;
            res.end('Not Found');
          } else {
            next();
          }
        });
      },
    },
  ],
  resolve: {
    alias: [
      {
        find: 'pl-fe',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/jest/test-setup.ts',
  },
}));

/** Return file as string, or return empty string if the file isn't found. */
const readFileContents = (path: string) => {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return '';
  }
};

export { config as default };
