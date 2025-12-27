# AtlanticProxy Web Dashboard

Modern, responsive web dashboard for AtlanticProxy - VPN-Grade Proxy Protection.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
atlantic-dashboard/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Overview page
│   │   ├── statistics/page.tsx   # Statistics & data usage
│   │   ├── servers/page.tsx      # Server selection
│   │   ├── security/page.tsx     # Security settings
│   │   ├── adblock/page.tsx      # Ad-blocking controls
│   │   ├── settings/page.tsx     # General settings
│   │   ├── activity/page.tsx     # Activity logs
│   │   └── layout.tsx            # Dashboard layout
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── StatusCard.tsx        # Reusable status card
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── api.ts                    # API client
│   └── utils.ts                  # Utility functions
└── public/                       # Static assets
```

## 🎨 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Phosphor Icons
- **Charts:** Recharts
- **State Management:** Zustand

## 📊 Features

### Dashboard Pages

1. **Overview** - Real-time connection status and performance metrics
2. **Statistics** - Data usage charts and analytics
3. **Servers** - Server selection with latency and load information
4. **Security** - Kill switch, leak detection, and security logs
5. **Ad-Blocking** - Ad-blocking statistics and category controls
6. **Settings** - General preferences and notifications
7. **Activity** - System logs and activity history

### Key Features

- ✅ Real-time status updates (5-second polling)
- ✅ Interactive performance charts
- ✅ Server selection with favorites
- ✅ Security monitoring dashboard
- ✅ Dark mode theme
- ✅ Responsive design (mobile-friendly)
- ✅ Export functionality for data and logs

## 🔌 API Integration

The dashboard connects to the AtlanticProxy backend API at `http://localhost:8082`.

### API Endpoints Used

- `GET /health` - Get current proxy status
- `GET /api/statistics` - Get usage statistics
- `POST /api/killswitch/toggle` - Toggle kill switch

## 🎨 Design System

### Colors

- **Primary:** Blue (#3b82f6)
- **Success:** Green (#10b981)
- **Warning:** Yellow (#eab308)
- **Error:** Red (#ef4444)
- **Background:** Black (#000000)
- **Surface:** Neutral-900 (#171717)
- **Border:** Neutral-800 (#262626)

### Typography

- **Font:** System font stack (optimized for each platform)
- **Headings:** Bold, white
- **Body:** Regular, neutral-400
- **Labels:** Medium, neutral-400

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Adding New Pages

1. Create a new page in `app/dashboard/[page-name]/page.tsx`
2. Add the route to `components/dashboard/Sidebar.tsx`
3. Import required components from `@/components/ui`

### Adding New Components

```bash
# Add shadcn/ui components
npx shadcn@latest add [component-name]
```

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1280px+)
- Tablet (768px+)
- Mobile (320px+)

## 🔒 Security

- No sensitive data stored in localStorage
- API calls use secure HTTP (upgrade to HTTPS in production)
- CSRF protection via Next.js
- XSS protection via React

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8082
```

## 📝 License

Part of the AtlanticProxy project.

## 🤝 Contributing

This dashboard is part of the AtlanticProxy Phase 6 implementation.

---

**Built with ❤️ using Next.js and shadcn/ui**
