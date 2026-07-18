# GitHub to Vercel Auto Deploy

Project ab Vercel ke liye ready hai.

## Required files

- `index.html`
- `styles.css`
- `script.js`
- `vercel.json`
- `.vercelignore`

## Setup steps

1. GitHub par ek repo banao.
2. Is project ke files us repo me push karo.
3. [Vercel](https://vercel.com/) me login karo.
4. `Add New Project` par click karo.
5. GitHub connect karo agar pehle se connected nahi hai.
6. Apna repo select karo.
7. Build settings ko default rehne do.
8. Deploy button par click karo.

## Auto deploy kaise chalega

- `main` branch par har push ke baad Vercel naya production deploy karega.
- Pull requests ya alag branches par preview deployments mil sakte hain.

## Notes

- Yeh static app hai, isliye koi backend setup required nahi hai.
- `vercel.json` app ko clean URLs aur SPA-style routing ke saath serve karta hai.
