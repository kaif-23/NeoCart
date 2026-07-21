# get-cookie.ps1 — registers benchmark user and saves session cookie
$baseUrl = "http://localhost:3000"
$email   = "bench_perf_001@neocart.local"
$pass    = "BenchPerf1234!"
$name    = "Bench User"

# --- Register (ignore if already exists) ---
Write-Host "--- Registering test user ---"
$regBody = @{ name = $name; email = $email; password = $pass } | ConvertTo-Json
$regSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
try {
    $regResp = Invoke-WebRequest `
        -Uri         "$baseUrl/api/auth/register" `
        -Method      POST `
        -ContentType "application/json" `
        -Body        $regBody `
        -WebSession  $regSession `
        -TimeoutSec  20
    Write-Host ("Register OK: " + $regResp.StatusCode)
} catch {
    $sc = $_.Exception.Response.StatusCode.value__
    Write-Host ("Register skipped (status $sc) — user probably already exists")
}

# --- Login and capture cookie ---
Write-Host "--- Logging in ---"
$loginBody    = @{ email = $email; password = $pass } | ConvertTo-Json
$loginSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$loginResp = Invoke-WebRequest `
    -Uri         "$baseUrl/api/auth/login" `
    -Method      POST `
    -ContentType "application/json" `
    -Body        $loginBody `
    -WebSession  $loginSession `
    -TimeoutSec  20

Write-Host ("Login status: " + $loginResp.StatusCode)

# Extract cookie
$cookie = $loginSession.Cookies.GetCookies("http://localhost:3000") `
          | Where-Object { $_.Name -eq "token" } `
          | Select-Object -First 1

if (-not $cookie) {
    Write-Host "ERROR: token cookie not found in login response"
    exit 1
}

$cookieStr = "token=" + $cookie.Value
Write-Host ("Cookie (first 80 chars): " + $cookieStr.Substring(0, [Math]::Min(80, $cookieStr.Length)) + "...")
Set-Content -Path "perf\benchmark-cookie.txt" -Value $cookieStr -NoNewline -Encoding utf8
Write-Host "Saved to perf\benchmark-cookie.txt"
