#!/bin/bash
# Run this in the Replit Shell: bash push-to-github.sh

echo "Setting up git identity..."
git config --global user.email "calvinmunene001@gmail.com"
git config --global user.name "calvin-munene"

echo ""
echo "Enter your GitHub Personal Access Token (paste it and press Enter):"
echo "(Get one at: github.com → Settings → Developer settings → Personal access tokens → Tokens classic → Generate new token → tick 'repo' → Generate)"
read -s TOKEN

echo ""
echo "Updating remote with token..."
git remote set-url origin https://calvin-munene:${TOKEN}@github.com/calvin-munene/Elite-motors.git

echo "Staging all files..."
git add -A

echo "Committing..."
git commit -m "AutoElite Motors - full project" --allow-empty

echo "Pushing to GitHub (force)..."
git push -u origin main --force

echo ""
echo "✓ Done! Visit https://github.com/calvin-munene/Elite-motors to verify."

# Clean token from remote URL for security
git remote set-url origin https://github.com/calvin-munene/Elite-motors.git
