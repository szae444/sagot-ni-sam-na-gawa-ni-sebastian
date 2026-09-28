@echo off
title Sagot ni Sam na gawa ni Sebastian
cd /d "%~dp0"
if not exist "out\index.html" (
  echo Building the website for the first time...
  call npm install
  call npm run build
)
node serve.mjs --open
pause
