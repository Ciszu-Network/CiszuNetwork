@echo off
rem opencode-run.cmd — ALIAS DE COMPATIBILIDAD (deprecado).
rem La tool oficial es ciszu-ai.cmd (misma carpeta). Este nombre se
rem conserva para no romper docs/habitos existentes y delega en ella.
call "%~dp0ciszu-ai.cmd" %*
exit /b %errorlevel%