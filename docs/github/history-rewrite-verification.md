# Radiance — Git History Rewrite Verification Protocol

**Prepared Date:** 2026-11-09  
**Target Repository:** `https://github.com/TanishBane/Radiance`  
**Target Default Branch:** `main`  
**Correction Objective:** Exactly 60 commits on `main` transitioned from `engineering@radiance.ai` to `tanishbane99@gmail.com`  

---

## 1. Verification Overview & Quality Floor

A Git history correction must satisfy rigorous verification criteria before and after any remote update. Every verification check below is designed to ensure:
1. **Per-Commit Tree Invariance:** Every single rewritten commit (all 60 corrected commits and all 14 affected descendants) retains the **exact identical root tree object SHA** as its original counterpart. Comparing only the final `main` tree is strictly insufficient.
2. **Byte-for-Byte File Invariance:** Not a single line of code, configuration, or documentation in the repository is modified.
3. **Temporal Invariance:** All original author dates and committer dates are preserved down to the second.
4. **Editorial Invariance:** All commit titles, multi-line descriptions, and co-author trailers remain completely identical.
5. **Attribution Isolation:** Dependabot branches and the exploratory `rehaul` commit remain completely outside the author modification scope.

---

## 2. Pre-Execution Verification Checklist

Before running any rewrite command:
- [ ] Working directory is clean (`git status --porcelain` contains no unstaged code changes).
- [ ] Current branch is `main` (`git branch --show-current` == `main`).
- [ ] Current `main` HEAD matches the expected hash (`a370aa610da39ca6a15e5c9c28c03fbde3ea60aa`).
- [ ] Multi-tier backup suite is successfully generated in an external directory (`C:\Tanixai-backups\...`).
- [ ] Complete untracked files backup is verified via physical directory copy (`working-tree-full-copy`).
- [ ] Local safety snapshot branch exists (`backup/pre-rewrite-main-*`).
- [ ] Git bundle validates cleanly (`git bundle verify <bundle-path>`).
- [ ] Static syntax validation of PowerShell and Python scripts returns **0 errors**.

---

## 3. Post-Rewrite Local Verification Gates

After running the filter script locally, execute the following commands in sequence. **Every check must pass before considering a remote push.**

### Gate 1A: Final Branch Tree Parity Check
Verify that the working tree of rewritten `main` is 100% identical to the pre-rewrite backup branch:
```powershell
git diff backup/pre-rewrite-main-* HEAD
```
- **Expected Result:** **Empty output** (0 differences, exit code 0).
- **Failure Condition:** Any file diff indicates file corruption. Abort immediately with `git reset --hard backup/pre-rewrite-main-*`.

### Gate 1B: Per-Commit Tree Object Integrity Verification
In Git, every commit points to a root `tree <tree-sha>` object representing the exact state of all repository files at that point in time. While commit SHAs change when metadata changes, **the tree object SHA must remain 100% identical for every corresponding commit**.

Execute the per-commit verification loop against `.git/filter-repo/commit-map`:
```powershell
$CommitMapPath = ".git/filter-repo/commit-map"
$Mismatches = 0
$TotalChecked = 0

Get-Content $CommitMapPath | Where-Object { $_ -match "^([0-9a-f]{40})\s+([0-9a-f]{40})" } | ForEach-Object {
    $matches = [regex]::Match($_, "^([0-9a-f]{40})\s+([0-9a-f]{40})")
    $oldSha = $matches.Groups[1].Value
    $newSha = $matches.Groups[2].Value
    
    $oldTree = (git rev-parse "$oldSha^{tree}" 2>$null).Trim()
    $newTree = (git rev-parse "$newSha^{tree}" 2>$null).Trim()
    
    if ($oldTree -ne $newTree) {
        Write-Error "TREE MISMATCH in commit $oldSha -> $newSha: OldTree=$oldTree, NewTree=$newTree"
        $Mismatches++
    } else {
        # Double check diff-tree outputs zero changes
        $diff = (git diff-tree -r $oldSha $newSha 2>$null).Trim()
        if ($diff) {
            Write-Error "DIFF-TREE DETECTED CONTENT CHANGE between $oldSha and $newSha!"
            $Mismatches++
        }
    }
    $TotalChecked++
}

Write-Host "Total Commits Inspected: $TotalChecked"
Write-Host "Total Tree Mismatches: $Mismatches"
if ($Mismatches -eq 0) {
    Write-Host "[VERIFIED] 100% of rewritten commits retain identical tree object SHAs." -ForegroundColor Green
} else {
    Write-Error "[FAILED] Found $Mismatches per-commit tree discrepancies! Aborting."
}
```
- **Expected Result:** Exactly 87 commits inspected (60 corrected + 14 descendants + 13 ancient), **0 tree mismatches**.

### Gate 2: Commit Author Count & Transition Parity
Check that exactly 60 commits were transitioned on `main`:
```powershell
# Check remaining commits authored by engineering@radiance.ai on main:
(git log main --author="engineering@radiance.ai" --format="%h" | Measure-Object).Count
# MUST RETURN: 0

# Check total commits on main authored by tanishbane99@gmail.com:
(git log main --author="tanishbane99@gmail.com" --format="%h" | Measure-Object).Count
# MUST RETURN: 84 (24 prior + 60 corrected)
```
- **Expected Result:**
  - `engineering@radiance.ai` commits on `main`: **0**
  - `tanishbane99@gmail.com` commits on `main`: **84**
  - Plus 3 Jules commits (`279507610+TanishBane@users.noreply.github.com`): **Total = 87 commits on `main`**.

### Gate 3: Preserved Co-Author Trailers Check
Verify that the Jules PR commits still retain their legitimate `google-labs-jules[bot]` co-author trailers:
```powershell
git log main --grep="Co-authored-by: google-labs-jules" --format="%h | %an <%ae> | %s"
```
- **Expected Result:** Exactly 3 commits returned with author `TanishBane <279507610+TanishBane@users.noreply.github.com>`.

### Gate 4: Timestamp & Commit Message Invariance
Compare commit messages and timestamps between the backup branch and the rewritten branch:
```powershell
# Extract subject and timestamp list from backup
git log backup/pre-rewrite-main-* --format="%aI|%s" > pre-rewrite-log.txt
# Extract subject and timestamp list from new main
git log main --format="%aI|%s" > post-rewrite-log.txt
# Compare diff
Compare-Object (Get-Content pre-rewrite-log.txt) (Get-Content post-rewrite-log.txt)
```
- **Expected Result:** **Empty output**. Timestamps and subjects match 100%.

### Gate 5: Rehaul & Dependabot Isolation Check
Verify that the exploratory `rehaul` branch and Dependabot branches were NOT altered:
```powershell
# Check rehaul author remains engineering@radiance.ai:
git log -1 --format="%an <%ae>" rehaul
# MUST RETURN: Radiance Engineering Team <engineering@radiance.ai>

# Check Dependabot branches remain authored by dependabot[bot]:
git log -1 --format="%an <%ae>" origin/dependabot/npm_and_yarn/ai-7.0.163
# MUST RETURN: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
```

### Gate 6: SHA Mapping Complete Verification
`git-filter-repo` automatically writes a commit map to `.git/filter-repo/commit-map`.
```powershell
Get-Content .git/filter-repo/commit-map | Measure-Object -Line
```
- **Expected Result:** 88 lines (1 header line + 87 commit mappings).
- Confirms a 1-to-1 deterministic translation of every commit on `main`.

### Gate 7: Automated Test Suite & TypeScript Verification
Confirm build and test suite pass without errors:
```powershell
pnpm typecheck
pnpm test --run
```
- **Expected Result:** All tests pass, exit code 0.

---

## 4. Post-Push GitHub-Side Verification Protocol

Once a future lease-protected push is authorized and completed:

### 1. Verify Remote `main` HEAD
```powershell
git rev-parse HEAD
gh api repos/TanishBane/Radiance/commits/main --jq ".sha"
```
Both hashes must match.

### 2. Verify GitHub Web Author Linking
Inspect a sample of the 60 corrected commits via GitHub API:
```powershell
# Test baseline commit (previously unlinked):
gh api repos/TanishBane/Radiance/commits/<new-baseline-sha> --jq "{sha: .sha, commit_author: .commit.author, github_author: .author.login}"
```
- **Expected Output:**
  ```json
  {
    "commit_author": {
      "email": "tanishbane99@gmail.com",
      "name": "TanishBane"
    },
    "github_author": "TanishBane"
  }
  ```
  `github_author` must now resolve to `"TanishBane"` instead of `null`!

### 3. Contribution Graph Indexing Expectations
- **GitHub Indexing Latency:** GitHub's background worker processes contribution events asynchronously. After force-pushing a rewritten default branch, recalculation typically takes between **15 minutes and 24 hours**.
- **Public Profile Verification:** Check `https://github.com/TanishBane`. The green contribution blocks for November 1–9, 2026 will populate.

### 4. Dependabot PR Rebase & Recovery Protocol
Because rewriting `main` changes the commit hashes of `c546dfa` and `fd0deef`, the 15 open Dependabot PRs will initially reference base SHAs that no longer appear in `main`'s linear branch history.

To trigger Dependabot to automatically rebase its PRs onto the newly pushed `main`:
```powershell
# Command to post '@dependabot rebase' comment on all 15 open PRs:
@(11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26) | ForEach-Object {
    Write-Host "Requesting Dependabot rebase for PR #$_..."
    gh pr comment $_ --body "@dependabot rebase"
}
```
- Dependabot will respond to each PR comment, re-evaluate dependency diffs against the new `main` HEAD, and rebase its PR branches cleanly.
- If any individual PR fails to rebase cleanly, it can be closed via `gh pr close <number> --comment "Closing for re-indexing against updated main"`; Dependabot will automatically re-create the pull request within its scheduled run.
