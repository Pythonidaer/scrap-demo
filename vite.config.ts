import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** GitHub project pages need /<repo>/; user site *.github.io uses /. Set BASE_PATH when building for Pages. */
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  plugins: [react()],
  base,
});
