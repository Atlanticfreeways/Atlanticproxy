package menu

import (
	"fmt"
	"github.com/atlanticproxy/proxy-client/cmd/tray/api"
	"github.com/getlantern/systray"
	"github.com/skratchdot/open-golang/open"
)

var (
	mStatus     *systray.MenuItem
	mLocation   *systray.MenuItem
	mKillSwitch *systray.MenuItem
	mDashboard  *systray.MenuItem
	mQuit       *systray.MenuItem
)

func Initialize() {
	mStatus = systray.AddMenuItem("Status: Disconnected", "Current connection status")
	mStatus.Disable()

	mLocation = systray.AddMenuItem("Location: Unknown", "Current server location")

	systray.AddSeparator()

	mKillSwitch = systray.AddMenuItemCheckbox("Kill Switch", "Block internet if VPN drops", false)

	systray.AddSeparator()

	mDashboard = systray.AddMenuItem("Open Dashboard", "Open the web dashboard")

	systray.AddSeparator()

	mQuit = systray.AddMenuItem("Quit", "Quit the application")

	go func() {
		for {
			select {
			case <-mKillSwitch.ClickedCh:
				// TODO: Implement kill switch toggle via API
				if mKillSwitch.Checked() {
					mKillSwitch.Uncheck()
				} else {
					mKillSwitch.Check()
				}
			case <-mDashboard.ClickedCh:
				open.Run("http://localhost:3000")
			case <-mQuit.ClickedCh:
				systray.Quit()
				return
			}
		}
	}()
}

func UpdateStatus(status *api.ProxyStatus) {
	if mStatus == nil {
		return
	}
	if status.Connected {
		mStatus.SetTitle("Status: Connected")
		mLocation.SetTitle(fmt.Sprintf("Location: %s (%s)", status.Location, status.IP))
	} else {
		mStatus.SetTitle("Status: Disconnected")
		mLocation.SetTitle("Location: Unknown")
	}

	if status.KillSwitch {
		mKillSwitch.Check()
	} else {
		mKillSwitch.Uncheck()
	}
}

func SetErrorState(err error) {
	if mStatus == nil {
		return
	}
	mStatus.SetTitle("Status: Service Unreachable")
	mLocation.SetTitle(fmt.Sprintf("Error: %v", err))
	mKillSwitch.Disable()
}
