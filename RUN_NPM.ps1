param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$nodeDir = Join-Path $repoRoot "node-v24.13.0-win-x64"
$npmCmd = Join-Path $nodeDir "npm.cmd"
$nodeExe = Join-Path $nodeDir "node.exe"
$npmShimEntry = Join-Path $nodeDir "node_modules\corepack\dist\npm.js"
$globalNpmCandidates = @(
  (Join-Path $env:LocalAppData "Programs\nodejs\npm.cmd"),
  (Join-Path $env:ProgramFiles "nodejs\npm.cmd"),
  (Join-Path ${env:ProgramFiles(x86)} "nodejs\npm.cmd"),
  (Join-Path $env:AppData "npm\npm.cmd")
) | Where-Object { $_ -and (Test-Path -Path $_) }
$globalNpmCmd = $globalNpmCandidates | Select-Object -First 1

if (-not (Test-Path -Path $nodeExe)) {
  throw "Portable Node not found at: $nodeExe`nExpected portable Node folder at: $nodeDir"
}

function Invoke-LocalScript {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ScriptName,
    [string[]]$ScriptArgs
  )

  switch ($ScriptName) {
    "dev" {
      & $nodeExe ".\node_modules\vite\bin\vite.js" @ScriptArgs
      return $LASTEXITCODE
    }
    "build" {
      & $nodeExe ".\node_modules\vite\bin\vite.js" "build" @ScriptArgs
      return $LASTEXITCODE
    }
    "preview" {
      & $nodeExe ".\node_modules\vite\bin\vite.js" "preview" @ScriptArgs
      return $LASTEXITCODE
    }
    "lint" {
      & $nodeExe ".\node_modules\eslint\bin\eslint.js" "." @ScriptArgs
      return $LASTEXITCODE
    }
    "test:assessment" {
      & $nodeExe "--test" "tests\assessment\*.test.mjs" @ScriptArgs
      return $LASTEXITCODE
    }
    "exports:render" {
      & $nodeExe ".\scripts\render_exports.mjs" @ScriptArgs
      return $LASTEXITCODE
    }
    "exports:baseline" {
      & $nodeExe ".\scripts\verify_exports.mjs" "baseline" @ScriptArgs
      return $LASTEXITCODE
    }
    "exports:verify" {
      & $nodeExe ".\scripts\verify_exports.mjs" "verify" @ScriptArgs
      return $LASTEXITCODE
    }
    "exports:parity" {
      & $nodeExe ".\scripts\exports_parity.mjs" @ScriptArgs
      return $LASTEXITCODE
    }
    "exports:fixtures" {
      & $nodeExe ".\scripts\verify_composer_fixtures.mjs" @ScriptArgs
      return $LASTEXITCODE
    }
    "release:check" {
      & $nodeExe ".\scripts\release_gate.mjs" @ScriptArgs
      return $LASTEXITCODE
    }
    default {
      Write-Error "Unsupported local script fallback: $ScriptName"
      return 1
    }
  }
}

Push-Location $repoRoot
try {
  $env:Path = "$nodeDir;$env:Path"

  $portableNpmAttempted = $false
  if ((Test-Path -Path $npmCmd) -and (Test-Path -Path $npmShimEntry)) {
    $portableNpmAttempted = $true
    & $npmCmd @Args
    if ($LASTEXITCODE -eq 0) {
      exit 0
    }
  }

  if ($Args.Length -ge 2 -and $Args[0] -eq "run") {
    $scriptName = $Args[1]
    $scriptArgs = @()
    if ($Args.Length -gt 2) {
      $scriptArgs = $Args[2..($Args.Length - 1)]
    }
    $fallbackExit = Invoke-LocalScript -ScriptName $scriptName -ScriptArgs $scriptArgs
    if ($fallbackExit -eq 0) {
      exit 0
    }
  }

  if ($globalNpmCmd) {
    & $globalNpmCmd @Args
    exit $LASTEXITCODE
  }

  if ($portableNpmAttempted) {
    throw "Portable npm shim failed and no global npm fallback is available for: $($Args -join ' ')"
  }

  throw "npm shim is unavailable and no global npm fallback is defined for: $($Args -join ' ')"
}
finally {
  Pop-Location
}

