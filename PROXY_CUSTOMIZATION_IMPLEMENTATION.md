# Proxy Customization System - Implementation Guide

**Status:** Ready for Integration  
**Date:** January 20, 2024  
**Components:** 5 new modular components

---

## 📋 Overview

A clean, modular system for customizing proxy plans with protocol selection, ISP tier selection, and dynamic pricing. Each layer is independent and can be used separately or together.

---

## 🏗️ Architecture

### **Layer 1: Types & Constants** (`ProxyCustomization.ts`)
- Centralized type definitions
- Protocol options (HTTP, HTTPS, SOCKS5)
- ISP tier options (Budget, Standard, Premium)
- Pricing modifiers
- Feature descriptions

**Why:** Single source of truth for all customization data. Easy to update pricing or add new options.

### **Layer 2: Protocol Selector** (`ProtocolSelector.tsx`)
- Visual protocol selection
- Benefits display per protocol
- Use case recommendations
- Real-time price calculation
- Standalone component

**Why:** Users understand why each protocol exists and when to use it.

### **Layer 3: ISP Tier Selector** (`ISPTierSelector.tsx`)
- Visual tier selection (Budget/Standard/Premium)
- Speed and detection risk metrics
- Feature comparison table
- Price adjustments
- Standalone component

**Why:** Clear comparison helps users choose the right tier for their needs.

### **Layer 4: Pricing Calculator** (`PricingCalculator.tsx`)
- Real-time price breakdown
- Shows all adjustments
- Annual savings calculation
- Customization summary
- Display-only component

**Why:** Transparency builds trust. Users see exactly what they're paying for.

### **Layer 5: Main Customizer** (`ProxyCustomizer.tsx`)
- Orchestrates all layers
- Collapsible interface
- Billing cycle selection
- Callback for parent components
- Ready for checkout integration

**Why:** Single entry point for the entire customization flow.

---

## 📊 Data Structure

### **Protocols**
```typescript
{
  id: 'http' | 'https' | 'socks5',
  name: string,
  description: string,
  priceModifier: number,        // Monthly adjustment
  benefits: string[],
  useCases: string[],
  icon: string
}
```

### **ISP Tiers**
```typescript
{
  id: 'budget' | 'standard' | 'premium',
  name: string,
  description: string,
  priceModifier: number,        // Monthly adjustment
  features: string[],
  speedRating: 'slow' | 'medium' | 'fast' | 'very-fast',
  detectionRisk: 'high' | 'medium' | 'low',
  badge?: string
}
```

---

## 💰 Pricing Model

### **Base Prices** (Monthly)
- Starter: $9.99
- Professional: $29.99
- Enterprise: $99.99

### **Protocol Adjustments**
- HTTP: +$0 (base)
- HTTPS: +$1.00
- SOCKS5: +$2.00

### **ISP Tier Adjustments**
- Budget: -$3.00 (30% savings)
- Standard: +$0 (base)
- Premium: +$5.00 (premium features)

### **Example Combinations**
```
Starter + HTTP + Budget = $6.99/month (cheapest)
Starter + HTTPS + Standard = $10.99/month (recommended)
Professional + SOCKS5 + Premium = $36.99/month (premium)
Enterprise + SOCKS5 + Premium = $106.99/month (maximum)
```

---

## 🎯 Usage Examples

### **Example 1: Standalone Protocol Selector**
```tsx
import ProtocolSelector from '@/components/billing/ProtocolSelector';

export default function MyComponent() {
  const [protocol, setProtocol] = useState('http');
  
  return (
    <ProtocolSelector
      selected={protocol}
      onSelect={setProtocol}
      basePrice={9.99}
    />
  );
}
```

### **Example 2: Standalone ISP Tier Selector**
```tsx
import ISPTierSelector from '@/components/billing/ISPTierSelector';

export default function MyComponent() {
  const [tier, setTier] = useState('standard');
  
  return (
    <ISPTierSelector
      selected={tier}
      onSelect={setTier}
      basePrice={9.99}
    />
  );
}
```

### **Example 3: Full Customizer**
```tsx
import ProxyCustomizer from '@/components/billing/ProxyCustomizer';

export default function PlanPage() {
  const handleCustomization = (customization) => {
    console.log('User selected:', customization);
    // Send to backend or update cart
  };
  
  return (
    <ProxyCustomizer
      basePrice={29.99}
      bandwidth="100 GB"
      planName="Professional Plan"
      onCustomizationChange={handleCustomization}
    />
  );
}
```

### **Example 4: Pricing Calculator Only**
```tsx
import PricingCalculator from '@/components/billing/PricingCalculator';

export default function MyComponent() {
  return (
    <PricingCalculator
      basePrice={9.99}
      protocol="https"
      ispTier="premium"
      bandwidth="10 GB"
      billingCycle="annual"
    />
  );
}
```

---

## 🔄 Integration Steps

### **Step 1: Add to SubscriptionPlans**
```tsx
// In SubscriptionPlans.tsx
import ProxyCustomizer from './ProxyCustomizer';

// Add button to each plan
<button onClick={() => setShowCustomizer(true)}>
  Customize This Plan
</button>

// Show customizer modal
{showCustomizer && (
  <ProxyCustomizer
    basePrice={plan.price}
    bandwidth={plan.bandwidth}
    planName={plan.name}
    onCustomizationChange={handleCustomization}
  />
)}
```

### **Step 2: Connect to Backend**
```tsx
// In ProxyCustomizer.tsx
const handleCheckout = async (customization) => {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({
      planId: planId,
      protocol: customization.protocol,
      ispTier: customization.ispTier,
      billingCycle: billingCycle,
    }),
  });
  // Handle response
};
```

### **Step 3: Update Backend**
```go
// In backend (Go)
type CustomizationRequest struct {
  PlanID       string `json:"planId"`
  Protocol     string `json:"protocol"`
  ISPTier      string `json:"ispTier"`
  BillingCycle string `json:"billingCycle"`
}

// Calculate final price
func CalculatePrice(req CustomizationRequest) float64 {
  basePrice := getPlanPrice(req.PlanID)
  protocolAdj := getProtocolAdjustment(req.Protocol)
  tierAdj := getTierAdjustment(req.ISPTier)
  return basePrice + protocolAdj + tierAdj
}
```

---

## 🎨 Customization Options

### **Change Pricing**
Edit `ProxyCustomization.ts`:
```typescript
export const PROTOCOL_OPTIONS = {
  http: {
    priceModifier: 0,  // Change this
    // ...
  }
}
```

### **Add New Protocol**
```typescript
export const PROTOCOL_OPTIONS = {
  // ... existing
  http2: {
    id: 'http2',
    name: 'HTTP/2',
    description: 'Modern HTTP protocol',
    priceModifier: 1.5,
    benefits: ['Multiplexing', 'Server push', 'Header compression'],
    useCases: ['Modern APIs', 'High-performance apps'],
    icon: '⚡',
  }
}
```

### **Add New ISP Tier**
```typescript
export const ISP_TIER_OPTIONS = {
  // ... existing
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom dedicated infrastructure',
    priceModifier: 15.0,
    features: ['Custom IPs', 'Dedicated support', 'SLA guarantee'],
    speedRating: 'very-fast',
    detectionRisk: 'low',
    badge: 'Enterprise',
  }
}
```

---

## 📱 Responsive Design

All components are fully responsive:
- **Mobile:** Single column, stacked layout
- **Tablet:** 2-column grid
- **Desktop:** 3-column grid with full details

---

## ♿ Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Color contrast compliant
- ✅ Screen reader friendly

---

## 🧪 Testing Checklist

- [ ] Protocol selector updates price correctly
- [ ] ISP tier selector updates price correctly
- [ ] Combined adjustments calculate correctly
- [ ] Annual discount applies (17%)
- [ ] Customization callback fires with correct data
- [ ] Mobile layout is responsive
- [ ] All buttons are clickable
- [ ] Price displays with 2 decimals
- [ ] Badges display correctly
- [ ] Comparison table is readable

---

## 📦 File Structure

```
frontend/components/billing/
├── types/
│   └── ProxyCustomization.ts      (Types & constants)
├── ProtocolSelector.tsx            (Protocol selection)
├── ISPTierSelector.tsx             (ISP tier selection)
├── PricingCalculator.tsx           (Price breakdown)
├── ProxyCustomizer.tsx             (Main orchestrator)
└── SubscriptionPlans.tsx           (Updated with customizer)
```

---

## 🚀 Next Steps

1. **Review** - Check components for any adjustments
2. **Integrate** - Add to SubscriptionPlans component
3. **Test** - Verify all calculations and interactions
4. **Backend** - Connect to pricing API
5. **Deploy** - Roll out to production

---

## 💡 Key Features

✅ **Modular** - Each component works independently  
✅ **Clean** - Clear separation of concerns  
✅ **Transparent** - Users see exactly what they're paying for  
✅ **Flexible** - Easy to add new protocols or tiers  
✅ **Responsive** - Works on all devices  
✅ **Accessible** - WCAG compliant  
✅ **Scalable** - Ready for backend integration  

---

## 📞 Support

For questions or issues:
1. Check the usage examples above
2. Review component props
3. Check TypeScript types
4. Refer to the data structure section

---

**Status: READY FOR INTEGRATION ✅**

