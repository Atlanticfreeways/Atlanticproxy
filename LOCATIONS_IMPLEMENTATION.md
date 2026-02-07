# Locations Tab - Implementation Tasks

**Time:** 2-3 hours | **Priority:** HIGH

---

## Backend Tasks (30 min)

### Task 1: Add Locations Endpoint
**File:** `scripts/proxy-client/internal/api/server.go`

```go
// Add to setupRoutes()
router.GET("/api/locations/available", s.handleGetLocations)
```

### Task 2: Create Locations Handler
**File:** `scripts/proxy-client/internal/api/rotation.go`

```go
type LocationData struct {
    CountryCode string   `json:"country_code"`
    CountryName string   `json:"country_name"`
    Cities      []string `json:"cities,omitempty"`
    Available   bool     `json:"available"`
}

func (s *Server) handleGetLocations(c *gin.Context) {
    locations := []LocationData{
        {"US", "United States", []string{"New York", "Los Angeles", "Chicago"}, true},
        {"GB", "United Kingdom", []string{"London", "Manchester"}, true},
        {"DE", "Germany", []string{"Berlin", "Munich"}, true},
        {"FR", "France", []string{"Paris", "Lyon"}, true},
        {"CA", "Canada", []string{"Toronto", "Vancouver"}, true},
        {"AU", "Australia", []string{"Sydney", "Melbourne"}, true},
        {"JP", "Japan", []string{"Tokyo", "Osaka"}, true},
        {"SG", "Singapore", []string{}, true},
        {"NL", "Netherlands", []string{"Amsterdam"}, true},
        {"BR", "Brazil", []string{"São Paulo", "Rio de Janeiro"}, true},
    }
    c.JSON(http.StatusOK, gin.H{"locations": locations, "total": len(locations)})
}
```

---

## Frontend Tasks (90 min)

### Task 3: Update Sidebar
**File:** `atlantic-dashboard/components/dashboard/Sidebar.tsx`

```typescript
// Add after 'Overview' in navItems array:
{ label: 'Locations', href: '/dashboard/locations' },
```

### Task 4: Add API Types & Methods
**File:** `atlantic-dashboard/lib/api.ts`

```typescript
// Add interface after other interfaces
export interface Location {
    country_code: string;
    country_name: string;
    cities: string[];
    available: boolean;
}

// Add method in ApiClient class
async getLocations(): Promise<Location[]> {
    const response = await this.request('/api/locations/available');
    if (!response.ok) throw new Error('Failed to fetch locations');
    const data = await response.json();
    return data.locations;
}
```

### Task 5: Create Locations Page
**File:** `atlantic-dashboard/app/dashboard/locations/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient, Location } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LocationsPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        loadLocations();
        const saved = localStorage.getItem('favorite_locations');
        if (saved) setFavorites(JSON.parse(saved));
    }, []);

    const loadLocations = async () => {
        try {
            const data = await apiClient.getLocations();
            setLocations(data);
        } catch (error) {
            console.error('Failed to load locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (countryCode: string) => {
        try {
            await apiClient.setRotationConfig({
                mode: 'sticky-10min',
                country: countryCode.toLowerCase(),
            });
        } catch (error) {
            console.error('Failed to connect:', error);
        }
    };

    const toggleFavorite = (code: string) => {
        const updated = favorites.includes(code)
            ? favorites.filter(f => f !== code)
            : [...favorites, code];
        setFavorites(updated);
        localStorage.setItem('favorite_locations', JSON.stringify(updated));
    };

    const filtered = locations.filter(loc =>
        loc.country_name.toLowerCase().includes(search.toLowerCase()) ||
        loc.country_code.toLowerCase().includes(search.toLowerCase())
    );

    const favoriteLocations = locations.filter(loc => favorites.includes(loc.country_code));

    if (loading) {
        return <div className="flex items-center justify-center h-96">
            <div className="animate-pulse text-neutral-400">Loading locations...</div>
        </div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Locations</h1>
                <p className="text-neutral-400 mt-1">Select your proxy location</p>
            </div>

            <Input
                placeholder="Search countries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md bg-neutral-800 border-neutral-700 text-white"
            />

            {favoriteLocations.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-white mb-3">⭐ Quick Connect</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {favoriteLocations.slice(0, 3).map(loc => (
                            <Card key={loc.country_code} className="bg-neutral-800 border-neutral-700 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl mb-1">{getFlag(loc.country_code)}</div>
                                        <div className="text-white font-medium">{loc.country_name}</div>
                                    </div>
                                    <Button
                                        onClick={() => handleConnect(loc.country_code)}
                                        size="sm"
                                        className="bg-sky-500 hover:bg-sky-600"
                                    >
                                        Connect
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-lg font-semibold text-white mb-3">
                    📍 All Locations ({filtered.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(loc => (
                        <Card key={loc.country_code} className="bg-neutral-800 border-neutral-700 p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{getFlag(loc.country_code)}</div>
                                    <div>
                                        <div className="text-white font-medium">{loc.country_name}</div>
                                        {loc.cities.length > 0 && (
                                            <div className="text-xs text-neutral-400">
                                                {loc.cities.length} cities
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleFavorite(loc.country_code)}
                                    className="text-xl"
                                >
                                    {favorites.includes(loc.country_code) ? '⭐' : '☆'}
                                </button>
                            </div>
                            <Button
                                onClick={() => handleConnect(loc.country_code)}
                                className="w-full bg-sky-500 hover:bg-sky-600"
                                size="sm"
                            >
                                Connect
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

function getFlag(code: string): string {
    const flags: Record<string, string> = {
        US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', CA: '🇨🇦',
        AU: '🇦🇺', JP: '🇯🇵', SG: '🇸🇬', NL: '🇳🇱', BR: '🇧🇷',
    };
    return flags[code] || '🌍';
}
```

---

## Testing (15 min)

### Backend Test
```bash
cd scripts/proxy-client
go run ./cmd/service &
curl http://localhost:8082/api/locations/available
```

### Frontend Test
```bash
cd atlantic-dashboard
npm run dev
# Visit: http://localhost:3000/dashboard/locations
# Test: Search, Connect, Favorites
```

---

---

## 🔗 Related: Backend-Frontend Gap Analysis

See `BACKEND_FRONTEND_GAP_ANALYSIS.md` for complete assessment of all missing frontend features.

**Other High-Priority Missing Pages:**
1. Security Tab (anonymity verification, leak detection)
2. IP Rotation Tab (rotation mode control)
3. Ad-Blocking Tab (whitelist, categories, custom rules)

---

## Acceptance Criteria

### Functional Requirementsnctional Requirements
- [ ] **Navigation:** "Locations" tab visible in sidebar between "Overview" and "Statistics"
- [ ] **Data Loading:** Page loads 10+ countries within 500ms
- [ ] **Search:** Real-time filtering by country name or code (case-insensitive)
- [ ] **Quick Connect:** Shows up to 3 favorite locations with one-click connect
- [ ] **Location Grid:** Displays all locations with flag, name, city count, and connect button
- [ ] **Favorites:** Star icon toggles favorite status, persists in localStorage
- [ ] **Connection:** Clicking "Connect" updates proxy rotation config to selected country
- [ ] **Visual Feedback:** Current location highlighted or indicated in list
- [ ] **Error Handling:** Graceful error messages if API fails
- [ ] **Loading State:** Shows loading indicator while fetching data

### Technical Requirements
- [ ] **Backend:** GET `/api/locations/available` returns JSON with locations array
- [ ] **API Response:** Includes country_code, country_name, cities[], available fields
- [ ] **Frontend:** TypeScript interfaces match backend response
- [ ] **State Management:** Uses React hooks (useState, useEffect)
- [ ] **Persistence:** Favorites stored in localStorage as JSON array
- [ ] **Integration:** Connects to existing rotation API (`setRotationConfig`)

### UI/UX Requirements
- [ ] **Responsive:** 3 columns desktop, 2 tablet, 1 mobile
- [ ] **Dark Theme:** Matches existing dashboard (neutral-900/800 colors)
- [ ] **Typography:** Clear hierarchy (3xl title, lg section headers)
- [ ] **Spacing:** Consistent 6-unit spacing between sections
- [ ] **Accessibility:** Keyboard navigation, semantic HTML
- [ ] **Performance:** No layout shift, smooth animations

### Testing Requirements
- [ ] **Backend Test:** curl returns valid JSON with 10 locations
- [ ] **Search Test:** Typing "united" shows US and UK only
- [ ] **Connect Test:** Clicking connect updates rotation config
- [ ] **Favorites Test:** Star persists after page reload
- [ ] **Mobile Test:** Layout works on 375px width
- [ ] **Error Test:** Handles network failure gracefully

---

## What You'll Have When Fully Implemented

### 🎯 User Experience

**1. New Navigation Item**
```
Sidebar:
├── Overview
├── 🌍 Locations  ← NEW
├── Statistics
└── ...
```

**2. Locations Page Layout**
```
┌─────────────────────────────────────────────┐
│ Locations                                   │
│ Select your proxy location                  │
│                                             │
│ [🔍 Search countries...]                    │
│                                             │
│ ⭐ Quick Connect                            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ 🇺🇸 US    │ │ 🇬🇧 UK    │ │ 🇩🇪 DE    │    │
│ │ [Connect]│ │ [Connect]│ │ [Connect]│    │
│ └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│ 📍 All Locations (10)                       │
│ ┌─────────────────┐ ┌─────────────────┐   │
│ │ 🇺🇸 United States│ │ 🇬🇧 United Kingdom│   │
│ │ 3 cities      ☆ │ │ 2 cities      ⭐ │   │
│ │ [Connect]       │ │ [Connect]       │   │
│ └─────────────────┘ └─────────────────┘   │
│ ┌─────────────────┐ ┌─────────────────┐   │
│ │ 🇩🇪 Germany      │ │ 🇫🇷 France       │   │
│ │ 2 cities      ☆ │ │ 2 cities      ☆ │   │
│ │ [Connect]       │ │ [Connect]       │   │
│ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────┘
```

### 🔧 Technical Capabilities

**Backend API:**
- `GET /api/locations/available` - Returns 10 countries with cities
- Response includes: US, UK, Germany, France, Canada, Australia, Japan, Singapore, Netherlands, Brazil
- Each location has: country code, full name, city list, availability status

**Frontend Features:**
- **Search Bar:** Instant filter as you type ("united" → shows US & UK)
- **Quick Connect Section:** Shows your 3 most recent favorites
- **Location Cards:** Grid of all available countries
- **Favorite System:** Click star to save, persists across sessions
- **One-Click Connect:** Select country → proxy routes through that location
- **Visual Indicators:** Flag emojis, city counts, availability status

**Data Flow:**
```
User clicks "Connect" on United States
  ↓
Frontend calls: setRotationConfig({ mode: 'sticky-10min', country: 'us' })
  ↓
Backend updates rotation manager
  ↓
Next proxy request routes through US residential IPs
  ↓
Overview page shows: "Connected: United States 🇺🇸"
```

### 📊 Available Locations (Initial)

1. 🇺🇸 **United States** - New York, Los Angeles, Chicago
2. 🇬🇧 **United Kingdom** - London, Manchester
3. 🇩🇪 **Germany** - Berlin, Munich
4. 🇫🇷 **France** - Paris, Lyon
5. 🇨🇦 **Canada** - Toronto, Vancouver
6. 🇦🇺 **Australia** - Sydney, Melbourne
7. 🇯🇵 **Japan** - Tokyo, Osaka
8. 🇸🇬 **Singapore** - All cities
9. 🇳🇱 **Netherlands** - Amsterdam
10. 🇧🇷 **Brazil** - São Paulo, Rio de Janeiro

### 🎨 User Interactions

**Scenario 1: Quick Connect**
1. User opens Locations tab
2. Sees 3 favorite countries at top
3. Clicks "Connect" on US
4. Proxy immediately routes through US
5. Overview page updates location

**Scenario 2: Search & Connect**
1. User types "japan" in search
2. Grid filters to show only Japan
3. Clicks star to favorite
4. Clicks "Connect"
5. Japan appears in Quick Connect section

**Scenario 3: Browse All**
1. User scrolls through all 10 countries
2. Sees city counts for each
3. Stars 3 favorites
4. Favorites persist after logout/login

### 🚀 Future Enhancements (Not in V1)

- City-level selection (expand card to choose specific city)
- Real-time latency indicators (ping times)
- Server load percentages (0-100%)
- ISP selection per location
- Map view with clickable countries
- Recent locations history
- Auto-connect to fastest location
- Location recommendations based on usage

### 📈 Impact on Existing Features

**Overview Page:**
- ConnectionCard now shows location selected from Locations tab
- "Change Location" button redirects to Locations page

**IP Rotation Page:**
- Geo-targeting settings sync with Locations selection
- Country/city fields auto-populate from last selection

**Analytics:**
- Track most-used locations
- Show connection history by country

---

## Success Metrics

- ✅ Users can find and connect to any of 10 countries in <10 seconds
- ✅ Search returns results in <100ms
- ✅ Favorites persist across browser sessions
- ✅ Zero console errors or warnings
- ✅ Mobile layout works on iPhone SE (375px)
- ✅ Page loads in <500ms on 3G connection

---

## Checklist

- [ ] Backend endpoint returns locations
- [ ] Sidebar shows "Locations" tab
- [ ] Page displays location cards
- [ ] Search filters locations
- [ ] Connect button updates rotation config
- [ ] Favorites persist in localStorage
- [ ] Mobile responsive
- [ ] All acceptance criteria metdpoint returns locations
- [ ] Sidebar shows "Locations" tab
- [ ] Page displays location cards
- [ ] Search filters locations
- [ ] Connect button updates rotation config
- [ ] Favorites persist in localStorage
- [ ] Mobile responsive

---

## Files Summary

**Create:** 1 file
- `atlantic-dashboard/app/dashboard/locations/page.tsx`

**Modify:** 3 files
- `scripts/proxy-client/internal/api/server.go`
- `scripts/proxy-client/internal/api/rotation.go`
- `atlantic-dashboard/components/dashboard/Sidebar.tsx`
- `atlantic-dashboard/lib/api.ts`

**Total:** 4 files modified/created
