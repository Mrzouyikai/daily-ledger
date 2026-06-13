@echo off
chcp 65001 >nul
title 每日对账 · 本地服务器

echo.
echo   ╔══════════════════════════════════════╗
echo   ║    🧾 每日对账 · 热敏小票 PWA        ║
echo   ║    启动本地服务器...                  ║
echo   ╚══════════════════════════════════════╝
echo.

set PORT=8765

echo   📡 正在启动 http://localhost:%PORT% ...
echo.

REM Try Python first (most reliable)
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ 使用 Python 启动
    start http://localhost:%PORT%
    python -c "import http.server; import socketserver; import os; os.chdir(r'%~dp0'); handler = http.server.SimpleHTTPRequestHandler; handler.extensions_map.update({'.js': 'application/javascript', '.json': 'application/json', '.svg': 'image/svg+xml'}); print('Server ready at http://localhost:%PORT%'); httpd = socketserver.TCPServer(('', %PORT%), handler); httpd.serve_forever()"
    goto :end
)

REM Try npx http-server
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ 使用 npx http-server 启动
    start http://localhost:%PORT%
    npx http-server "%~dp0" -p %PORT% -c-1 -o
    goto :end
)

REM Fallback: PowerShell
echo   ⚠ Python 和 npx 都不可用，使用 PowerShell...
start http://localhost:%PORT%
powershell -Command "$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:%PORT%/'); $listener.Start(); Write-Host 'Server started'; while($listener.IsListening) { $ctx = $listener.GetContext(); $path = $ctx.Request.Url.LocalPath; if($path -eq '/'){$path='/index.html'}; $file = Join-Path '%~dp0' $path.TrimStart('/'); if(Test-Path $file){ $bytes = [IO.File]::ReadAllBytes($file); $ctx.Response.OutputStream.Write($bytes,0,$bytes.Length) }; $ctx.Response.Close() }"

:end
pause
