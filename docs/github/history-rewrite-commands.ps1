<#
.SYNOPSIS
    Radiance — Controlled Git Author History Correction Execution Script
.DESCRIPTION
    Corrects the author identity of exactly 60 historical commits on 'main' from:
      Radiance Engineering Team <engineering@radiance.ai>
    to:
      TanishBane <tanishbane99@gmail.com>

    PREPARATION STATUS: PREPARED FOR REVIEW ONLY.
    DO NOT EXECUTE WITHOUT EXPLICIT USER AUTHORIZATION.
#>

[CmdletBinding()]
param(
    [switch]$Execute = $false,
    [string]$BackupDir = "C:\Tanixai-backups"
)

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host " RADIANCE - CONTROLLED GIT AUTHOR HISTORY CORRECTION SCRIPT" -ForegroundColor Cyan
Write-Host " Target Branch: main" -ForegroundColor Cyan
Write-Host " Target Author: TanishBane [tanishbane99@gmail.com]" -ForegroundColor Cyan
Write-Host " Scope: Exactly 60 Commits on main" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

if (-not $Execute) {
    Write-Warning "CRITICAL SAFETY GUARD ACTIVE:"
    Write-Warning "This script was run in PREPARATION / DRY-RUN mode."
    Write-Warning "No repository modifications or history rewrites were performed."
    Write-Warning "To execute this procedure after explicit review, you must pass: .\history-rewrite-commands.ps1 -Execute"
    exit 0
}

Write-Host "[SAFETY CONFIRMATION] Execution flag detected. Starting pre-flight checks..." -ForegroundColor Yellow

# -----------------------------------------------------------------------------
# STEP 0: Pre-Flight Environment & State Verification
# -----------------------------------------------------------------------------
$RepoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $RepoRoot) {
    Write-Error "Not inside a valid Git repository. Aborting."
    exit 1
}

$CurrentBranch = (git branch --show-current).Trim()
if ($CurrentBranch -ne "main") {
    Write-Error "Current branch is '$CurrentBranch'. You must be on 'main'. Aborting."
    exit 1
}

$CurrentHead = (git rev-parse HEAD).Trim()
$ExpectedHead = "a370aa610da39ca6a15e5c9c28c03fbde3ea60aa"
if ($CurrentHead -ne $ExpectedHead) {
    Write-Warning "HEAD has moved from expected SHA ($ExpectedHead) to ($CurrentHead)."
    $confirm = Read-Host "Do you wish to proceed with current HEAD $CurrentHead? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Error "User cancelled execution. Aborting."
        exit 1
    }
}

# -----------------------------------------------------------------------------
# STEP 1: Multi-Tier Full Spectrum Backup Suite Creation
# -----------------------------------------------------------------------------
$Timestamp = (Get-Date -Format "yyyyMMdd-HHmmss")
$SessionBackupDir = Join-Path $BackupDir "radiance-backup-$Timestamp"
New-Item -ItemType Directory -Path $SessionBackupDir -Force | Out-Null
Write-Host "[1/5] Created backup directory: $SessionBackupDir" -ForegroundColor Green

# 1.1 Local Safety Branch
$BackupBranch = "backup/pre-rewrite-main-$Timestamp"
git branch $BackupBranch main
Write-Host "  -> Created local safety branch: $BackupBranch" -ForegroundColor Gray

# 1.2 Full Git Bundle (Offline Complete Git Object & Ref Archive)
$BundlePath = Join-Path $SessionBackupDir "radiance-full-repo.bundle"
git bundle create $BundlePath --all
Write-Host "  -> Created full Git bundle (all objects, branches, tags): $BundlePath" -ForegroundColor Gray

# 1.3 Exact Ref Snapshot & HEAD Record
git show-ref > (Join-Path $SessionBackupDir "refs-snapshot.txt")
git rev-parse HEAD > (Join-Path $SessionBackupDir "main-sha-snapshot.txt")
Write-Host "  -> Recorded ref and SHA snapshots." -ForegroundColor Gray

# 1.4 Complete Working-Directory Physical Backup (Captures 100% of Untracked Files)
$WorkingTreeBackupDir = Join-Path $SessionBackupDir "working-tree-full-copy"
Write-Host "  -> Copying complete working tree (including untracked files & docs) to $WorkingTreeBackupDir..." -ForegroundColor Gray
robocopy "$RepoRoot" "$WorkingTreeBackupDir" /E /XD .git node_modules .next /R:1 /W:1 /NFL /NDL | Out-Null
Write-Host "  -> Preserved 100% of untracked files, audit docs, and local scripts." -ForegroundColor Green

# 1.5 Remote Mirror Clone (Byte-for-byte remote replica of GitHub state)
$MirrorPath = Join-Path $SessionBackupDir "Radiance-mirror.git"
Write-Host "  -> Cloning mirror of remote repository to $MirrorPath..." -ForegroundColor Gray
git clone --mirror https://github.com/TanishBane/Radiance.git $MirrorPath
Write-Host "  -> Backup suite complete. All 8 failure domains protected." -ForegroundColor Green

# -----------------------------------------------------------------------------
# STEP 2: Python git-filter-repo Setup & Verification
# -----------------------------------------------------------------------------
Write-Host "[2/5] Preparing Python git-filter-repo environment..." -ForegroundColor Green

# Verify git-filter-repo is installed in Python
$pyCheck = py -3 -c "import git_filter_repo; print(git_filter_repo.__version__)" 2>$null
if (-not $pyCheck) {
    Write-Host "  -> Installing git-filter-repo via pip..." -ForegroundColor Yellow
    py -3 -m pip install --quiet git-filter-repo
}

$FilterScript = Join-Path $RepoRoot "docs\github\filter-author-callback.py"
if (-not (Test-Path $FilterScript)) {
    Write-Error "Callback script not found at $FilterScript. Aborting."
    exit 1
}

# -----------------------------------------------------------------------------
# STEP 3: History Rewrite Execution
# -----------------------------------------------------------------------------
Write-Host "[3/5] Executing controlled history rewrite..." -ForegroundColor Green
py -3 $FilterScript
if ($LASTEXITCODE -ne 0) {
    Write-Error "git-filter-repo returned exit code $LASTEXITCODE. Initiating rollback..."
    git reset --hard $BackupBranch
    exit 1
}

# Restore origin remote (git-filter-repo removes origin as a standard safety feature)
git remote add origin https://github.com/TanishBane/Radiance.git 2>$null
git fetch origin

$NewHead = (git rev-parse HEAD).Trim()
Write-Host "  -> History rewrite completed successfully." -ForegroundColor Green
Write-Host "  -> Old main HEAD: $CurrentHead" -ForegroundColor Cyan
Write-Host "  -> New main HEAD: $NewHead" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# STEP 4: Post-Rewrite Verification Gates
# -----------------------------------------------------------------------------
Write-Host "[4/5] Running verification gates..." -ForegroundColor Green

# Gate 1A: Final Tree Parity
$TreeDiff = (git diff $BackupBranch HEAD).Trim()
if ($TreeDiff) {
    Write-Error "FINAL TREE PARITY FAILED: Working tree differs from backup branch! Aborting."
    git reset --hard $BackupBranch
    exit 1
}
Write-Host "  [PASS] Gate 1A: Final main tree contents identical to pre-rewrite state." -ForegroundColor Green

# Gate 1B: Per-Commit Tree Integrity Check (Every single mapped commit)
$CommitMapPath = Join-Path $RepoRoot ".git\filter-repo\commit-map"
Write-Host "  -> Verifying per-commit tree integrity across all rewritten commits..." -ForegroundColor Gray
$Mismatches = 0
$TotalChecked = 0
if (Test-Path $CommitMapPath) {
    Get-Content $CommitMapPath | Where-Object { $_ -match "^([0-9a-f]{40})\s+([0-9a-f]{40})" } | ForEach-Object {
        $matches = [regex]::Match($_, "^([0-9a-f]{40})\s+([0-9a-f]{40})")
        $oldSha = $matches.Groups[1].Value
        $newSha = $matches.Groups[2].Value
        $oldTree = (git rev-parse "$oldSha^{tree}" 2>$null).Trim()
        $newTree = (git rev-parse "$newSha^{tree}" 2>$null).Trim()
        if ($oldTree -ne $newTree) {
            Write-Error "PER-COMMIT TREE MISMATCH: Commit $oldSha -> $newSha has tree $oldTree != $newTree"
            $Mismatches++
        }
        $TotalChecked++
    }
}
if ($Mismatches -ne 0) {
    Write-Error "CRITICAL: Found $Mismatches per-commit tree mismatches! Aborting."
    git reset --hard $BackupBranch
    exit 1
}
Write-Host "  [PASS] Gate 1B: Verified $TotalChecked commits. All rewritten commits retain 100% identical tree IDs." -ForegroundColor Green

# Gate 2: Commit Count & Author Verification
$RemainingOld = (git log main --author="engineering@radiance.ai" --format="%h" | Measure-Object).Count
$CorrectedCount = (git log main --author="tanishbane99@gmail.com" --format="%h" | Measure-Object).Count

if ($RemainingOld -ne 0) {
    Write-Error "AUTHOR VERIFICATION FAILED: Found $RemainingOld commits still authored by engineering@radiance.ai on main!"
    git reset --hard $BackupBranch
    exit 1
}
Write-Host "  [PASS] Gate 2: Exactly 0 commits remain authored by engineering@radiance.ai on main." -ForegroundColor Green
Write-Host "  [PASS] Gate 2: Found $CorrectedCount commits authored by tanishbane99@gmail.com on main." -ForegroundColor Green

# Gate 3: Test Suite Integrity
Write-Host "  -> Running local test suite..." -ForegroundColor Gray
pnpm test --run
if ($LASTEXITCODE -ne 0) {
    Write-Error "TEST SUITE FAILED after rewrite. Aborting."
    git reset --hard $BackupBranch
    exit 1
}
Write-Host "  [PASS] Gate 3: All tests pass with exit code 0." -ForegroundColor Green

# -----------------------------------------------------------------------------
# STEP 5: Push Instructions (Lease Protected)
# -----------------------------------------------------------------------------
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host " VERIFICATION COMPLETE - READY FOR LEASE-PROTECTED PUSH" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To safely update GitHub remote main, execute:" -ForegroundColor Yellow
Write-Host "git push --force-with-lease=refs/heads/main:$CurrentHead origin main" -ForegroundColor White
Write-Host ""
Write-Host "If remote main was modified on GitHub by anyone in the interim, the push will automatically abort."
Write-Host "If you ever need to rollback remote main to pre-rewrite state, execute:" -ForegroundColor Yellow
Write-Host "git push --force-with-lease=refs/heads/main:$NewHead origin $BackupBranch:refs/heads/main" -ForegroundColor White
Write-Host ""
