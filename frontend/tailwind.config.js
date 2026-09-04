/** @type {import('tailwindcss').Config} */
export default { content: ['./index.html','./src/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#070b12', panel:'#0d1420', line:'#223047', acid:'#b6f23a', cyan:'#42d9e8', muted:'#93a4b8' }, fontFamily:{sans:['Inter','ui-sans-serif','system-ui'],mono:['JetBrains Mono','ui-monospace','monospace']} } }, plugins: [] };
