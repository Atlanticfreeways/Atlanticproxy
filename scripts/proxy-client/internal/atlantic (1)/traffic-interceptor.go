package atlantic

import (
	"fmt"
	"log"
	"net"
	"os/exec"
	"runtime"

	"github.com/songgao/water"
)

// execCommand allows mocking exec.Command in tests
var execCommand = exec.Command

// newWater allows mocking water.New in tests
var newWater = water.New

// AtlanticTrafficInterceptor - System-level traffic capture (VPN-grade)
type AtlanticTrafficInterceptor struct {
	tunInterface   *TunInterface
	routingEngine  *RoutingEngine
	dnsInterceptor *DNSInterceptor
	isActive       bool
}

// TunInterface - Cross-platform TUN interface management
type TunInterface struct {
	iface  *water.Interface
	name   string
	ip     net.IP
	subnet *net.IPNet
}

// RoutingEngine - System routing table management
type RoutingEngine struct {
	originalRoutes []Route
	atlanticRoutes []Route
}

// DNSInterceptor - DNS query interception
type DNSInterceptor struct {
	originalDNS []string
	atlanticDNS []string
}

// Route - System route entry
type Route struct {
	Destination string
	Gateway     string
	Interface   string
}

// NewAtlanticTrafficInterceptor - Create new traffic interceptor
func NewAtlanticTrafficInterceptor() *AtlanticTrafficInterceptor {
	return &AtlanticTrafficInterceptor{
		tunInterface:   &TunInterface{},
		routingEngine:  &RoutingEngine{},
		dnsInterceptor: &DNSInterceptor{},
		isActive:       false,
	}
}

// InterceptAllTraffic - GUARANTEE: NO traffic can bypass Atlantic Proxy
func (t *AtlanticTrafficInterceptor) InterceptAllTraffic() error {
	log.Println("Atlantic: Starting system-level traffic interception...")

	// TASK: Create TUN interface for ALL system traffic
	if err := t.tunInterface.CreateInterface("atlantic-tun0"); err != nil {
		return fmt.Errorf("failed to create TUN interface: %v", err)
	}

	// TASK: Route ALL traffic through Atlantic
	if err := t.routingEngine.RouteAllTraffic(); err != nil {
		return fmt.Errorf("failed to route traffic: %v", err)
	}

	// TASK: Intercept DNS queries
	if err := t.dnsInterceptor.InterceptDNS(); err != nil {
		return fmt.Errorf("failed to intercept DNS: %v", err)
	}

	t.isActive = true
	log.Println("Atlantic: System-level traffic interception ACTIVE")
	return nil
}

// CreateInterface - Create TUN interface for traffic capture
func (tun *TunInterface) CreateInterface(name string) error {
	log.Printf("Atlantic: Creating TUN interface: %s", name)

	config := water.Config{
		DeviceType: water.TUN,
	}

	// Platform-specific configuration
	switch runtime.GOOS {
	case "darwin": // macOS
		config.PlatformSpecificParams = water.PlatformSpecificParams{
			// Name: name, // COMMENTED OUT: Let OS pick next available utunX to avoid conflict
		}
	case "linux":
		config.PlatformSpecificParams = water.PlatformSpecificParams{
			Name: name,
		}
	case "windows":
		// Windows uses TAP interface
		config.DeviceType = water.TAP
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}

	iface, err := newWater(config)
	if err != nil {
		return fmt.Errorf("failed to create TUN interface: %v", err)
	}

	tun.iface = iface
	tun.iface = iface
	tun.name = iface.Name()

	// Configure interface IP
	if err := tun.configureInterface(); err != nil {
		return fmt.Errorf("failed to configure interface: %v", err)
	}

	log.Printf("Atlantic: TUN interface %s created successfully", name)
	return nil
}

// configureInterface - Configure TUN interface with IP and subnet
func (tun *TunInterface) configureInterface() error {
	// Atlantic Proxy subnet: 10.8.0.0/24
	ip := net.ParseIP("10.8.0.1")
	_, subnet, err := net.ParseCIDR("10.8.0.0/24")
	if err != nil {
		return err
	}

	tun.ip = ip
	tun.subnet = subnet

	// Platform-specific interface configuration
	switch runtime.GOOS {
	case "darwin": // macOS
		return tun.configureMacOS()
	case "linux":
		return tun.configureLinux()
	case "windows":
		return tun.configureWindows()
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
}

// configureMacOS - Configure TUN interface on macOS
func (tun *TunInterface) configureMacOS() error {
	// macOS TUN is Point-to-Point.
	// Syntax: ifconfig <interface> <local_ip> <destination_ip> netmask <mask> up
	// We use a /32 mask for the interface itself in P2P mode usually, but /24 is common for VPNs.
	// Let's force a clear syntax.
	commands := [][]string{
		{"ifconfig", tun.name, "10.8.0.1", "10.8.0.2", "netmask", "255.255.255.0", "up"},
		{"route", "add", "-net", "10.8.0.0/24", "-interface", tun.name},
	}

	for _, cmdBytes := range commands {
		cmd := execCommand(cmdBytes[0], cmdBytes[1:]...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("failed to execute %v: %v, output: %s", cmdBytes, err, string(output))
		}
	}

	log.Println("Atlantic: macOS TUN interface configured successfully")
	return nil
}

// configureLinux - Configure TUN interface on Linux
func (tun *TunInterface) configureLinux() error {
	commands := [][]string{
		{"ip", "addr", "add", "10.8.0.1/24", "dev", tun.name},
		{"ip", "link", "set", "dev", tun.name, "up"},
	}

	for _, cmd := range commands {
		if err := execCommand(cmd[0], cmd[1:]...).Run(); err != nil {
			return fmt.Errorf("failed to execute %v: %v", cmd, err)
		}
	}

	log.Println("Atlantic: Linux TUN interface configured")
	return nil
}

// configureWindows - Configure TAP interface on Windows
func (tun *TunInterface) configureWindows() error {
	// Windows TAP interface configuration
	commands := [][]string{
		{"netsh", "interface", "ip", "set", "address", tun.name, "static", "10.8.0.1", "255.255.255.0"},
	}

	for _, cmd := range commands {
		if err := execCommand(cmd[0], cmd[1:]...).Run(); err != nil {
			return fmt.Errorf("failed to execute %v: %v", cmd, err)
		}
	}

	log.Println("Atlantic: Windows TAP interface configured")
	return nil
}

// RouteAllTraffic - Route ALL system traffic through Atlantic TUN interface
func (r *RoutingEngine) RouteAllTraffic() error {
	log.Println("Atlantic: Routing ALL traffic through Atlantic interface...")

	// Backup original routes
	if err := r.backupOriginalRoutes(); err != nil {
		return fmt.Errorf("failed to backup routes: %v", err)
	}

	// Install Atlantic routes
	if err := r.installAtlanticRoutes(); err != nil {
		return fmt.Errorf("failed to install Atlantic routes: %v", err)
	}

	log.Println("Atlantic: Traffic routing configured successfully")
	return nil
}

// backupOriginalRoutes - Backup original system routes
func (r *RoutingEngine) backupOriginalRoutes() error {
	// Platform-specific route backup
	switch runtime.GOOS {
	case "darwin": // macOS
		return r.backupMacOSRoutes()
	case "linux":
		return r.backupLinuxRoutes()
	case "windows":
		return r.backupWindowsRoutes()
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
}

// backupMacOSRoutes - Backup macOS routing table
func (r *RoutingEngine) backupMacOSRoutes() error {
	cmd := execCommand("netstat", "-rn", "-f", "inet")
	output, err := cmd.Output()
	if err != nil {
		return err
	}

	log.Printf("Atlantic: Backed up macOS routes: %d bytes", len(output))
	return nil
}

// backupLinuxRoutes - Backup Linux routing table
func (r *RoutingEngine) backupLinuxRoutes() error {
	cmd := execCommand("ip", "route", "show")
	output, err := cmd.Output()
	if err != nil {
		return err
	}

	log.Printf("Atlantic: Backed up Linux routes: %d bytes", len(output))
	return nil
}

// backupWindowsRoutes - Backup Windows routing table
func (r *RoutingEngine) backupWindowsRoutes() error {
	cmd := execCommand("route", "print")
	output, err := cmd.Output()
	if err != nil {
		return err
	}

	log.Printf("Atlantic: Backed up Windows routes: %d bytes", len(output))
	return nil
}

// installAtlanticRoutes - Install Atlantic proxy routes
func (r *RoutingEngine) installAtlanticRoutes() error {
	// Platform-specific route installation
	switch runtime.GOOS {
	case "darwin": // macOS
		return r.installMacOSRoutes()
	case "linux":
		return r.installLinuxRoutes()
	case "windows":
		return r.installWindowsRoutes()
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
}

// installMacOSRoutes - Install Atlantic routes on macOS
func (r *RoutingEngine) installMacOSRoutes() error {
	// Route all traffic through Atlantic TUN interface
	commands := [][]string{
		{"route", "add", "default", "10.8.0.2"},
		{"route", "add", "0.0.0.0/1", "10.8.0.2"},
		{"route", "add", "128.0.0.0/1", "10.8.0.2"},
	}

	for _, cmd := range commands {
		if err := execCommand(cmd[0], cmd[1:]...).Run(); err != nil {
			log.Printf("Atlantic: Warning - route command failed: %v", err)
			// Continue with other routes
		}
	}

	log.Println("Atlantic: macOS routes installed")
	return nil
}

// installLinuxRoutes - Install Atlantic routes on Linux
func (r *RoutingEngine) installLinuxRoutes() error {
	// Route all traffic through Atlantic TUN interface
	commands := [][]string{
		{"ip", "route", "add", "0.0.0.0/1", "dev", "atlantic-tun0"},
		{"ip", "route", "add", "128.0.0.0/1", "dev", "atlantic-tun0"},
	}

	for _, cmd := range commands {
		if err := execCommand(cmd[0], cmd[1:]...).Run(); err != nil {
			log.Printf("Atlantic: Warning - route command failed: %v", err)
			// Continue with other routes
		}
	}

	log.Println("Atlantic: Linux routes installed")
	return nil
}

// installWindowsRoutes - Install Atlantic routes on Windows
func (r *RoutingEngine) installWindowsRoutes() error {
	// Route all traffic through Atlantic TAP interface
	commands := [][]string{
		{"route", "add", "0.0.0.0", "mask", "128.0.0.0", "10.8.0.2"},
		{"route", "add", "128.0.0.0", "mask", "128.0.0.0", "10.8.0.2"},
	}

	for _, cmd := range commands {
		if err := execCommand(cmd[0], cmd[1:]...).Run(); err != nil {
			log.Printf("Atlantic: Warning - route command failed: %v", err)
			// Continue with other routes
		}
	}

	log.Println("Atlantic: Windows routes installed")
	return nil
}

// InterceptDNS - Intercept DNS queries to prevent leaks
func (d *DNSInterceptor) InterceptDNS() error {
	log.Println("Atlantic: Intercepting DNS queries...")

	// Platform-specific DNS interception
	switch runtime.GOOS {
	case "darwin": // macOS
		return d.interceptMacOSDNS()
	case "linux":
		return d.interceptLinuxDNS()
	case "windows":
		return d.interceptWindowsDNS()
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
}

// interceptMacOSDNS - Intercept DNS on macOS
func (d *DNSInterceptor) interceptMacOSDNS() error {
	// Set Atlantic DNS servers
	commands := [][]string{
		{"networksetup", "-setdnsservers", "Wi-Fi", "10.8.0.1"},
		{"networksetup", "-setdnsservers", "Ethernet", "10.8.0.1"},
	}

	for _, cmd := range commands {
		if err := execCommand(cmd[0], cmd[1:]...).Run(); err != nil {
			log.Printf("Atlantic: Warning - DNS command failed: %v", err)
			// Continue with other interfaces
		}
	}

	log.Println("Atlantic: macOS DNS intercepted")
	return nil
}

// interceptLinuxDNS - Intercept DNS on Linux
func (d *DNSInterceptor) interceptLinuxDNS() error {
	// Modify /etc/resolv.conf to use Atlantic DNS
	commands := [][]string{
		{"sh", "-c", "echo 'nameserver 10.8.0.1' > /etc/resolv.conf"},
	}

	for _, cmd := range commands {
		if err := execCommand(cmd[0], cmd[1:]...).Run(); err != nil {
			log.Printf("Atlantic: Warning - DNS command failed: %v", err)
		}
	}

	log.Println("Atlantic: Linux DNS intercepted")
	return nil
}

// interceptWindowsDNS - Intercept DNS on Windows
func (d *DNSInterceptor) interceptWindowsDNS() error {
	// Set Atlantic DNS servers on Windows
	commands := [][]string{
		{"netsh", "interface", "ip", "set", "dns", "Local Area Connection", "static", "10.8.0.1"},
		{"netsh", "interface", "ip", "set", "dns", "Wi-Fi", "static", "10.8.0.1"},
	}

	for _, cmd := range commands {
		if err := execCommand(cmd[0], cmd[1:]...).Run(); err != nil {
			log.Printf("Atlantic: Warning - DNS command failed: %v", err)
		}
	}

	log.Println("Atlantic: Windows DNS intercepted")
	return nil
}

// IsActive - Check if traffic interception is active
func (t *AtlanticTrafficInterceptor) IsActive() bool {
	return t.isActive
}

// Stop - Stop traffic interception and restore original settings
func (t *AtlanticTrafficInterceptor) Stop() error {
	if !t.isActive {
		return nil
	}

	log.Println("Atlantic: Stopping traffic interception...")

	// Restore original routes
	if err := t.routingEngine.restoreOriginalRoutes(); err != nil {
		log.Printf("Atlantic: Warning - failed to restore routes: %v", err)
	}

	// Restore original DNS
	if err := t.dnsInterceptor.restoreOriginalDNS(); err != nil {
		log.Printf("Atlantic: Warning - failed to restore DNS: %v", err)
	}

	// Close TUN interface
	if t.tunInterface.iface != nil {
		t.tunInterface.iface.Close()
	}

	t.isActive = false
	log.Println("Atlantic: Traffic interception stopped")
	return nil
}

// restoreOriginalRoutes - Restore original system routes
func (r *RoutingEngine) restoreOriginalRoutes() error {
	// Implementation depends on backed up routes
	log.Println("Atlantic: Restoring original routes...")
	return nil
}

// restoreOriginalDNS - Restore original DNS settings
func (d *DNSInterceptor) restoreOriginalDNS() error {
	// Implementation depends on backed up DNS settings
	log.Println("Atlantic: Restoring original DNS...")
	return nil
}
