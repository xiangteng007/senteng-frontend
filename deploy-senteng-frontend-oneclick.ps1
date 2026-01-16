$ErrorActionPreference = "Stop"

# ====== Settings (edit only if IP/path changes) ======
$NasUser = "xiangteng"
$NasHost = "192.168.31.76"
$SshKey  = Join-Path $env:USERPROFILE ".ssh\id_ed25519_senteng"

$LocalFrontendDir  = "C:\Users\xiang\senteng-frontend"
$LocalDistDir      = Join-Path $LocalFrontendDir "dist"

$RemoteFrontendDir = "/share/Docker/SENTENG/app/frontend"
$RemoteTgz         = "/tmp/senteng-frontend.tgz"
$RemoteSh          = "/tmp/senteng-deploy-frontend.sh"

# Portainer
$PortainerBaseUrl = "http://192.168.31.76:19900"
$PortainerToken   = "ptr_lDJ+yBwbkW2bcD1zgMGj8WADRpMVhWU8ppluVUFm2TI="

$EnvironmentName = "senteng"
$TargetWebContainerName = "senteng_web"
# ================================================

function Assert-Path($p, $label) { if (-not (Test-Path $p)) { throw "$label not found: $p" } }
Assert-Path $SshKey "SSH key"
Assert-Path $LocalFrontendDir "Local frontend dir"

$sshTarget = "$NasUser@$NasHost"
$SshOpts = @(
  "-i", $SshKey,
  "-o", "BatchMode=yes",
  "-o", "IdentitiesOnly=yes",
  "-o", "StrictHostKeyChecking=accept-new"
)

Write-Host "==> Preflight SSH"
$out = ssh @SshOpts $sshTarget "echo SSH_OK"
if ($out -notmatch "SSH_OK") { throw "SSH preflight failed: $out" }

Write-Host "==> Build frontend (npm run build)"
Push-Location $LocalFrontendDir
try {
  npm run build | Out-Host
  Assert-Path $LocalDistDir "dist output"
} finally { Pop-Location }

Write-Host "==> Create tar.gz from dist/ (no zip to avoid backslash path bug)"
$TgzLocal = Join-Path $env:TEMP "senteng-frontend.tgz"
if (Test-Path $TgzLocal) { Remove-Item $TgzLocal -Force }

Push-Location $LocalDistDir
try {
  # Windows tar.exe (bsdtar) - this produces correct paths for Linux tar
  tar.exe -czf $TgzLocal * | Out-Null
} finally { Pop-Location }

$sizeMB = [math]::Round(((Get-Item $TgzLocal).Length / 1MB), 2)
Write-Host "Package: $TgzLocal ($sizeMB MB)"

Write-Host "==> Upload tgz to NAS"
scp @SshOpts $TgzLocal "$sshTarget`:$RemoteTgz"

Write-Host "==> Upload remote deploy script (tar extract)"
$sh = @'
#!/bin/sh
set -e
DIR="$1"
TGZ="$2"

mkdir -p "$DIR"
rm -rf "$DIR"/*
tar -xzf "$TGZ" -C "$DIR"
echo "DEPLOY_OK"
'@
$ShLocal = Join-Path $env:TEMP "senteng-deploy-frontend.sh"
[System.IO.File]::WriteAllText($ShLocal, $sh, (New-Object System.Text.UTF8Encoding($false)))

ssh @SshOpts $sshTarget "rm -f $RemoteSh"
scp @SshOpts $ShLocal "$sshTarget`:$RemoteSh"

Write-Host "==> Remote extract to frontend dir"
$out = ssh @SshOpts $sshTarget "sed -i 's/\r$//' $RemoteSh && sh $RemoteSh $RemoteFrontendDir $RemoteTgz"
if ($out -notmatch "DEPLOY_OK") { throw "Remote deploy failed: $out" }

# ---- Portainer API helpers ----
function Invoke-Portainer([string]$Method, [string]$Path, $Body = $null) {
  $headers = @{ "X-API-Key" = $PortainerToken }
  $uri = "$PortainerBaseUrl$Path"
  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers
  } else {
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 20)
  }
}

Write-Host "==> Portainer API: locate environment"
$envs = Invoke-Portainer GET "/api/endpoints"
$envObj = $envs | Where-Object { $_.Name -eq $EnvironmentName } | Select-Object -First 1
if (-not $envObj) { throw "Environment '$EnvironmentName' not found in Portainer." }
$EndpointId = $envObj.Id
Write-Host "Environment: $EnvironmentName (Id=$EndpointId)"

Write-Host "==> Portainer API: locate container"
$containers = Invoke-Portainer GET "/api/endpoints/$EndpointId/docker/containers/json?all=1"
$target = $containers | Where-Object { $_.Names -contains "/$TargetWebContainerName" } | Select-Object -First 1
if (-not $target) { throw "Container '$TargetWebContainerName' not found." }
$ContainerId = $target.Id
Write-Host "Container: $TargetWebContainerName (Id=$ContainerId)"

Write-Host "==> Portainer API: restart container"
Invoke-Portainer POST "/api/endpoints/$EndpointId/docker/containers/$ContainerId/restart" $null | Out-Null

Write-Host "Done. Open: http://192.168.31.76:8080/ (Ctrl+F5)"
