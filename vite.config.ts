import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { join } from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { PreprocessorGroup } from 'svelte/compiler';
import basicSsl from '@vitejs/plugin-basic-ssl';

const __dirname = import.meta.dirname;
const layoutMdsvex = join(__dirname, './src/lib/Layout.svelte');

export default defineConfig({
	plugins: [
		sveltekit({
			// Consult https://svelte.dev/docs/kit/integrations
			// for more information about preprocessors
			preprocess: [vitePreprocess(), mdsvex({ layout: layoutMdsvex }) as PreprocessorGroup],
			extensions: ['.svelte', '.svx'],
			adapter: adapter({
				// default options are shown. On some platforms
				// these options are set automatically — see below
				pages: 'build',
				assets: 'build',
				precompress: false,
				strict: true,
				fallback: '404.html',
			}),
		}),
		basicSsl(),
	],
});
