$ErrorActionPreference = "Stop"

Write-Host "Student Task Manager - Windows installer builder" -ForegroundColor Cyan
Write-Host "Checking Node.js..."
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) { throw "Node.js is not installed. Install Node.js 22.12 or newer." }

Write-Host "Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed." }

Write-Host "Running automated tests..."
npm test
if ($LASTEXITCODE -ne 0) { throw "Tests failed. Installer was not built." }

Write-Host "Building Windows installer and portable EXE..."
npm run build:win:all
if ($LASTEXITCODE -ne 0) { throw "Windows build failed." }

Write-Host ""
Write-Host "Build complete. Files are in the dist folder:" -ForegroundColor Green
Get-ChildItem .\dist\*.exe | Select-Object Name, Length
