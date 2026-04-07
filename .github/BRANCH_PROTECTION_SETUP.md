# Branch Protection Setup (Main)

Use this checklist in GitHub Settings -> Branches -> Add branch protection rule.

## Target branch
- Branch name pattern: `main`

## Enable these protections
- Require a pull request before merging
- Require approvals: at least 1 (recommended 2 for release windows)
- Dismiss stale pull request approvals when new commits are pushed
- Require review from Code Owners
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators
- Do not allow force pushes
- Do not allow deletions

## Required status checks
- `build-and-lint` (from `Quality Gate` workflow)

## Optional but recommended
- Require conversation resolution before merging
- Restrict who can push to matching branches
- Enable merge queue for busy release periods

## Repository prerequisites
- CODEOWNERS file configured: `.github/CODEOWNERS`
- CI secrets configured for quality gates
- Release templates in use for PR and go-live signoff
