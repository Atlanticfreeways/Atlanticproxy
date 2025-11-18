2025-11-18T01:58:36.211113752Z ==> Cloning from https://github.com/Atlanticfreeways/Atlanticproxy
2025-11-18T01:58:36.700435371Z ==> Checking out commit 1130c39fa90b1819faac45d139a48152cb6cd8ef in branch main
2025-11-18T01:58:38.307622309Z ==> Requesting Node.js version >=18.0.0
2025-11-18T01:58:38.551894469Z ==> Using Node.js version 25.2.1 via /opt/render/project/src/frontend/package.json
2025-11-18T01:58:38.575776825Z ==> Docs on specifying a Node.js version: https://render.com/docs/node-version
2025-11-18T01:58:40.692788306Z ==> Running build command 'npm install && npm run build'...
2025-11-18T01:58:56.389876174Z 
2025-11-18T01:58:56.389909625Z added 427 packages, and audited 428 packages in 16s
2025-11-18T01:58:56.389925945Z 
2025-11-18T01:58:56.390009288Z 166 packages are looking for funding
2025-11-18T01:58:56.390046348Z   run `npm fund` for details
2025-11-18T01:58:56.43449261Z 
2025-11-18T01:58:56.434516941Z 6 vulnerabilities (1 moderate, 5 high)
2025-11-18T01:58:56.434521281Z 
2025-11-18T01:58:56.434526511Z To address all issues, run:
2025-11-18T01:58:56.434530291Z   npm audit fix
2025-11-18T01:58:56.434533991Z 
2025-11-18T01:58:56.434538021Z Run `npm audit` for details.
2025-11-18T01:58:56.630692519Z 
2025-11-18T01:58:56.63072013Z > atlantic-proxy-frontend@1.0.0 build
2025-11-18T01:58:56.63072725Z > next build
2025-11-18T01:58:56.63073281Z 
2025-11-18T01:58:57.097714121Z ⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
2025-11-18T01:58:57.139723483Z   ▲ Next.js 14.2.33
2025-11-18T01:58:57.139740253Z   - Experiments (use with caution):
2025-11-18T01:58:57.139757044Z     · optimizeCss
2025-11-18T01:58:57.139824795Z 
2025-11-18T01:58:57.148297683Z    Creating an optimized production build ...
2025-11-18T01:59:02.79161235Z  ✓ Compiled successfully
2025-11-18T01:59:02.792197185Z    Linting and checking validity of types ...
2025-11-18T01:59:04.435382596Z  ⨯ ESLint: Failed to load config "@next/eslint-config-next" to extend from. Referenced from: /opt/render/project/src/frontend/.eslintrc.json
2025-11-18T01:59:05.805948391Z Failed to compile.
2025-11-18T01:59:05.805973341Z 
2025-11-18T01:59:05.805990532Z ./src/lib/api.ts:36:15
2025-11-18T01:59:05.805995282Z Type error: Property 'Authorization' does not exist on type 'HeadersInit'.
2025-11-18T01:59:05.805998862Z   Property 'Authorization' does not exist on type '[string, string][]'.
2025-11-18T01:59:05.806002222Z 
2025-11-18T01:59:05.806006262Z   34 |
2025-11-18T01:59:05.806009812Z   35 |     if (this.token) {
2025-11-18T01:59:05.806014152Z > 36 |       headers.Authorization = `Bearer ${this.token}`;
2025-11-18T01:59:05.806018422Z      |               ^
2025-11-18T01:59:05.806022462Z   37 |     }
2025-11-18T01:59:05.806025893Z   38 |
2025-11-18T01:59:05.806032833Z   39 |     const response = await fetch(url, {
2025-11-18T01:59:05.843623956Z Next.js build worker exited with code: 1 and signal: null
2025-11-18T01:59:05.937631365Z ==> Build failed 😞
2025-11-18T01:59:05.937651996Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys