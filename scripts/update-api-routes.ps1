# API Route Update Script
# This will add sanitization to all API routes

$apiRoutes = Get-ChildItem -Path "src\app\api" -Recurse -Filter "route.ts"

foreach ($route in $apiRoutes) {
    Write-Host "Processing: $($route.FullName)" -ForegroundColor Cyan
    
    $content = Get-Content $route.FullName -Raw
    
    # Check if it already has the sanitization
    if ($content -match "import.*cleanProductData") {
        Write-Host "  ⏭️ Already has sanitization" -ForegroundColor Yellow
        continue
    }
    
    # Add import if not exists
    if ($content -match "import.*from.*@/lib/prisma") {
        $newContent = $content -replace 
            "(import { prisma } from '@/lib/prisma';)",
            "`$1`nimport { cleanProductData } from '@/lib/utils/textSanitizer';"
        
        # Add sanitization to the response
        $newContent = $newContent -replace
            "(return NextResponse.json\()([^;]+)(\);)",
            "`$1`$2.map(p => cleanProductData(p, ['title', 'brand', 'spec', 'category']))`$3"
        
        $newContent | Out-File $route.FullName -Encoding UTF8
        Write-Host "  ✅ Updated" -ForegroundColor Green
    }
}
