# Atlantic Weizard Design Guidelines

## Design Approach

**Hybrid Strategy:**
- **Frontend (Guest Shopping)**: Reference-based approach inspired by modern e-commerce leaders (Shopify, Stripe Checkout, premium DTC brands) - prioritizing trust, clarity, and conversion
- **Admin Panel**: Material Design system principles for productivity and data management efficiency

**Design Principles:**
1. **Trust & Credibility**: Clean, professional aesthetic that instills confidence during checkout
2. **Product Focus**: Visual hierarchy that showcases products effectively
3. **Conversion Optimization**: Minimal friction in the shopping and checkout flow
4. **Clarity**: Clear information architecture for multi-currency and payment states

---

## Typography

**Font Stack (Google Fonts):**
- **Primary (Headings)**: Inter (weights: 600, 700)
- **Secondary (Body)**: Inter (weights: 400, 500)
- **Accent (Numbers/Prices)**: Tabular numerals enabled

**Hierarchy:**
- **H1 (Hero/Page Titles)**: text-4xl md:text-5xl, font-bold
- **H2 (Section Headers)**: text-2xl md:text-3xl, font-semibold
- **H3 (Card Titles)**: text-xl, font-semibold
- **Body**: text-base, font-normal
- **Price Display**: text-2xl md:text-3xl, font-bold, tabular-nums
- **Small/Meta**: text-sm, font-medium

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16, 20**
- Common patterns: `p-4`, `gap-6`, `space-y-8`, `my-12`, `py-16`, `px-20`

**Container Strategy:**
- **Max Width**: max-w-7xl for main content
- **Padding**: px-4 md:px-6 lg:px-8
- **Section Spacing**: py-12 md:py-16 lg:py-20

**Grid Patterns:**
- **Product Grid**: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4, gap-6
- **Admin Tables**: Full-width with responsive horizontal scroll
- **Checkout**: Single column (max-w-2xl) for focus

---

## Component Library

### Frontend (Guest Shopping)

**Navigation Bar:**
- Sticky top header with logo (left), cart icon with badge (right), currency switcher (right area)
- Height: h-16, backdrop-blur effect
- Border: border-b with subtle divider

**Product Card:**
- Aspect ratio 4:3 image with rounded-lg corners
- Product name (truncate-2-lines)
- Price display with currency symbol, strikethrough for original price if discounted
- Stock indicator (small badge)
- Hover: subtle lift effect (shadow-lg transition)

**Shopping Cart:**
- Slide-over panel from right side (w-full max-w-md)
- Item rows with thumbnail, name, quantity controls, price
- Sticky footer with subtotal and checkout button

**Checkout Form:**
- Clean, spacious form layout (space-y-6)
- Grouped sections: Contact Info → Shipping → Billing → Review
- Progress indicator (4 steps)
- Currency toggle prominently placed above order summary
- Form inputs: Consistent height (h-12), rounded-lg borders
- Floating labels pattern for modern feel
- Checkbox for "Billing same as shipping"

**Payment Success/Failure:**
- Centered card layout (max-w-md)
- Large icon (success checkmark / failure X) - size-16
- Order number prominently displayed
- Transaction details in definition list format
- Clear CTA: "Continue Shopping" or "Try Again"

**Order Summary Sidebar:**
- Sticky position during checkout
- Line items with thumbnails
- Subtotal, tax (if applicable), total
- Currency clearly indicated
- Rounded container with subtle background

### Admin Panel

**Admin Navigation:**
- Left sidebar (w-64) with icon + label menu items
- Sections: Products, Orders, Transactions, Admin Users
- Active state with accent indicator bar
- Collapsible on mobile (hamburger menu)

**Admin Dashboard Cards:**
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4, gap-4
- Stat cards with icon, label, large number, trend indicator
- Rounded-lg with shadow-sm

**Data Tables:**
- Striped rows for readability (even row subtle background)
- Column headers: font-semibold, sticky on scroll
- Action buttons: icon-only in last column (edit, delete)
- Pagination controls at bottom
- Search/filter bar above table

**Admin Forms:**
- Two-column layout for efficiency (grid-cols-1 md:grid-cols-2)
- Clear field labels above inputs
- Required field indicators (*)
- Image upload with preview
- Action buttons right-aligned: Cancel (secondary), Save (primary)

**Transaction Log Viewer:**
- Expandable row pattern for raw JSON data
- Status badges (success: green, failure: red, pending: yellow)
- Monospace font (font-mono) for IDs and hashes
- Timestamp in relative format with tooltip for exact time

---

## Imagery

**Product Images:**
- Primary format: Clean white/light background product photography
- Aspect ratio: 4:3 for consistency across grid
- Placeholder: Subtle gradient or icon when image unavailable
- High-quality, optimized WebP format

**Hero Section (Homepage):**
- Full-width hero with featured product collection image
- Height: min-h-[500px] md:min-h-[600px]
- CTA button with blurred background overlay (backdrop-blur-sm bg-white/20)
- Text overlay with strong contrast for readability

**Icons:**
- Use Heroicons throughout
- Navigation: outline style, size-6
- Actions: solid style, size-5
- Status indicators: size-4

---

## Special Interactions

**Currency Switcher:**
- Toggle button style (INR | USD)
- Active currency highlighted with filled background
- Smooth transition for all price updates (transition-all duration-200)
- Positioned in header and checkout summary

**Cart Badge:**
- Absolute positioned counter on cart icon
- Animate on item add (scale-up then normalize)
- Hide when count is 0

**Form Validation:**
- Inline error messages below fields (text-red-600, text-sm)
- Success states with green border (border-green-500)
- Error states with red border (border-red-500)

**Loading States:**
- Spinner for button actions (inside button, size-4)
- Skeleton loaders for product grids (animate-pulse)
- Overlay with spinner for page transitions

---

## Responsive Behavior

**Mobile-First Breakpoints:**
- **sm**: 640px (2-column product grid)
- **md**: 768px (admin sidebar visible, 2-column forms)
- **lg**: 1024px (3-column product grid, expanded layouts)
- **xl**: 1280px (4-column product grid)

**Mobile Optimizations:**
- Simplified navigation (hamburger menu)
- Full-width buttons for easier tapping
- Increased touch target sizes (min h-12)
- Single column checkout flow
- Sticky CTAs on mobile

---

## Accessibility

- WCAG AA contrast ratios throughout
- Focus rings visible on all interactive elements (ring-2 ring-offset-2)
- Semantic HTML (nav, main, section, article)
- Alt text for all product images
- ARIA labels for icon-only buttons
- Keyboard navigation fully supported