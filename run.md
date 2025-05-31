The error:

```
'NODE_ENV' is not recognized as an internal or external command,
operable program or batch file.
```

happens because the command:

```bash
NODE_ENV=development tsx server/index.ts
```

uses Unix/Linux-style syntax to set an environment variable inline, which  **does not work on Windows CMD or PowerShell** .

### ✅ Solutions:

#### **Option 1: Use `cross-env` (recommended for cross-platform support)**

Install `cross-env` as a dev dependency:

```bash
npm install --save-dev cross-env
```

Then, in your `package.json`, change the `dev` script to:

```json
"scripts": {
  "dev": "cross-env NODE_ENV=development tsx server/index.ts"
}
```

This makes it work on  **Windows, macOS, and Linux** .

---

#### **Option 2: Use Windows-specific syntax (not portable)**

If you're only targeting Windows, you can update your `package.json` script like this:

```json
"scripts": {
  "dev": "set NODE_ENV=development && tsx server/index.ts"
}
```

But this won't work on Unix-based systems.

---

### ✅ Recommendation:

Go with **Option 1 (`cross-env`)** for maximum compatibility across environments and teams.

Let me know if you want help modifying your `package.json`.


---

---

---


```
Error: listen ENOTSUP: operation not supported on socket 0.0.0.0:3000
```

This usually means **Node.js can't bind to `0.0.0.0` on port `3000`** due to one of the following reasons:

---

### 🔍 **Causes and Fixes**

#### ✅ 1. **You're using `node` v22.x** — it's experimental

The version you’re using:

```
Node.js v22.14.0
```

Node 22 is very new (as of May 2025) and **some behavior may be unstable or changed** — especially with networking and `WebSocketServer`.

 **👉 Fix** : Try using an LTS version of Node, such as  **Node.js v20.x** .

You can manage Node versions using [**nvm for Windows**](https://github.com/coreybutler/nvm-windows):

```bash
nvm install 20
nvm use 20
```

Then run:

```bash
npm run dev
```

---

#### ✅ 2. **`0.0.0.0` may not be allowed in your environment (esp. on Windows)**

Try changing the address in your server code to `localhost` or `127.0.0.1`.

For example, in your server code (`server/index.ts` or wherever you're calling `listen()`):

```ts
server.listen(3000, '127.0.0.1'); // instead of '0.0.0.0'
```

---

#### ✅ 3. **Port 3000 may already be in use**

Check if another app is already using port 3000.

Run this command to find and stop the process:

```bash
netstat -ano | findstr :3000
```

Look for the PID in the last column and then:

```bash
taskkill /PID <pid> /F
```

---

### ✅ Recommended Steps

1. **Switch to Node.js v20 (LTS)** using `nvm` for Windows.
2. **Update the server to use `'127.0.0.1'` instead of `'0.0.0.0'`.**
3. If still broken, check for port conflicts on port 3000.

---

Let me know if you'd like help editing your server code or installing `nvm`.

You're getting this error:

```
Error: listen ENOTSUP: operation not supported on socket 0.0.0.0:3000
```

This usually means **Node.js can't bind to `0.0.0.0` on port `3000`** due to one of the following reasons:

---

### 🔍 **Causes and Fixes**

#### ✅ 1. **You're using `node` v22.x** — it's experimental

The version you’re using:

```
Node.js v22.14.0
```

Node 22 is very new (as of May 2025) and **some behavior may be unstable or changed** — especially with networking and `WebSocketServer`.

 **👉 Fix** : Try using an LTS version of Node, such as  **Node.js v20.x** .

You can manage Node versions using [**nvm for Windows**](https://github.com/coreybutler/nvm-windows):

```bash
nvm install 20
nvm use 20
```

Then run:

```bash
npm run dev
```

---

#### ✅ 2. **`0.0.0.0` may not be allowed in your environment (esp. on Windows)**

Try changing the address in your server code to `localhost` or `127.0.0.1`.

For example, in your server code (`server/index.ts` or wherever you're calling `listen()`):

```ts
server.listen(3000, '127.0.0.1'); // instead of '0.0.0.0'
```

---

#### ✅ 3. **Port 3000 may already be in use**

Check if another app is already using port 3000.

Run this command to find and stop the process:

```bash
netstat -ano | findstr :3000
```

Look for the PID in the last column and then:

```bash
taskkill /PID <pid> /F
```

---

### ✅ Recommended Steps

1. **Switch to Node.js v20 (LTS)** using `nvm` for Windows.
2. **Update the server to use `'127.0.0.1'` instead of `'0.0.0.0'`.**
3. If still broken, check for port conflicts on port 3000.

---

Let me know if you'd like help editing your server code or installing `nvm`.

---

---
