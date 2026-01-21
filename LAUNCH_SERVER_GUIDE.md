# Launch Guide: Server & Backend

Since SugarReset uses **Firebase**, you do not need to manage a traditional server (like AWS EC2 or DigitalOcean). Your "server" is a set of managed services: **Firestore** (Database), **Auth**, and **Cloud Functions**.

## 1. Architecture Overview
*   **Database**: Firestore (NoSQL). Stores Users, Posts, Stats.
*   **Backend Logic**: Cloud Functions (`functions/index.js`). These handle secure tasks like calculating community stats and fetching data safely.
*   **Security**: `firestore.rules`. These act as your firewall, preventing invalid data and unauthorized access.

## 2. Deployment Steps
You must deploy your backend configuration to production before launching. Run these commands from your terminal in the project root:

### Step A: Login
```bash
npx firebase login
```
*Note: Ensure you are logged into the correct Google account for the SugarReset project.*

### Step B: Deploy Security Rules (CRITICAL)
We recently hardened these rules to prevent spam and hacking. You **must** deploy them.
```bash
npx firebase deploy --only firestore:rules
```

### Step C: Deploy Indexes
If users report "Missing Index" errors when sorting posts (e.g. by Hot/Top), you need to deploy indexes.
```bash
npx firebase deploy --only firestore:indexes
```

### Step D: Deploy Cloud Functions
Your app relies on Cloud Functions to calculate Community Stats (Total Users, Streaks).
```bash
cd functions
npm install
cd ..
npx firebase deploy --only functions
```
*Note: This effectively "uploads" your `functions/index.js` logic to Google's servers.*

## 3. Post-Deployment Checks
1.  **Monitor Usage**: Go to the [Firebase Console](https://console.firebase.google.com) -> Functions to ensure `updateCommunityStats` isn't being called excessively (it reads all user stats!).
2.  **Check Indexes**: Go to Firestore -> Indexes. Ensure the status is "Enabled".

## 4. Future Optimization (Post-Launch)
Currently, `updateCommunityStats` is triggered by the app. As you grow, this will become expensive.
*   **Recommendation**: Move `updateCommunityStats` to a **Scheduled Function** (e.g., run once every hour) instead of letting users trigger it. This prevents "Denial of Wallet" attacks where someone spams the update button.

## 5. Environment Variables
Ensure your production app uses the Production Firebase keys.
*   If you use EAS Build, set these secrets in Expo/EAS dashboard.
*   If you build locally, ensure `.env` contains the production keys, not development ones.
