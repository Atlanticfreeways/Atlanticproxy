package brightdata

import (
	"testing"
)

func TestNewClient(t *testing.T) {
	client := NewClient("test-user", "test-pass")
	if client.Username != "test-user" {
		t.Errorf("Expected username test-user, got %s", client.Username)
	}
}

func TestGetProxyURL(t *testing.T) {
	client := NewClient("test-user", "test-pass")
	expected := "http://test-user:test-pass@brd.superproxy.io:22225"
	if client.GetProxyURL() != expected {
		t.Errorf("Expected %s, got %s", expected, client.GetProxyURL())
	}
}

func TestGetProxyURLWithSession(t *testing.T) {
	client := NewClient("test-user", "test-pass")
	expected := "http://test-user-session-abc123:test-pass@brd.superproxy.io:22225"
	if client.GetProxyURLWithSession("abc123") != expected {
		t.Errorf("Expected %s, got %s", expected, client.GetProxyURLWithSession("abc123"))
	}
}

func TestGetProxyURLWithCountry(t *testing.T) {
	client := NewClient("test-user", "test-pass")
	expected := "http://test-user-country-us:test-pass@brd.superproxy.io:22225"
	if client.GetProxyURLWithCountry("us") != expected {
		t.Errorf("Expected %s, got %s", expected, client.GetProxyURLWithCountry("us"))
	}
}
