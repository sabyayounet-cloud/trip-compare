#!/bin/bash

# TripCompare - Push to GitHub Script
# This script helps you push your code to GitHub

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║        🚀 Push TripCompare to GitHub - Easy Setup 🚀        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run 'git init' first."
    exit 1
fi

echo "📋 Step 1: Create GitHub Repository"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to: https://github.com/new"
echo "2. Repository name: trip-compare"
echo "3. Description: Travel booking platform with affiliate marketing"
echo "4. Set to: ✓ Public (required for free Render deployment)"
echo "5. Do NOT check 'Add a README'"
echo "6. Click 'Create repository'"
echo ""
read -p "Press ENTER when you've created the repository..."

echo ""
echo "📝 Step 2: Enter Your GitHub Username"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Enter your GitHub username: " username

if [ -z "$username" ]; then
    echo "❌ Username cannot be empty!"
    exit 1
fi

echo ""
echo "🔗 Setting up remote repository..."

# Remove existing remote if any
git remote remove origin 2>/dev/null

# Add new remote
git remote add origin "https://github.com/$username/trip-compare.git"

if [ $? -eq 0 ]; then
    echo "✅ Remote added: https://github.com/$username/trip-compare.git"
else
    echo "❌ Failed to add remote"
    exit 1
fi

echo ""
echo "📤 Step 3: Pushing Code to GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Pushing to: https://github.com/$username/trip-compare"
echo ""

# Push to GitHub
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║              🎉 SUCCESS! Code Pushed to GitHub! 🎉          ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "✅ Repository: https://github.com/$username/trip-compare"
    echo "✅ Branch: main"
    echo "✅ All files uploaded"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎯 NEXT STEPS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Deploy Backend to Render:"
    echo "   → Go to: https://dashboard.render.com"
    echo "   → Follow: DEPLOY_WITH_ME.md (Step 2)"
    echo ""
    echo "2. Deploy Frontend to Netlify:"
    echo "   → Go to: https://app.netlify.com"
    echo "   → Follow: DEPLOY_WITH_ME.md (Step 3)"
    echo ""
    echo "3. Your code is ready at:"
    echo "   → https://github.com/$username/trip-compare"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "This might be because:"
    echo "1. You need to authenticate with GitHub"
    echo "2. Repository doesn't exist yet"
    echo "3. Wrong username"
    echo ""
    echo "🔧 Solutions:"
    echo ""
    echo "Option A - Use Personal Access Token:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Generate new token (classic)"
    echo "3. Select: repo (full control)"
    echo "4. Copy the token"
    echo "5. When prompted for password, paste the token"
    echo ""
    echo "Option B - Use SSH:"
    echo "1. Set up SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
    echo "2. Change remote to SSH:"
    echo "   git remote set-url origin git@github.com:$username/trip-compare.git"
    echo "3. Try pushing again"
    echo ""
    exit 1
fi
