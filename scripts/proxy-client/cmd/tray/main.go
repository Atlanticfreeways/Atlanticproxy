package main

import (
	"fmt"
	"time"

	"github.com/getlantern/systray"
)

func main() {
	systray.Run(onReady, onExit)
}

func onReady() {
	systray.SetIcon(getIcon())
	systray.SetTitle("Atlantic Proxy")
	systray.SetTooltip("Atlantic Proxy Client - Protected")

	mStatus := systray.AddMenuItem("Status: Active", "Current connection status")
	mIP := systray.AddMenuItem("IP: 10.8.0.1", "Current protected IP")
	systray.AddSeparator()
	mAdBlock := systray.AddMenuItemCheckbox("Ad-Blocking", "Enable/Disable Ad Blocking", true)
	systray.AddSeparator()
	mQuit := systray.AddMenuItem("Quit", "Quit the application")

	go func() {
		for {
			select {
			case <-mStatus.ClickedCh:
				// Toggle status logic placeholder
			case <-mAdBlock.ClickedCh:
				if mAdBlock.Checked() {
					mAdBlock.Uncheck()
				} else {
					mAdBlock.Check()
				}
			case <-mQuit.ClickedCh:
				systray.Quit()
				return
			}
		}
	}()

	// Simulate status updates
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		for range ticker.C {
			// In real app, we would query the Service status via API or internal bus
			mIP.SetTitle(fmt.Sprintf("IP: 10.8.0.%d", 1+time.Now().Second()%254))
		}
	}()
}

func onExit() {
	// Clean up here
}

func getIcon() []byte {
	// Placeholder for icon data
	// In real implementation, returning byte slice of a .ico or .png
	return []byte{}
}
