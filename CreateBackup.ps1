Write-Host "💾 CREATING BACKUP OF CURRENT IMPLEMENTATION..." -ForegroundColor Cyan

 = "backup_20251127_035832"
New-Item -ItemType Directory -Path  -Force

# Copy all account-related files
if (Test-Path "src\app\account") {
    Copy-Item -Path "src\app\account" -Destination "\account" -Recurse -Force
    Write-Host "✅ Account files backed up to " -ForegroundColor Green
}

# Copy any navigation components
 = Get-ChildItem "src" -Recurse -Include "*.tsx", "*.ts" -File | 
    Where-Object { (Get-Content .FullName -Raw) -match "navigation|nav" }

if () {
    foreach ( in ) {
         = .FullName.Replace((Get-Location).Path + "\", "")
         = "\"
         = Split-Path  -Parent
        New-Item -ItemType Directory -Path  -Force
        Copy-Item -Path .FullName -Destination  -Force
    }
    Write-Host "✅ Navigation components backed up" -ForegroundColor Green
}

Write-Host "
📊 BACKUP SUMMARY:" -ForegroundColor Yellow
Get-ChildItem  -Recurse | Format-Table Name, Directory

Write-Host "
🎯 READY FOR NAVIGATION FIXES!" -ForegroundColor Green
Write-Host "Current implementation analyzed and backed up safely." -ForegroundColor Cyan
