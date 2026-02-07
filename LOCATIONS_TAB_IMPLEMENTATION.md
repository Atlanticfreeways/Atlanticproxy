# Locations Tab Implementation

**Priority:** HIGH  
**Estimated Time:** 2-3 hours  
**Status:** Not Started

---

## 🎯 Objective

Add a dedicated "Locations" tab to the dashboard for users to search, filter, and select proxy locations (countries/cities).

---

## 📋 Tasks Checklist

### Backend (Go) - 30 mins

- [ ] **1.1** Add locations endpoint in `scripts/proxy-client/internal/api/server.go`
  ```go
  router.GET("/api/locations/available", s.handleGetLocations)
  ```

- [ ] **1.2** Create handler in `scripts/proxy-client/internal/api/rotation.go`
  ```go
  func (s *Server) handleGetLocations(c *gin.Context) {
      // Return hardcoded list of 195 countries + major cities
      // Include: country_code, country_name, cities[], latency (mock)
  }
  ```

- [ ] **1.3** Add location data structure
  ```go
  type Location struct {
      CountryCode string   `json:"country_code"`
      CountryName string   `json:"country_name"`
      Cities      []string `json:"cities"`
      Available   bool     `json:"available"`
  }
  ```

### Frontend (Next.js) - 90 mins

- [ ] **2.1** Update sidebar navigation  
  **File:** `atlantic-dashboard/components/dashboard/Sidebar.tsx`
  ```typescript
  // Add after 'Overview':
  { label: 'Locations', href: '/dashboard/locations' }
  ```

- [ ] **2.2** Create locations page  
  **File:** `atlantic-dashboard/app/dashboard/locations/page.tsx`
  - Search input
  - Quick connect cards (3 favorites)
  - Location grid with country cards
  - Connect button per location

- [ ] **2.3** Create LocationCard component  
  **File:** `atlantic-dashboard/components/dashboard/LocationCard.tsx`
  - Country flag emoji
  - Country name
  - Cities list (collapsible)
  - Connect button
  - Favorite star icon

- [ ] **2.4** Update API client  
  **File:** `atlantic-dashboard/lib/api.ts`
  ```typescript
  async getLocations(): Promise<Location[]> {
      const response = await this.request('/api/locations/available');
      return response.json();
  }
  ```

- [ ] **2.5** Add TypeScript interfaces  
  **File:** `atlantic-dashboard/lib/api.ts`
  ```typescript
  export interface Location {
      country_code: string;
      country_name: string;
      cities: string[];
      available: boolean;
      latency?: number;
  }
  ```

### Integration - 30 mins

- [ ] **3.1** Connect location selection to rotation API
  - When user clicks "Connect" → call `setRotationConfig({ country: code })`
  - Update current location in ConnectionCard

- [ ] **3.2** Add favorites to localStorage
  ```typescript
  // Save: localStorage.setItem('favorite_locations', JSON.stringify([]))
  // Load: JSON.parse(localStorage.getItem('favorite_locations') || '[]')
  ```

- [ ] **3.3** Test flow:
  1. Navigate to Locations tab
  2. Search for country
  3. Click Connect
  4. Verify rotation config updates
  5. Check Overview shows new location

---

## 📁 Files to Create/Modify

### Create (3 files)
```
atlantic-dashboard/
├── app/dashboard/locations/page.tsx              [NEW]
└── components/dashboard/
    ├── LocationCard.tsx                          [NEW]
    └── LocationSearch.tsx                        [NEW]
```

### Modify (3 files)
```
atlantic-dashboard/
├── components/dashboard/Sidebar.tsx              [MODIFY - Add nav item]
└── lib/api.ts                                    [MODIFY - Add methods]

scripts/proxy-client/internal/api/
├── server.go                                     [MODIFY - Add route]
└── rotation.go                                   [MODIFY - Add handler]
```

---

## 🎨 UI Specifications

### Search Bar
- Placeholder: "Search countries or cities..."
- Debounced input (300ms)
- Clear button (X icon)

### Quick Connect Section
- Title: "⭐ Quick Connect"
- 3 cards: US, UK, Germany (default)
- Show: Flag, Country, Latency
- One-click connect

### Location Grid
- Title: "📍 All Locations (195 countries)"
- Cards: 3 columns on desktop, 1 on mobile
- Each card: Flag emoji, Name, Cities count, Connect button, Star icon
- Expandable cities list (click to show/hide)

### Colors (Tailwind)
- Background: `bg-neutral-900`
- Cards: `bg-neutral-800`
- Borders: `border-neutral-700`
- Text: `text-white`, `text-neutral-400`
- Accent: `text-sky-500`, `bg-sky-500`

---

## 📊 Data Source

### Initial Implementation (Hardcoded)
Use top 50 countries with major cities:

```typescript
const LOCATIONS = [
  { country_code: 'US', country_name: 'United States', 
    cities: ['New York', 'Los Angeles', 'Chicago'], available: true },
  { country_code: 'GB', country_name: 'United Kingdom', 
    cities: ['London', 'Manchester'], available: true },
  { country_code: 'DE', country_name: 'Germany', 
    cities: ['Berlin', 'Munich'], available: true },
  // ... 47 more
];
```

### Future Enhancement
- Fetch from BrightData/Oxylabs API
- Real-time availability
- Actual latency measurements

---

## 🔌 API Integration

### Endpoint
```
GET /api/locations/available
```

### Response
```json
{
  "locations": [
    {
      "country_code": "US",
      "country_name": "United States",
      "cities": ["New York", "Los Angeles", "Chicago"],
      "available": true,
      "latency": 15
    }
  ],
  "total": 195
}
```

### Connect Flow
```
User clicks "Connect" on US
  ↓
POST /api/rotation/config
  { "mode": "sticky-10min", "country": "us" }
  ↓
Backend updates rotation manager
  ↓
Frontend polls /status
  ↓
ConnectionCard shows "United States"
```

---

## ✅ Acceptance Criteria

- [ ] Locations tab visible in sidebar
- [ ] Page loads with 195 countries
- [ ] Search filters locations in real-time
- [ ] Quick Connect shows 3 favorites
- [ ] Click "Connect" updates proxy location
- [ ] Current location highlighted in list
- [ ] Favorites persist in localStorage
- [ ] Mobile responsive (1 column)
- [ ] No console errors
- [ ] Loads in <500ms

---

## 🚀 Implementation Order

1. **Backend first** (30 mins)
   - Add endpoint + handler
   - Test with curl/Postman

2. **Frontend structure** (45 mins)
   - Create page + components
   - Add to sidebar
   - Static UI only

3. **API integration** (30 mins)
   - Connect to backend
   - Implement search/filter
   - Add connect functionality

4. **Polish** (15 mins)
   - Add favorites
   - Mobile responsive
   - Loading states

---

## 🧪 Testing

### Manual Tests
```bash
# 1. Backend
curl http://localhost:8082/api/locations/available

# 2. Frontend
npm run dev
# Navigate to http://localhost:3000/dashboard/locations
# Search "united"
# Click "Connect" on US
# Verify /status shows US location
```

### Edge Cases
- Empty search results
- No internet connection
- API timeout
- Invalid country code

---

## 📝 Notes

- Use country flag emojis (🇺🇸, 🇬🇧, etc.) - no external assets needed
- Keep location list in memory (no database needed yet)
- Latency values are mocked initially (15-80ms random)
- Cities are optional - show "All cities" if none specified

---

## 🔗 Related Files

- Architecture: `/About the Proj/ARCHITECTURE_OVERVIEW.md`
- API Reference: `/docs/API_REFERENCE.md`
- Rotation Guide: `/docs/ROTATION_GUIDE.md`
- Roadmap: `/ROADMAP.md`

---

**Created:** January 30, 2026  
**Assignee:** Developer  
**Milestone:** V1.0 Production Launch
