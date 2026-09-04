# VulnForge Frontend

React 19 + TypeScript + Vite + Tailwind CSS frontend with public/auth routes,
commerce and support pages, mission workbenches, defense mode, and admin reset.

The frontend is a client layer, not a security boundary. Treat every browser-controlled value as attacker-controlled and keep sensitive authorization and lab behavior in the backend.

Run from the repository root with `npm run dev`, or here with `npm run dev`.
Set `VITE_API_URL` when the API is not available through the Vite development proxy.
