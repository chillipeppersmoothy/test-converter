:: filepath: /c:/Users/ASUS/Downloads/convert-to-playwright/start.bat
@echo off
:: Start the server
start cmd.exe /K "node server.js"
:: Open the HTML page in the default web browser
start "" "http://localhost:9173"