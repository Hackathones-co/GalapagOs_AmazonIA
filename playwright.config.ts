import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: './tests', // Default test directory
  // use: {
  //   baseURL: 'http://localhost:8080',
  // },
});
