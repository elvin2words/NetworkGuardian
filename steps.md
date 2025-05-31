npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install @tanstack/react-query react-router-dom tailwindcss postcss autoprefixer
npm install -D eslint prettier typescript @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
mkdir src/{pages,components,hooks,lib}
npm install react-router-dom
npm run dev

cd ..
git --version
git init

mkdir backend
cd backend
npm init -y
npm install express cors dotenv
npm install -D typescript ts-node-dev @types/node @types/express
npm install express cors dotenv @prisma/client
npm install -D typescript ts-node-dev prisma  @types/node @types/express
npx tsc --init
mkdir src
touch src/index.ts
npx ts-node-dev src/index.ts
npm run dev

---

git init

git add .
git config --global user.email eemazwi2@gmail.com
git config --global user.name "Elvin Mazwimairi"
git commit -m "IntialDesign"
git remote add origin https://github.com/elvin2words/NetworkGuardian.git
git branch -M main
git push -u origin main

---
