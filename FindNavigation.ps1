Write-Host "
🔍 SEARCHING FOR NAVIGATION COMPONENTS..." -ForegroundColor Cyan

# Search for files containing navigation or dots
 = Get-ChildItem "src" -Recurse -Include "*.tsx", "*.ts" -File | 
    Where-Object { 
        (Get-Content .FullName -Raw) -match "navigation|nav|dots|•|\.\.\." 
    }

if () {
    Write-Host "✅ Found navigation-related files:" -ForegroundColor Green
     | Format-Table Name, Directory
    
    foreach ( in ) {
        Write-Host "
📄 CONTENT OF :" -ForegroundColor Yellow
        Get-Content .FullName -Raw
    }
} else {
    Write-Host "❌ No navigation components found with dots" -ForegroundColor Red
}

# Check for any account-specific navigation
Write-Host "
🔍 CHECKING ACCOUNT NAVIGATION PATTERNS..." -ForegroundColor Cyan
 = Get-ChildItem "src\app\account" -Recurse -Include "*.tsx", "*.ts" -File | 
    Where-Object { (Get-Content .FullName -Raw) -match "Profile|Orders|Addresses|Wishlist" }

if () {
    Write-Host "✅ Found account navigation patterns:" -ForegroundColor Green
     | Format-Table Name, Directory
}
