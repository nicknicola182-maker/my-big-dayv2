#!/bin/bash

# Read the JSON input from stdin
input=$(cat)

# Check if stop hook is already active (recursion prevention)
stop_hook_active=$(echo "$input" | jq -r '.stop_hook_active')
if [[ "$stop_hook_active" = "true" ]]; then
  exit 0
fi

# Check if we're in a git repository - bail if not
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  exit 0
fi

# Bail if there's no remote to push to. Every error path below asks the user
# to "push to the remote branch" — meaningless without a remote, and
# unsatisfiable if signing also requires a source. This case arises when CCR
# was launched against a local repo with no github remote (sources=[]) and
# the container's cwd has a leftover .git from a cached resume.
if [[ -z "$(git remote)" ]]; then
  exit 0
fi

# Check for uncommitted changes (both staged and unstaged)
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "There are uncommitted changes in the repository. Please commit and push these changes to the remote branch." >&2
  exit 2
fi

# Check for untracked files that might be important
untracked_files=$(git ls-files --others --exclude-standard)
if [[ -n "$untracked_files" ]]; then
  echo "There are untracked files in the repository. Please commit and push these changes to the remote branch." >&2
  exit 2
fi

current_branch=$(git branch --show-current)
if [[ -n "$current_branch" ]]; then
  # Prefer the tracking ref git actually has configured — a local branch is
  # often pushed under a different remote name (work -> origin/claude/feature-x),
  # and guessing origin/<same-name> reports "no remote branch" for work that is
  # in fact fully pushed.
  if tracking=$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null) && [[ -n "$tracking" ]]; then
    upstream="$tracking"
  elif git rev-parse "origin/$current_branch" >/dev/null 2>&1; then
    upstream="origin/$current_branch"
  else
    upstream="origin/HEAD"
  fi

  # Check for local commits that GitHub will show as "Unverified": either no
  # signature at all, or a committer email other than noreply@anthropic.com.
  #
  # Do NOT use %G? here. It reports trust-of-signature, not presence-of-signature,
  # and returns N -- indistinguishable from "unsigned" -- whenever git cannot
  # attempt verification at all. That is the normal state in this container:
  # gpg.ssh.allowedSignersFile is unset, so git errors with
  # "gpg.ssh.allowedSignersFile needs to be configured and exist" and reports N
  # for correctly signed commits.
  if [[ "$(git config --type=bool commit.gpgsign 2>/dev/null)" == "true" ]]; then
    unverifiable=$(
      git log --format='%h %ce' "$upstream..HEAD" 2>/dev/null | while read -r sha ce; do
        if ! git cat-file commit "$sha" 2>/dev/null | sed -n '/^$/q;p' | grep -q '^gpgsig'; then
          echo "$sha unsigned $ce"
        elif [[ "$ce" != "noreply@anthropic.com" ]]; then
          echo "$sha wrong-committer-email $ce"
        fi
      done
    )
    if [[ -n "$unverifiable" ]]; then
      echo "There are commit(s) on branch '$current_branch' that GitHub will show as Unverified (missing signature, or committer email is not noreply@anthropic.com):" >&2
      echo "$unverifiable" >&2
      echo "Please run 'git config user.email noreply@anthropic.com && git config user.name Claude', then 'git commit --amend --no-edit --reset-author' for the tip commit, or 'git rebase --exec \"git commit --amend --no-edit --reset-author\" $upstream' for earlier commits, then push." >&2
      exit 2
    fi
  fi

  unpushed=$(git rev-list "$upstream..HEAD" --count 2>/dev/null) || unpushed=0
  if [[ "$unpushed" -gt 0 ]]; then
    if [[ "$upstream" == "origin/$current_branch" ]]; then
      echo "There are $unpushed unpushed commit(s) on branch '$current_branch'. Please push these changes to the remote repository." >&2
    else
      echo "Branch '$current_branch' has $unpushed unpushed commit(s) and no remote branch. Please push these changes to the remote repository." >&2
    fi
    exit 2
  fi
fi

exit 0
