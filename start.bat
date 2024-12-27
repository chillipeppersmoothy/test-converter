@echo off
:: Start the server
start cmd.exe /K "node server.js"
:: Open the HTML page in the default web browser
start "" "http://localhost:9173"