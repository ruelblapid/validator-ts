import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'happy-dom', // Emulates browser environments for React/Vue tests
		globals: true,
	},
});
