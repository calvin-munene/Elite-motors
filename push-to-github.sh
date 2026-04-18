#!/bin/bash
# Uses GITHUB_TOKEN from Replit Secrets - never hardcode tokens in files
git config --global user.email "calvinmunene001@gmail.com"
git config --global user.name "calvin-munene"
git remote set-url origin https://calvin-munene:${GITHUB_TOKEN}@github.com/calvin-munene/Elite-motors.git
git add -A
git commit -m "AutoElite Motors - full project" --allow-empty
git push -u origin main --force
git remote set-url origin https://github.com/calvin-munene/Elite-motors.git
echo "DONE - check https://github.com/calvin-munene/Elite-motors"
