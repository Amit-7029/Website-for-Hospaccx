@echo off
setlocal

cd /d "%~dp0frontend"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not on PATH.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing frontend dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo Starting Vercel-ready frontend on http://localhost:5173
call npm.cmd run dev
