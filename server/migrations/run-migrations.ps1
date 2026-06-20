# Run all SQL migrations against MySQL using .env credentials
# Usage: .\migrations\run-migrations.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
  Write-Error ".env file not found at $envFile"
}

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim()
    Set-Item -Path "env:$name" -Value $value
  }
}

$host = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$port = if ($env:DB_PORT) { $env:DB_PORT } else { "3306" }
$user = if ($env:DB_USER) { $env:DB_USER } else { "root" }
$password = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "" }
$database = if ($env:DB_NAME) { $env:DB_NAME } else { "expenseTracker" }

function Invoke-SqlFile {
  param([string]$FilePath)
  Write-Host "Running $FilePath ..."
  if ($password) {
    Get-Content $FilePath -Raw | mysql -h $host -P $port -u $user -p$password $database
  } else {
    Get-Content $FilePath -Raw | mysql -h $host -P $port -u $user $database
  }
}

Invoke-SqlFile (Join-Path $PSScriptRoot "001_create_tables.sql")
Invoke-SqlFile (Join-Path $PSScriptRoot "002_seed_mock_data.sql")

Write-Host "Migrations completed."
