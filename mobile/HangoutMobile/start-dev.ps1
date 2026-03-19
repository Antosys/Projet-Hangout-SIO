# Script PowerShell pour lancer HangoutMobile sans problèmes de répertoire
# Enregistrez ce fichier en tant que start-dev.ps1 dans le dossier HangoutMobile

$projectPath = "c:\CFA\Hangout\Projet\event-app\mobile\HangoutMobile"

Write-Host "🚀 Démarrage de HangoutMobile..." -ForegroundColor Green
Write-Host ""

# Vérifier que le répertoire existe
if (!(Test-Path $projectPath)) {
    Write-Host "❌ Erreur: Le dossier $projectPath n'existe pas!" -ForegroundColor Red
    exit 1
}

# Changer de répertoire
Set-Location $projectPath
Write-Host "📁 Répertoire: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Vérifier que package.json existe
if (!(Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé!" -ForegroundColor Red
    exit 1
}

Write-Host "💡 Options de lancement:" -ForegroundColor Yellow
Write-Host "  • Tapez 'i' pour lancer en mode iOS (recommandé)" -ForegroundColor Cyan
Write-Host "  • Tapez 'a' pour lancer en mode Android" -ForegroundColor Cyan
Write-Host "  • Tapez 'w' pour lancer en mode Web" -ForegroundColor Cyan
Write-Host "  • Tapez 'q' pour quitter" -ForegroundColor Cyan
Write-Host ""

# Lancer Expo en mode interactif
& npx expo start --clear
