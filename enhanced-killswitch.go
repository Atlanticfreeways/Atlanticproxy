package main

import (
	"context"
	"fmt"
	"net"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"sync"
	"time"
)

type KillSwitch struct {
	active     bool
	mutex      sync.RWMutex
	ctx        context.Context
	cancel     context.CancelFunc
	leakDetect *LeakDetector
}

type LeakDetector struct {
	originalIP string
	proxyIP    string
	monitoring bool
	mutex      sync.RWMutex
}

func NewKillSwitch() *KillSwitch {
	ctx, cancel := context.WithCancel(context.Background())
	return &KillSwitch{
		ctx:        ctx,
		cancel:     cancel,
		leakDetect: &LeakDetector{},
	}
}

func (ks *KillSwitch) Activate() error {
	ks.mutex.Lock()
	defer ks.mutex.Unlock()

	if ks.active {
		return nil
	}

	// Block all traffic instantly
	if err := ks.blockAllTraffic(); err != nil {
		return fmt.Errorf("failed to activate kill switch: %v", err)
	}

	ks.active = true
	fmt.Println("🛡️  KILL SWITCH ACTIVATED - All traffic blocked")
	return nil
}

func (ks *KillSwitch) Deactivate() error {
	ks.mutex.Lock()
	defer ks.mutex.Unlock()

	if !ks.active {
		return nil
	}

	// Restore traffic flow
	if err := ks.restoreTraffic(); err != nil {
		return fmt.Errorf("failed to deactivate kill switch: %v", err)
	}

	ks.active = false
	fmt.Println("✅ Kill switch deactivated - Traffic restored")
	return nil
}

func (ks *KillSwitch) blockAllTraffic() error {
	switch runtime.GOOS {
	case "darwin":
		return ks.blockTrafficMacOS()
	case "linux":
		return ks.blockTrafficLinux()
	case "windows":
		return ks.blockTrafficWindows()
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
}

func (ks *KillSwitch) restoreTraffic() error {
	switch runtime.GOOS {
	case "darwin":
		return ks.restoreTrafficMacOS()
	case "linux":
		return ks.restoreTrafficLinux()
	case "windows":
		return ks.restoreTrafficWindows()
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
}

func (ks *KillSwitch) blockTrafficMacOS() error {
	// Block all outbound traffic except localhost
	rules := `block out all
pass out on lo0 all
pass out to 127.0.0.1 all`
	cmd := exec.Command("pfctl", "-f", "/dev/stdin")
	cmd.Stdin = strings.NewReader(rules)
	return cmd.Run()
}

func (ks *KillSwitch) restoreTrafficMacOS() error {
	return exec.Command("pfctl", "-F", "all").Run()
}

func (ks *KillSwitch) blockTrafficLinux() error {
	// Flush existing rules and block all
	exec.Command("iptables", "-F").Run()
	exec.Command("iptables", "-P", "INPUT", "DROP").Run()
	exec.Command("iptables", "-P", "FORWARD", "DROP").Run()
	exec.Command("iptables", "-P", "OUTPUT", "DROP").Run()
	
	// Allow localhost
	exec.Command("iptables", "-A", "OUTPUT", "-o", "lo", "-j", "ACCEPT").Run()
	exec.Command("iptables", "-A", "INPUT", "-i", "lo", "-j", "ACCEPT").Run()
	
	return nil
}

func (ks *KillSwitch) restoreTrafficLinux() error {
	exec.Command("iptables", "-F").Run()
	exec.Command("iptables", "-P", "INPUT", "ACCEPT").Run()
	exec.Command("iptables", "-P", "FORWARD", "ACCEPT").Run()
	exec.Command("iptables", "-P", "OUTPUT", "ACCEPT").Run()
	return nil
}

func (ks *KillSwitch) blockTrafficWindows() error {
	// Block all outbound traffic
	return exec.Command("netsh", "advfirewall", "set", "allprofiles", "firewallpolicy", "blockinbound,blockoutbound").Run()
}

func (ks *KillSwitch) restoreTrafficWindows() error {
	return exec.Command("netsh", "advfirewall", "set", "allprofiles", "firewallpolicy", "blockinbound,allowoutbound").Run()
}

func (ks *KillSwitch) StartLeakDetection() {
	ks.leakDetect.mutex.Lock()
	defer ks.leakDetect.mutex.Unlock()

	if ks.leakDetect.monitoring {
		return
	}

	// Get original IP
	if ip, err := ks.getPublicIP(); err == nil {
		ks.leakDetect.originalIP = ip
	}

	ks.leakDetect.monitoring = true
	go ks.monitorLeaks()
	fmt.Println("🔍 Leak detection started")
}

func (ks *KillSwitch) StopLeakDetection() {
	ks.leakDetect.mutex.Lock()
	defer ks.leakDetect.mutex.Unlock()
	ks.leakDetect.monitoring = false
	fmt.Println("⏹️  Leak detection stopped")
}

func (ks *KillSwitch) monitorLeaks() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ks.ctx.Done():
			return
		case <-ticker.C:
			ks.leakDetect.mutex.RLock()
			if !ks.leakDetect.monitoring {
				ks.leakDetect.mutex.RUnlock()
				return
			}
			ks.leakDetect.mutex.RUnlock()

			if ks.detectLeak() {
				fmt.Println("🚨 IP LEAK DETECTED - Activating kill switch")
				ks.Activate()
			}
		}
	}
}

func (ks *KillSwitch) detectLeak() bool {
	currentIP, err := ks.getPublicIP()
	if err != nil {
		return false
	}

	ks.leakDetect.mutex.RLock()
	originalIP := ks.leakDetect.originalIP
	ks.leakDetect.mutex.RUnlock()

	// If current IP matches original IP, we have a leak
	return currentIP == originalIP && originalIP != ""
}

func (ks *KillSwitch) getPublicIP() (string, error) {
	conn, err := net.DialTimeout("tcp", "8.8.8.8:80", 3*time.Second)
	if err != nil {
		return "", err
	}
	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.TCPAddr)
	return localAddr.IP.String(), nil
}

func (ks *KillSwitch) IsActive() bool {
	ks.mutex.RLock()
	defer ks.mutex.RUnlock()
	return ks.active
}

func (ks *KillSwitch) Status() string {
	ks.mutex.RLock()
	active := ks.active
	ks.mutex.RUnlock()

	ks.leakDetect.mutex.RLock()
	monitoring := ks.leakDetect.monitoring
	originalIP := ks.leakDetect.originalIP
	ks.leakDetect.mutex.RUnlock()

	status := "🛡️  ENHANCED KILL SWITCH STATUS\n"
	status += fmt.Sprintf("Active: %v\n", active)
	status += fmt.Sprintf("Leak Detection: %v\n", monitoring)
	if originalIP != "" {
		status += fmt.Sprintf("Original IP: %s\n", originalIP)
	}
	return status
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: ./enhanced-killswitch [activate|deactivate|status|monitor]")
		os.Exit(1)
	}

	ks := NewKillSwitch()
	defer ks.cancel()

	switch os.Args[1] {
	case "activate":
		if err := ks.Activate(); err != nil {
			fmt.Printf("Error: %v\n", err)
			os.Exit(1)
		}
	case "deactivate":
		if err := ks.Deactivate(); err != nil {
			fmt.Printf("Error: %v\n", err)
			os.Exit(1)
		}
	case "status":
		fmt.Print(ks.Status())
	case "monitor":
		ks.StartLeakDetection()
		fmt.Println("Monitoring for leaks... Press Ctrl+C to stop")
		select {}
	default:
		fmt.Println("Invalid command. Use: activate, deactivate, status, or monitor")
		os.Exit(1)
	}
}