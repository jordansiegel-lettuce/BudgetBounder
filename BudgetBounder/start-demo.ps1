# BudgetBounder local demo launcher.
# Starts SQL Server, the API, the admin web app and the Expo dev server.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "[1/4] SQL Server..." -ForegroundColor Cyan
docker start budgetbounder-sql | Out-Null
for ($i = 0; $i -lt 30; $i++) {
    if ((Test-NetConnection localhost -Port 1433 -WarningAction SilentlyContinue).TcpTestSucceeded) { break }
    Start-Sleep -Seconds 2
}

Write-Host "[2/4] API on http://localhost:5292 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\BudgetBounder.API\BudgetBounder.Api'; `$env:ASPNETCORE_ENVIRONMENT='Development'; dotnet run --launch-profile http"

Write-Host "[3/4] Admin web..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\BudgetBounder.Web\BudgetBounder-web'; npm run dev"

# This PC has Hyper-V virtual adapters that Windows lists before WiFi. Expo can pick
# one of those for its QR/host address, which a phone cannot reach - so pin it to WiFi.
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -eq 'WiFi' }).IPAddress

Write-Host "[4/4] Expo (LAN, for Expo Go) pinned to $ip ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\BudgetBounderMobile'; `$env:EXPO_PACKAGER_HOSTNAME='$ip'; `$env:REACT_NATIVE_PACKAGER_HOSTNAME='$ip'; npx expo start --go --lan"
Write-Host ""
Write-Host "Admin site : http://localhost:5173  (or 5174 if 5173 is taken)" -ForegroundColor Green
Write-Host "Admin login: admin@budgetbounder.app / Admin2026!Demo" -ForegroundColor Green
Write-Host "API        : http://localhost:5292/swagger" -ForegroundColor Green
Write-Host "Expo Go    : scan the QR, or enter exp://${ip}:8081 manually (phone on same WiFi)" -ForegroundColor Green
Write-Host "App login  : jordisiegel@gmail.com / Demo2026!   (Lv 4, 760 XP)" -ForegroundColor Green
