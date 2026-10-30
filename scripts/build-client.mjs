import { build } from 'esbuild';
await build({ entryPoints: ['wwwroot/js/game/main.js'], bundle: true, format: 'esm', outfile: 'wwwroot/dist/game.js', minify: true, target: 'es2022' });
