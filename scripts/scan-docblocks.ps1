$names = @(
  "check-buckets.js","check-buckets2.js","check-buckets3.js","check-perms.js","check-perms2.js",
  "fix-schemas.js","fix-schemas-2.js","test-funcs.js","test-funcs2.js","rotate-supabase-keys.js",
  "notify.js","list-icons.js","setup-hybrid-system.js","organize-assets.js","quick-start.js",
  "complete-setup.js","final-verification.js","verify-system.js","verify-final.js",
  "setup-documentation-system.js","fix-documentation-structure.js","clean-and-sync-docs.js",
  "clean-and-unify-docs.js","analyze-docs-structure.js","convert-icons.js",
  "extract-icons.js","migrate-icons.js","download-icons.js","download-icons-direct.js",
  "download-massive-icons.js","drop-duplicate.js","list-tickets.js","read-funcs.js","create-wrappers.js",
  "fix-funcs-sql.js","fix-bugs.js","sample-bucket.js","count-bucket.js","test-upload.js",
  "verify-migration.js","verify-migration-09.js","check-db.js","check-config-api.js",
  "check-submit-access.js","check-func-defs.js","list-policies.js","apply-migration-14.js",
  "apply-migration-04.js","fix-migrations.js","analyze-policies.js","check-policies.js",
  "check-auth-wrapper.js","fix-funcs-sql.js","verify-migration.js","migrate-bucket.js"
);
foreach ($n in $names) {
  Write-Output "### $n";
  $lines = Get-Content "scripts\$n" -ErrorAction SilentlyContinue;
  $block = $lines | Select-Object -First 15;
  $block | Where-Object { $_ -match "^//|^/\*|^\s*\*|^#'" } | Select-Object -First 8 | ForEach-Object { Write-Output "  $_" };
}
