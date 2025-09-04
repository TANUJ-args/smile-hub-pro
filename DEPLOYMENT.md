# Deployment on Render

## Static Frontend
This project is configured for static deployment on Render.

### Steps:
1. Push your code to a GitHub repository.
2. Go to [Render.com](https://render.com/), create an account, and click "New Web Service".
3. Connect your GitHub repo and select this project.
4. Render will auto-detect the `render.yaml` and set up the static site.
5. Your site will be deployed at a Render URL.

### Notes
- The build command is `npm install && npm run build`.
- The published directory is `dist`.
- All routes are rewritten to `index.html` for SPA support.

## Backend/API & Database (Optional)
If you need a backend (Node.js/Express) and a Neon Postgres database, let me know and I can scaffold that for you.
