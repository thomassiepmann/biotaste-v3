#!/bin/bash
cd ~/vibe-workspace/projects/biotaste-v3
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "auto-backup $(date '+%Y-%m-%d %H:%M:%S')"
  git push origin test/ridges-auto-review
  echo "Backup gepusht: $(date)"
else
  echo "Keine Änderungen: $(date)"
fi
