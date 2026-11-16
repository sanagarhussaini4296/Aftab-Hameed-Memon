@echo off
title Prof. Dr. Aftab Hameed Memon - Academic Website Server
cd /d "%~dp0"
echo =======================================================
echo Starting Local and Network Academic Server...
echo Local URL:   http://localhost:3050
echo Network URL: Available on your Wi-Fi/LAN IP on port 3050
echo =======================================================
start "" http://localhost:3050
node server.js
pause

