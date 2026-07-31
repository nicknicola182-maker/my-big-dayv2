# tools

Dev tooling. Nothing here ships in `dist/index.html` — the app build never reads
this directory.

## `stop-hook-git-check.sh`

A corrected copy of the Claude Code stop hook that checks commits before a turn
ends. The version the container ships has two bugs, and it restores itself from a
template between turns, so the fix does not survive in place — hence this copy.

Re-apply it in one command:

```
cp tools/stop-hook-git-check.sh ~/.claude/stop-hook-git-check.sh
```

### What was wrong

**1. It reported correctly signed commits as unsigned.**

The signature check used `git log --format='%G?'`. That reports *trust* of a
signature, not *presence* of one — and when git cannot attempt verification at
all it returns `N`, which is indistinguishable from "no signature". In a Claude
Code container `gpg.ssh.allowedSignersFile` is unset, so verification never even
starts:

```
$ git log --format='%h %G?' -1
error: gpg.ssh.allowedSignersFile needs to be configured and exist for ssh signature verification
c88adbd N
```

Every properly signed commit therefore reported `N`, the hook fired on all of
them, and the remediation it printed was a `--reset-author` rebase — which would
rewrite already-pushed history to fix nothing. GitHub showed the same commits as
**Verified** throughout.

The fix checks for the `gpgsig` header in the commit object, which is the fact
that can actually be established locally. It reads only the header section (`sed`
quits at the blank line before the message), so a commit message that happens to
start with `gpgsig` cannot fake a signature. GitHub still does the real
cryptographic verification against the account's registered key.

**2. It ignored git's configured tracking ref.**

It guessed the upstream was `origin/<same-branch-name>`. A local branch is
frequently pushed under a different remote name — `work` →
`origin/claude/planner-worlds` here — so it reported *"no remote branch"* and N
unpushed commits for work that was fully pushed. The fix prefers `@{upstream}`
and keeps the old guess as a fallback.

### One repo-config note

`@{upstream}` only resolves if the remote-tracking ref exists, which needs a fetch
refspec broad enough to map it. This clone arrived with:

```
+refs/heads/main:refs/remotes/origin/main
```

— only `main`, so no other branch could ever resolve an upstream. Broadened to:

```
git config --unset-all remote.origin.fetch
git config --add remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'
```

Worth checking with `git config --get-all remote.origin.fetch` on a fresh clone.
