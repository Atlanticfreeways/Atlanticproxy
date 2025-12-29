# 🌊 AtlanticProxy User Guide

Welcome to the AtlanticProxy User Guide! This document provides instructions on how to install, configure, and use the AtlanticProxy client to secure your connection and manage your proxy settings.

## 📥 Installation

### macOS
1.  Download the **AtlanticProxy.dmg** installer.
2.  Double-click the `.dmg` file to mount it.
3.  Drag the **AtlanticProxy** app icon into your **Applications** folder.
4.  Launch AtlanticProxy from your Applications folder.
    *   *Note: On first run, you may need to allow the application in System Settings > Privacy & Security if it is not signed by a recognized developer (Ad-Hoc).*

### Windows
1.  Download the **AtlanticProxy-win64.zip** file.
2.  Extract the contents to a folder of your choice (e.g., `C:\Program Files\AtlanticProxy`).
3.  Right-click `AtlanticService.exe` and select **Run as Administrator** (required for network interception).
4.  Double-click `AtlanticProxy.exe` to launch the dashboard tray application.

### Linux
1.  Download the **AtlanticProxy-linux-amd64.tar.gz** file.
2.  Extract the archive: `tar -xzf AtlanticProxy-linux-amd64.tar.gz`.
3.  Install the service using the provided script or manually copy binaries to `/usr/local/bin`.
4.  Start the service: `sudo systemctl start atlantic-proxy`.

---

## 🚀 Getting Started

### 1. Launching the App
When you open AtlanticProxy, it will appear as an icon in your system tray (menu bar on macOS). Click the icon and select **Open Dashboard** to view the main interface.

### 2. Dashboard Overview
The dashboard provides real-time insights into your connection:
*   **Connection Status**: Shows if you are Connected or Disconnected.
*   **Current IP**: Your visible IP address.
*   **Data Usage**: Real-time graph of upload/download speeds.

### 3. Connecting
1.  On the **Dashboard** home screen, click the large **CONNECT** button.
2.  The status will change to "Connecting..." and then "Connected".
3.  Your traffic is now routed through the secure proxy network.

---

## ✨ Features

### 🛡️ Ad-Blocking
Block intrusive ads and trackers to speed up browsing and protect privacy.
1.  Navigate to the **Ad-Block** tab.
2.  **Statistics**: View how many ads and trackers have been blocked today.
3.  **Update Lists**: Click "Update Lists" to fetch the latest blocking rules.
4.  **Custom Rules**: Enter your own domains to block (one per line) in the text area and click **Save**.
5.  **Whitelist**: Add domains you want to allow (bypass blocking) in the Whitelist section.

### 🔄 IP Rotation
Automatically change your IP address to maintain anonymity.
1.  Navigate to **Rotation** settings.
2.  **Mode**: Choose between " sticky" (keep IP for X minutes) or "random" (change every request).
3.  **Interval**: Set the rotation interval (e.g., 10m, 30m).
4.  **Force Rotate**: Click "Rotate Now" to immediately get a new IP.

### 🔒 Kill Switch
Prevent data leaks if the secure connection drops.
1.  Toggle the **Kill Switch** on the Dashboard or Settings page.
2.  When enabled, if the proxy connection fails, all internet traffic will be blocked until the connection is restored.

### 💳 Billing & Plans
Manage your subscription and usage.
1.  Navigate to **Billing**.
2.  **Current Plan**: View your active plan (Starter, Personal, Team).
3.  **Usage**: Check your data and request limits.
4.  **Upgrade**: Select a higher tier plan to unlock more data or countries.

---

## 🔧 Troubleshooting

### "Service Not Running"
*   **Windows**: Ensure you ran `AtlanticService.exe` as Administrator.
*   **Linux**: Check service status with `systemctl status atlantic-proxy`.
*   **macOS**: Check the helper tool installation status.

### Slow Connection
*   Try changing your **Location** to a server closer to you.
*   Disable **Ad-Blocking** temporarily to see if it's interfering with specific sites.
*   Check your internet connection speed without the proxy.

### License/Quota Issues
*   Go to **Billing** to check if you have exceeded your data or request limit.
*   Refresh your account status.

---

**Need Help?**
Contact support at support@atlanticproxy.com or visit our [online documentation](https://docs.atlanticproxy.com).
