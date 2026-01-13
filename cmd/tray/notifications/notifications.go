package notifications

import (
	"github.com/gen2brain/beeep"
)

func Show(title, message string) {
	// placeholder icon
	beeep.Notify(title, message, "")
}
