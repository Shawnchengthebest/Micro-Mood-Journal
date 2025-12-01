# Deploying Micro Mood Journal to Vercel

This repository is a static site (HTML/CSS/JS). The repository includes a Vercel config and a GitHub Actions workflow that will deploy the site to Vercel when you push to `main` — once you provide the required Vercel secrets.

Steps to finish deployment:

1. Create a Vercel account
   - Visit https://vercel.com and sign up (you can sign in with GitHub).

2. Create a new Project in Vercel (recommended)
   - You can import from GitHub and select this repository.
   - Vercel will auto-detect a static site; no build step is required.

3. Obtain Vercel Token and IDs (for GitHub Actions)
   - Token: Go to https://vercel.com/account/tokens and create a token.
   - Org ID and Project ID: After creating/importing the project you can find these in Project Settings → General → Project ID and Organization Settings → ID.

4. Add GitHub Repository Secrets
   - In your GitHub repository: Settings → Secrets and variables → Actions → New repository secret
     - `VERCEL_TOKEN` = your token from step 3
     - `VERCEL_ORG_ID` = your Vercel organization ID
     - `VERCEL_PROJECT_ID` = your Vercel project ID

5. Push to `main`
   - The included GitHub Action will automatically deploy on push to `main`.

Alternative: Deploy locally using the Vercel CLI

1. Install or run Vercel via npx:

```bash
npx vercel login
npx vercel --prod
```

For non-interactive deployment you can use `npx vercel --token $VERCEL_TOKEN --prod`.

Notes & Security
- Do NOT commit API keys or tokens to the repository. Use GitHub Secrets or `localStorage` at runtime for developer keys.
- The repo includes `vercel.json` which instructs Vercel to serve `index.html` as a static site.

If you'd like, I can: add a friendly GitHub Actions status badge to the README, or attempt an immediate CLI deploy from this environment (I will need a Vercel token to run non-interactively). Which would you prefer?
