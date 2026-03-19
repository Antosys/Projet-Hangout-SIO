#!/bin/bash
# Script pour lancer HangoutMobile sans les problèmes de tunnel ngrok

cd "c:\CFA\Hangout\Projet\event-app\mobile\HangoutMobile"

echo "🚀 Lancement de HangoutMobile en mode développement..."
echo ""
echo "Options disponibles:"
echo "1. Mode LAN (local wifi) - RECOMMANDÉ"
echo "2. Mode Web (sur navigateur)"
echo ""

# Lancer en mode LAN (pas besoin de ngrok)
npx expo start --lan

