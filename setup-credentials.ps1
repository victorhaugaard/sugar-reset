$env:EXPO_APPLE_API_KEY_PATH="c:/Users/got2b/sugar-reset/ApiKey_NLMNXRANVNZB.p8"
$env:EXPO_APPLE_API_KEY_ID="NLMNXRANVNZB"
$env:EXPO_APPLE_API_KEY_ISSUER_ID="7ad049c6-6190-4446-8849-27133e3c6443"
$env:EXPO_APPLE_TEAM_ID="LX5566JXPP"

Write-Host "Setting up environment variables for Apple API Key & Team ID..."
Write-Host "Starting interactive credentials setup..."
Write-Host "1. Select 'production' build profile."
Write-Host "2. If asked to log in to Apple ID, answer 'n' (No)."
Write-Host "3. Follow prompts to 'Set up a new Distribution Certificate'."

eas credentials -p ios
