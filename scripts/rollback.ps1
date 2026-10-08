# Rollback Script
$backupDir = Get-ChildItem -Path "." -Filter "backup-textsanitizer-*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($backupDir) {
    Write-Host "Restoring from: $($backupDir.Name)" -ForegroundColor Yellow
    
    if (Test-Path "$backupDir\page.tsx.backup") {
        Copy-Item "$backupDir\page.tsx.backup" "src\app\page.tsx" -Force
        Write-Host "✅ Restored: page.tsx"
    }
    
    if (Test-Path "$backupDir\products-route.ts.backup") {
        Copy-Item "$backupDir\products-route.ts.backup" "src\app\api\products\route.ts" -Force
        Write-Host "✅ Restored: products/route.ts"
    }
    
    Write-Host "✅ Rollback complete!" -ForegroundColor Green
} else {
    Write-Host "❌ No backup found!" -ForegroundColor Red
}
