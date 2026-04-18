#!/bin/bash
# Run this once in the Replit Shell to push everything to GitHub
echo "Setting remote to Elite-motors repo..."
git remote set-url origin https://github.com/calvin-munene/Elite-motors.git

echo "Adding all files..."
git add -A

echo "Committing..."
git commit -m "AutoElite Motors - full project" --allow-empty

echo "Pushing to GitHub..."
git push -u origin main --force

echo "Done! Check https://github.com/calvin-munene/Elite-motors"
