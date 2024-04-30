import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/library/main.ts',
      name: 'apng-renderer',
      fileName: 'apng-renderer',
    },
  },
  plugins: [dts()],
});
