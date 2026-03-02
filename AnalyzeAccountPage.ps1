# My Account Page Analysis Script
Write-Host "🔍 ANALYZING MY ACCOUNT PAGE STRUCTURE..." -ForegroundColor Cyan

# Check if the account directory exists
if (Test-Path "src\app\account") {
    Write-Host "✅ Account directory found" -ForegroundColor Green
    
    # List all files in account directory
    Write-Host "
📁 ACCOUNT DIRECTORY FILES:" -ForegroundColor Yellow
    Get-ChildItem "src\app\account" -Recurse -File | Format-Table Name, Directory
    
    # Extract the main account page
    if (Test-Path "src\app\account\page.tsx") {
        Write-Host "
📄 MY ACCOUNT PAGE CONTENT:" -ForegroundColor Yellow
        Get-Content "src\app\account\page.tsx" -Raw
    } else {
        Write-Host "❌ account/page.tsx not found" -ForegroundColor Red
    }
    
    # Extract account layout
    if (Test-Path "src\app\account\layout.tsx") {
        Write-Host "
🏗️ ACCOUNT LAYOUT CONTENT:" -ForegroundColor Yellow
        Get-Content "src\app\account\layout.tsx" -Raw
    } else {
        Write-Host "❌ account/layout.tsx not found" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Account directory not found at src\app\account" -ForegroundColor Red
    Write-Host "Creating directory structure..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "src\app\account" -Force
}
