$names = @(
  "check-buckets.js","check-buckets2.js","check-buckets3.js","check-perms.js","check-perms2.js",
  "fix-schemas.js","fix-schemas-2.js","test-funcs.js","test-funcs2.js","rotate-supabase-keys.js",
  "cdn-upload-cli.js","notify.js","list-icons.js","setup-hybrid-system.js","organize-assets.js",
  "quick-start.js","complete-setup.js","final-verification.js","verify-system.js","verify-final.js",
  "setup-documentation-system.js","fix-documentation-structure.js","clean-and-sync-docs.js",
  "clean-and-unify-docs.js","analyze-docs-structure.js","organize-ciszugamens.js","convert-icons.js",
  "extract-icons.js","migrate-icons.js","download-icons.js","download-icons-direct.js",
  "download-massive-icons.js","drop-duplicate.js","list-tickets.js","read-funcs.js","create-wrappers.js",
  "fix-funcs-sql.js","fix-bugs.js","sample-bucket.js","count-bucket.js","test-upload.js",
  "verify-migration.js","verify-migration-09.js","check-db.js","check-config-api.js",
  "check-submit-access.js","check-func-defs.js"
);
foreach ($n in $names) {
  Write-Output "### $n";
  Get-Content "scripts\$n" -TotalCount 8 -ErrorAction SilentlyContinue |
    Where-Object { $_ -match "^//|^/\*|^#|Uso|Usage|TEMP|temp|legacy|WIP|deprec|one.shot|One.shot" } |
    Select-Object -First 2 | ForEach-Object { Write-Output "  $_" };
}
