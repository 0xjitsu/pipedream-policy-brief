# Daily Auto-Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the MBC policy brief website rebuilds and deploys automatically every day so content changes are always live.

**Architecture:** Create a Vercel Deploy Hook (webhook URL) and trigger it daily via GitHub Actions cron. This is zero-dependency, works with the existing static architecture, and costs nothing on GitHub's free tier. No code changes to the Next.js app are needed.

**Tech Stack:** GitHub Actions (cron scheduler), Vercel Deploy Hooks (webhook trigger), GitHub Secrets (secure token storage)

---

### Task 1: Create Vercel Deploy Hook

**Files:**
- No files. This is a Vercel Dashboard/CLI action.

- [ ] **Step 1: Create the deploy hook via Vercel CLI**

```bash
# Deploy hooks are created in the Vercel Dashboard:
# Project Settings > Git > Deploy Hooks
# Name: "daily-auto-deploy"
# Branch: "main"
#
# This generates a URL like:
# https://api.vercel.com/v1/integrations/deploy/prj_xxxx/yyyy
```

Alternatively, create via API:
```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_zLkODEzKbP0xoze1LHxQY5fDVA4T" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"daily-auto-deploy","ref":"main"}'
```

- [ ] **Step 2: Store the deploy hook URL as a GitHub repo secret**

```bash
gh secret set VERCEL_DEPLOY_HOOK --repo 0xjitsu/mbc_policy_brief
# Paste the deploy hook URL when prompted
```

- [ ] **Step 3: Verify the secret is stored**

```bash
gh secret list --repo 0xjitsu/mbc_policy_brief
```
Expected: `VERCEL_DEPLOY_HOOK` appears in the list.

---

### Task 2: Create GitHub Actions Cron Workflow

**Files:**
- Create: `.github/workflows/daily-deploy.yml`

- [ ] **Step 1: Create the workflow directory**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Write the workflow file**

```yaml
# .github/workflows/daily-deploy.yml
name: Daily Deploy

on:
  schedule:
    # Run at 00:00 UTC daily (08:00 PHT)
    - cron: '0 0 * * *'
  workflow_dispatch: # Allow manual trigger from GitHub UI

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Deploy Hook
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${{ secrets.VERCEL_DEPLOY_HOOK }}")
          if [ "$response" -eq 200 ] || [ "$response" -eq 201 ]; then
            echo "Deploy triggered successfully (HTTP $response)"
          else
            echo "Deploy trigger failed (HTTP $response)"
            exit 1
          fi
```

- [ ] **Step 3: Commit the workflow file**

```bash
git add .github/workflows/daily-deploy.yml
git commit -m "ci: add daily auto-deploy via Vercel deploy hook

Triggers a production rebuild at 00:00 UTC (08:00 PHT) daily.
Also supports manual trigger via workflow_dispatch."
```

- [ ] **Step 4: Push to main**

```bash
git push origin main
```

- [ ] **Step 5: Verify the workflow appears on GitHub**

```bash
gh workflow list --repo 0xjitsu/mbc_policy_brief
```
Expected: "Daily Deploy" appears in the list.

---

### Task 3: Test the Pipeline

- [ ] **Step 1: Manually trigger the workflow**

```bash
gh workflow run daily-deploy.yml --repo 0xjitsu/mbc_policy_brief
```

- [ ] **Step 2: Watch the run**

```bash
gh run list --workflow=daily-deploy.yml --repo 0xjitsu/mbc_policy_brief --limit 1
```
Expected: Status shows `completed` with conclusion `success`.

- [ ] **Step 3: Verify a new deployment was created on Vercel**

```bash
npx vercel ls --scope xjitsu | head -5
```
Expected: A new deployment with a timestamp matching the trigger time.

---

## Summary

| Component | What | Where |
|-----------|------|-------|
| Deploy Hook | Webhook URL that triggers a Vercel production build | Vercel Dashboard > Project Settings > Git > Deploy Hooks |
| GitHub Secret | `VERCEL_DEPLOY_HOOK` storing the webhook URL | GitHub repo Settings > Secrets |
| Cron Workflow | GitHub Actions running daily at 00:00 UTC | `.github/workflows/daily-deploy.yml` |
| Manual Trigger | `workflow_dispatch` for on-demand deploys | GitHub Actions UI or `gh workflow run` |

**Schedule:** 00:00 UTC = 08:00 PHT (rebuilds before business hours in Manila)

**Cost:** Free. GitHub Actions free tier includes 2,000 minutes/month. This workflow uses ~30 seconds/day = ~15 minutes/month.
