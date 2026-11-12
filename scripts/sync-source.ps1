[CmdletBinding()]
param([string]$Message = ('Save source ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')), [switch]$Preview)
$ErrorActionPreference = 'Stop'
$expectedRemote = 'https://github.com/hkfootballacademy2026-glitch/football-analyzer.git'
Set-Location -LiteralPath (Split-Path $PSScriptRoot -Parent)
function Git-Checked {
 & git @args
 if ($LASTEXITCODE -ne 0) { throw ('git failed: ' + ($args -join ' ')) }
}
$remote = & git remote get-url origin
if ($LASTEXITCODE -ne 0 -or $remote -ne $expectedRemote) { throw 'Unexpected origin; refusing to upload' }
$branch = & git branch --show-current
if ($LASTEXITCODE -ne 0 -or $branch -ne 'main') { throw 'Switch to main before saving source' }
if ($Preview) { Git-Checked status --short; return }
$paths = @('src','server','scripts','tests','public','.gitignore','.env.example','AGENTS.md','README.md','CHANGELOG.md','FEATURE_STATUS.md','LICENSES.md','index.html','package.json','package-lock.json','eslint.config.js','tsconfig.json','vite.config.ts','vitest.config.ts','playwright.config.ts','wrangler.jsonc','wrangler.billing.example.jsonc','MOBILE_WORKSPACE_VALIDATION.md','MP4_SOURCE_VALIDATION.md','PITCH_WORKSPACE_VALIDATION.md','SAFARI_VALIDATION.md','SCENE_RECONSTRUCTION_VALIDATION.md','WORKSPACE_UPGRADE_VALIDATION.md','Save-source-to-GitHub.cmd')
Git-Checked add -- @paths
$staged = @(& git -c core.quotepath=false diff --cached --name-only)
if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect staged paths' }
foreach ($file in $staged) {
 $allowed = ($paths -contains $file) -or ($file -match '^(src|server|scripts|tests|public)/')
 if (-not $allowed -or $file -match '(^|/)(\.env($|\.)|\.projects/)|\.(pem|key|p12|pfx)$') {
  if ($file -ne '.env.example') { throw ('Excluded file is staged: ' + $file) }
 }
}
$secretPattern = 'sk_(live|test)_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----'
$findings = @(& git grep --cached -I -l -E -e $secretPattern)
if ($LASTEXITCODE -gt 1) { throw 'Secret check failed' }
if ($findings.Count -gt 0) { throw ('Possible secret in: ' + ($findings -join ', ')) }
if ($staged.Count -gt 0) { Git-Checked commit -m $Message }
Git-Checked push origin main
Write-Output 'Source saved to GitHub. Match records and personal videos were not uploaded.'
