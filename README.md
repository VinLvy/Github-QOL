# Github-QOL

CLI untuk menampilkan daftar akun GitHub yang Anda follow namun tidak follow back.

## Cara pakai

1. Instal dependensi:

   ```bash
   npm install
   ```

2. Jalankan dengan username (tanpa token):

   ```bash
   node scripts/nonfollowers.mjs --username <username_anda>
   ```

   Atau gunakan token untuk menghindari rate limit dan otomatis mendeteksi username:

   ```bash
   setx GITHUB_TOKEN "ghp_xxx"  # Windows PowerShell: set variabel lingkungan permanen
   $env:GITHUB_TOKEN = "ghp_xxx" # atau hanya untuk sesi saat ini
   node scripts/nonfollowers.mjs
   ```

3. Output dalam format JSON (opsional):

   ```bash
   node scripts/nonfollowers.mjs -j --username <username_anda>
   ```

## Opsi

- **-u, --username**: Username GitHub (wajib jika tanpa token)
- **-t, --token**: Personal Access Token GitHub (atau set `GITHUB_TOKEN`)
- **-j, --json**: Output JSON
- **-h, --help**: Bantuan

## Catatan

- Butuh Node.js v18+.
- Tanpa token, Anda terkena rate limit publik GitHub API. Disarankan pakai token PAT (scopes publik sudah cukup).
