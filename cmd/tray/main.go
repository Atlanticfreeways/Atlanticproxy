package main

import (
	"fmt"
	"time"

	"github.com/atlanticproxy/proxy-client/cmd/tray/api"
	"github.com/atlanticproxy/proxy-client/cmd/tray/icons"
	"github.com/atlanticproxy/proxy-client/cmd/tray/menu"
	"github.com/atlanticproxy/proxy-client/cmd/tray/notifications"
	"github.com/getlantern/systray"
)

func main() {
	systray.Run(onReady, onExit)
}

func onReady() {
	systray.SetIcon(icons.GetIcon("normal"))
	systray.SetTitle("AtlanticProxy")
	systray.SetTooltip("VPN-Grade Proxy Protection")

	menu.Initialize()

	go startPolling()
}

func onExit() {
	// Cleanup
}

func startPolling() {
	client := api.NewClient("http://localhost:8082")
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	var lastStatus *api.ProxyStatus

	for {
		select {
		case <-ticker.C:
			status, err := client.GetStatus()
			if err != nil {
				// TODO: Update menu to show error state?
				continue
			}

			if lastStatus != nil {
				if !lastStatus.Connected && status.Connected {
					notifications.Show("Connected", fmt.Sprintf("Connected to %s", status.Location))
				} else if lastStatus.Connected && !status.Connected {
					notifications.Show("Disconnected", "Proxy connection lost")
				}

				if !lastStatus.KillSwitch && status.KillSwitch {
					notifications.Show("Kill Switch", "Kill switch activated")
				}
			}

			menu.UpdateStatus(status)
			lastStatus = status
		}
	}
}
