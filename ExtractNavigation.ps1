Write-Host "🎯 EXTRACTING CURRENT NAVIGATION IMPLEMENTATION..." -ForegroundColor Cyan

# Function to extract code snippets with context
function Extract-NavigationCode {
    param([string])
    
     = Get-ChildItem  -Recurse -Include "*.tsx", "*.ts" -File
     = @()
    
    foreach ( in ) {
         = Get-Content .FullName -Raw
         = Get-Content .FullName
        
        # Look for navigation patterns, dots, or section indicators
        for ( = 0;  -lt .Count; ++) {
            if ([] -match "•|\.\.\.|navigation|nav|section|Profile|Orders|Address|Wishlist") {
                # Get context (2 lines before and after)
                 = [Math]::Max(0,  - 2)
                 = [Math]::Min(.Count - 1,  + 2)
                 = [..] -join "
"
                
                 += [PSCustomObject]@{
                    File = .Name
                    Path = .FullName
                    Line =  + 1
                    Context = 
                }
            }
        }
    }
    
    return 
}

# Extract navigation code from entire src directory
 = Extract-NavigationCode -Path "src"

if () {
    Write-Host "✅ CURRENT NAVIGATION IMPLEMENTATION FOUND:" -ForegroundColor Green
     | Format-Table File, Line, Context -Wrap
    
    # Save to file for analysis
     | ConvertTo-Json -Depth 3 | Out-File "current_navigation_analysis.json" -Encoding UTF8
    Write-Host "📁 Navigation analysis saved to current_navigation_analysis.json" -ForegroundColor Yellow
} else {
    Write-Host "❌ No navigation implementation found" -ForegroundColor Red
}
