# GOOD FILLS — E-COMMERCE CODING AGENT HANDOFF

**Version:** 1.0  
**Project:** Good Fills E-Commerce Website  
**Business:** Good Fills  
**Business Type:** Individual / D2C  
**Base Location:** Bengaluru, India  
**Primary Market:** India  
**International Orders:** Accepted with separate shipping calculation  
**Launch Payment:** UPI only  
**Launch Courier:** DTDC / DTDC International  
**Fulfillment Model:** Made-to-order  

---

# 01. PROJECT OVERVIEW

Build a premium, modern D2C e-commerce website for **Good Fills**, a Bengaluru-based business selling homemade food, nutrition, skincare, and bath products.

The website must make it easy for customers to:

1. Discover Good Fills.
2. Understand products.
3. Evaluate ingredients, pack size, usage, pricing, and delivery.
4. Trust the business.
5. Create an account.
6. Add products to cart.
7. Pay using UPI.
8. Receive an order confirmation.
9. Track the order after dispatch.

The system must also provide separate **Admin** and **Manager / Operations** interfaces for managing products and the manual order/shipping workflow.

Do not build the website as a generic Shopify/Amazon clone.

The experience should feel:

**Premium → Warm → Natural → Trustworthy → Modern → Minimal → Easy to shop**

Primary strategic priority:

**Customer clarity → Usability → Trust → Conversion → Brand → Visual sophistication → Delight**

---

# 02. BUSINESS MODEL

Good Fills sells physical products directly to customers through its website.

## Fulfillment

Products are made to order.

The website should not pretend that the business maintains large quantities of finished stock if that is not how the operation works.

## Product customization

Customization currently means **quantity only**.

Do not create ingredient customization or personalized formulations unless explicitly added in a future phase.

## Shelf life

Current business-level shelf life:

**6 months**

Use product-specific values later if the business provides different verified information.

## FSSAI

The business has an FSSAI licence.

The final site should display the appropriate FSSAI details after they are provided and verified.

---

# 03. BRAND POSITIONING

Core idea:

**Homemade traditional products prepared with care.**

Brand direction:

**Premium Modern Luxury Minimal**

The premium appearance should come from:

- Strong typography
- High-quality product photography
- Spacious layout
- Clear hierarchy
- Restrained UI
- Warm, natural visual language
- Thoughtful motion

Do NOT rely on:

- Excessive gradients
- Excessive gold
- Glassmorphism everywhere
- Heavy shadows
- Huge rounded cards
- Loud animations
- Generic wellness stock imagery

---

# 04. PRODUCT CATALOG

There are 13 launch products.

## Baby & Kids

### 1. Baby Cereal Mix
- Price: ₹225
- Pack Size: 250g
- Ingredients: Not specified in the current catalog

### 2. Ragi Porridge Mix
- Price: ₹400
- Pack Size: 250g
- Ingredients: More than 48 grains are mentioned, but individual grains are not listed in the current catalog

### 3. Kids Bath Powder
- Price: ₹200
- Pack Size: 100g
- Ingredients:
  - Gram Flour
  - White Turmeric
  - Baje
  - Wild Turmeric
  - Menthya
  - Nut Grass Root
  - Avarampoo
  - Green Gram
  - Rose Petals
  - Masoor Gram

### 4. Kids Nutrition Powder
- Price: ₹600
- Pack Size: 250g
- Ingredients:
  - Badam
  - Sunflower Seeds
  - Cashew
  - Walnut
  - Hazelnut
  - Pista
  - Rock Candy (Kempu Kallsakre)

### 5. Baby Ragi Sari
- Price: ₹250
- Pack Size: 250g
- Ingredients mentioned:
  - Sprouted Ragi
  - Rice
  - Toor Dal
  - Masoor Dal
  - Almonds
  - Additional ingredients are not individually specified in the current catalog

---

## Nutrition & Wellness

### 6. ImmuniTea
- Price: ₹450
- Pack Size: 250g
- Ingredients:
  - Black Cardamom
  - Coriander Seeds
  - Tipli
  - Cumin Seeds
  - Om Seeds
  - Dry Wild Ginger
  - Cinnamon
  - Cloves
  - Pepper
  - Sage
  - Tulsi Seeds
  - Ashwagandha
  - Bhrami

### 7. Wonder Millet Mix
- Price: ₹250
- Pack Size: 250g
- Ingredients: All-natural millets & multigrain are mentioned, but individual ingredients are not listed in the current catalog

### 8. Homemade Protein Powder
- Price: ₹850
- Pack Size: 250g
- Ingredients:
  - Almond
  - Walnut
  - Pistachios
  - Cashew
  - Pumpkin Seeds
  - Melon Seeds
  - Sunflower Seeds
  - Oats
  - Chia Seeds
  - Milk Powder
  - Dry Banana Powder

### 9. Instant Barley Soup Mix
- Price: ₹375
- Pack Size: 250g
- Ingredients:
  - Barley
  - Almonds
  - Cashews
  - Jeera
  - Black Pepper
  - Himalayan Pink Salt
  - Tomato Powder
  - Garlic Powder
  - Ginger Powder
  - Onion Powder

---

## Skin & Bath

### 10. Ubtan Face Pack
- Price: ₹250
- Pack Size: 100g
- Ingredients: Not specified in the current catalog

### 11. Sandal Bath Powder
- Price: ₹400
- Pack Size: 100g
- Ingredients:
  - Sandal
  - Turmeric
  - White Turmeric
  - Rose Petals
  - Champak
  - Muthakach Khus
  - Indian Sarsaparilla
  - Cinnamon
  - Sagewort
  - Marjoram
  - Flagroot / Sweet Cane
  - Black Stone Flower
  - Red Bay Leaf

---

## Pantry & Beverages

### 12. Pure Mountain Honey
- Price: ₹400
- Pack Size: 500g
- Ingredients: Pure honey is described, but the current catalog does not provide a detailed ingredient specification

### 13. Filter Coffee Powder
- Price: ₹500
- Pack Size: 500g
- Ingredients:
  - Robusta Coffee Beans
  - Arabica Coffee Beans
  - Chicory
- Blend: 80:20 coffee/chicory ratio

---

# 05. PRODUCT CONTENT RULES

The current catalog is the source for product facts.

Do not invent:

- Ingredients
- Reviews
- Testimonials
- Certifications
- Benefits
- Usage instructions
- Preparation instructions
- Storage instructions
- Product specifications

If information is missing:

**Display as pending / to be confirmed in the admin content workflow.**

Do not silently manufacture content.

## Health and skincare claims

Some catalog copy contains claims related to immunity, diabetes, asthma, blood pressure, acne, infections and other health outcomes.

Do NOT automatically convert these claims into unsupported medical claims on the website.

Where health-related claims are used, they must be reviewed and approved before publication.

---

# 06. SITE INFORMATION ARCHITECTURE

## Public

- Home
- Shop
- Category Pages
- Product Detail Pages
- Search Results
- About Good Fills
- FAQ
- Contact
- Shipping & Delivery
- Cancellation Policy
- Return / Damage Policy
- Privacy Policy
- Terms & Conditions
- Cookie Policy

## Customer account

- Login
- Register
- Profile
- Saved Addresses
- Orders
- Order Details
- Track Order
- Wishlist

## Management

- Admin Panel
- Manager / Operations Panel

---

# 07. CUSTOMER ACCESS MODEL

Anyone can browse the site without logging in.

A customer must have an account to purchase.

## Customer journey

```text
Browse
  ↓
Product
  ↓
Add to Cart
  ↓
Login / Create Account
  ↓
Checkout
  ↓
UPI
  ↓
Order Confirmation
  ↓
Order Tracking
```

Do not force login for ordinary browsing.

---

# 08. HOMEPAGE STRUCTURE

Use the following order unless later design testing demonstrates a clear improvement:

1. Minimal announcement bar
2. Navigation
3. Hero
4. Shop by Category
5. Featured Products
6. Why Good Fills
7. Traditional / Made-to-Order Process
8. Product Discovery / Curated Collection
9. Trust / FSSAI / Business Information
10. Reviews when genuine reviews exist
11. Final CTA
12. Footer

## Hero direction

Primary message:

**Traditional care, made for everyday life.**

Supporting message:

**Homemade food, nutrition, skincare and bath products prepared with care and made to order.**

Primary CTA:

**Shop Products**

Do not overcrowd the hero with information.

---

# 09. NAVIGATION

## Desktop

- Logo
- Shop
- About
- Contact
- Search
- Account
- Cart

## Mobile

Use a compact menu.

Prioritize:

- Shop
- Search
- Account
- Cart

Navigation must remain lightweight.

---

# 10. SHOP PAGE

Show:

- Page title
- Short description
- Category controls
- Sort
- Product grid
- Empty state

## Sorting

- Recommended
- Price: Low to High
- Price: High to Low
- Newest, if relevant

## Filters

Keep filters intentionally minimal:

- Category
- Price
- Product type
- Availability
- Pack size

Do not build complex Amazon-style filtering for a 13-product catalog.

---

# 11. PRODUCT CARD

Each product card should show:

- Product image
- Product name
- Short descriptor
- Pack size
- Price
- Add to Cart
- Optional wishlist

Example:

```text
Ragi Porridge Mix
Sprouted grain-based baby porridge mix
250g
₹400

[ Add to Cart ]
```

Do not overload product cards with excessive metadata.

Do not use fake badges such as:

- Best Seller
- Trending
- Only 2 left

unless the business data actually supports them.

---

# 12. PRODUCT DETAIL PAGE

## Above the fold

### Left

Product gallery:

- Main image
- Packaging image
- Detail image
- Lifestyle image where available
- Video where available

### Right

- Product name
- Short description
- Price
- Pack size
- Quantity selector
- Add to Cart
- Made-to-order message
- Estimated delivery

Example:

**Made to order**

**Estimated delivery: 2–4 days**

## Below

Use sections:

1. Overview
2. Why customers may choose it
3. Ingredients
4. Usage
5. Preparation
6. Storage
7. Shelf Life
8. Shipping
9. Return / Damage Policy
10. Reviews
11. Related Products

Only render sections that have verified content.

---

# 13. PRODUCT MEDIA

## Required

- Clean product image
- Packaging image

## Recommended

- Ingredient/detail image
- Lifestyle/use image
- Short product video

## Optional

- Traditional preparation footage
- Behind-the-scenes making footage

Images should communicate:

**What is it? → What does it look like? → How is it used? → Why should I consider it?**

---

# 14. CART

Cart must show:

- Product image
- Product name
- Pack size
- Quantity
- Unit price
- Remove
- Subtotal
- Shipping
- Final total
- Checkout CTA

## Shipping calculation

Use **product weight only**.

Do NOT include packaging weight in the customer-facing calculation.

### Domestic shipping slabs

| Total Product Weight | Shipping |
|---|---:|
| Up to 500g | ₹100 |
| 501g–1kg | ₹200 |
| 1.01–2kg | ₹400 |
| 2.01–3kg | ₹600 |
| Every additional started 1kg | +₹200 |

Examples:

- 450g → ₹100
- 700g → ₹200
- 1.2kg → ₹400
- 2.6kg → ₹600

The rule should be implemented generically rather than as a few hard-coded special cases.

## International

Display:

**International shipping calculated separately**

Do not calculate international shipping automatically in Phase 1.

---

# 15. CHECKOUT

## Step 1 — Account

Customer must be authenticated.

## Step 2 — Customer details

- Name
- Email
- Phone

## Step 3 — Delivery address

- Full address
- PIN code
- City
- State
- Country

## Step 4 — Shipping

Show:

**Estimated delivery: 2–4 days**

This is an estimate, not an exact delivery guarantee.

## Step 5 — Payment

**UPI only**

Do not implement:

- COD
- Cards
- Bank Transfer
- Wallets
- Other payment methods

## Step 6 — Order review

Show:

- Products
- Quantities
- Product subtotal
- Shipping
- Any applicable taxes/charges
- Final total

## Step 7 — Payment

The UPI implementation must return an authoritative payment success/failure state.

Do not mark an order as paid merely because the user reached or left the payment screen.

---

# 16. INTERNATIONAL ORDER FLOW

International demand is accepted, but automatic international shipping and a broader international payment flow are not part of Phase 1.

Use:

**International Order Request**

Collect:

- Customer account
- Name
- Email
- Phone
- Delivery address
- Country
- Requested products
- Quantities

Display:

**International shipping is calculated separately. Our team will contact you with shipping and order details.**

This is preferable to pretending the current system already supports complete automated international checkout.

---

# 17. ORDER IDENTIFIERS

There are two separate identifiers.

## Order ID

Generated by Good Fills website.

Example:

`ORD-1024`

## Courier Tracking / Consignment Number

Generated by DTDC.

Example:

`DTDC-TRACKING-NUMBER`

Never use the Order ID as the tracking number.

The tracking field should be named:

**Tracking / Consignment Number**

Do not hard-code the backend around the term `AWB`, because courier terminology may differ.

---

# 18. ORDER STATUS MODEL

## Payment Status

```text
Pending
Paid
Failed
Refunded
```

## Order Status

```text
Pending
Confirmed
Processing
Ready to Ship
Shipped
Delivered
Cancelled
Returned
RTO
```

## Shipment Status

```text
Not Shipped
Handed Over
In Transit
Out for Delivery
Delivered
Delivery Failed
RTO
```

These are separate concepts and must remain separate in the data model.

---

# 19. ORDER WORKFLOW

```text
Customer visits site
        ↓
Selects product
        ↓
Adds to cart
        ↓
Login / Create account
        ↓
Checkout
        ↓
UPI payment
        ↓
Payment succeeds
        ↓
Order created
        ↓
Payment = Paid
Order = Confirmed
Shipment = Not Shipped
        ↓
Good Fills prepares product
        ↓
Order = Processing
        ↓
Product packed
        ↓
Order = Ready to Ship
        ↓
Package handed to DTDC
        ↓
DTDC provides Tracking / Consignment Number
        ↓
Admin / Manager enters tracking number
        ↓
Order = Shipped
Shipment = Handed Over / In Transit
        ↓
Manual shipment monitoring
        ↓
Out for Delivery
        ↓
Delivered
        ↓
Order = Delivered
Shipment = Delivered
```

Do not build courier API automation for Phase 1.

---

# 20. SHIPPING WORKFLOW

Current courier:

**DTDC**

International courier/service:

**DTDC International or applicable international DTDC service**

Manual process:

1. Customer places order.
2. UPI payment succeeds.
3. Order reaches Admin and Manager.
4. Good Fills prepares the product.
5. Product is packed.
6. Order becomes Ready to Ship.
7. Package is handed over to DTDC.
8. DTDC provides a tracking/consignment number.
9. Admin or Manager enters the number.
10. Order becomes Shipped.
11. Customer receives tracking information.
12. Shipment updates are initially manual.
13. Order becomes Delivered after delivery is confirmed.

---

# 21. DELIVERY ESTIMATE

Launch estimate:

**2–4 days**

Make this **Admin configurable**.

Do not create a fake real-time ETA engine.

Do not claim an exact date unless the business has a reliable source for one.

The UI should say:

**Estimated delivery: 2–4 days**

not:

**Guaranteed delivery on October 12**

---

# 22. CUSTOMER ORDER CONFIRMATION

After successful payment show:

- Success state
- Order ID
- Product summary
- Quantities
- Total amount
- Payment status
- Delivery address
- Estimated delivery
- Order timeline

Example:

```text
ORDER CONFIRMED

Order #ORD-1024

Ragi Porridge Mix × 2
Total: ₹800
Payment: Paid

Estimated delivery:
2–4 days

Confirmed
   ↓
Processing
   ↓
Ready to Ship
   ↓
Shipped
   ↓
Delivered
```

Only show statuses that are applicable to the current order.

---

# 23. CUSTOMER TRACKING

Once shipped, display:

- Courier: DTDC
- Tracking / Consignment Number
- Shipping date
- Estimated delivery
- Track Shipment CTA
- Shipment status

The Track Shipment action should point to the appropriate DTDC tracking destination or tracking flow.

Do not claim live tracking data unless an API actually provides it.

---

# 24. ACCOUNT AREA

## Profile

- Name
- Email
- Phone
- Saved addresses

## Orders

- Order history
- Order details
- Payment status
- Order status
- Shipment status
- Tracking number
- Track shipment

## Wishlist

P2.

Do not make wishlist a launch blocker.

---

# 25. ADMIN PANEL

Admin has full business control.

## Dashboard

Show:

- Total Orders
- New Orders
- Processing
- Ready to Ship
- Shipped
- Delivered
- Cancelled
- RTO
- Revenue
- Basic sales trends
- Products unavailable
- Orders requiring action

## Order management

Search/filter:

- Order ID
- Customer
- Date
- Payment status
- Order status
- Shipment status

Order row/detail fields:

- Order ID
- Date
- Customer
- Phone
- Email
- Products
- Quantities
- Total
- Payment status
- Order status
- Shipment status
- Courier
- Tracking / Consignment Number
- Estimated delivery
- Delivery address
- PIN code
- Order notes
- Timeline/history

## Product management

Admin can:

- Add product
- Edit product
- Remove product
- Change price
- Upload images
- Edit descriptions
- Edit ingredients
- Edit usage
- Edit preparation
- Edit storage
- Edit shelf life
- Set availability
- Set featured state
- Assign category
- Set product weight
- Manage related products

## Content management

Admin should be able to manage:

- Announcement bar
- Homepage featured products
- Homepage content blocks
- FAQ
- Contact information
- Shipping estimate
- Policies where appropriate

## User management

Admin can:

- Create manager users
- Disable manager users
- Manage roles
- Manage permissions

---

# 26. MANAGER / OPERATIONS PANEL

Manager exists for daily operational website and order management.

## Manager can

- View new orders
- View customer/order details
- Check payment status
- Process orders
- Update processing status
- Mark Ready to Ship
- Enter DTDC tracking number
- Enter courier information
- Update shipment status
- Enter/update estimated delivery
- Mark Delivered
- View order history
- View basic availability
- Contact customers
- Receive operational notifications

## Manager cannot

- Manage users/roles
- Configure payment infrastructure
- Change owner-level financial settings
- Change security settings
- Modify database/system configuration
- Change core system settings without authorization

Use role-based permissions.

Do not implement Manager as an Admin clone.

---

# 27. INVENTORY / AVAILABILITY

Because products are made to order, avoid pretending that finished-goods inventory is always physically sitting on a shelf.

## Customer-facing states

- Available
- Temporarily Unavailable

## Future internal inventory

A future phase may track:

- Ingredients
- Raw materials
- Packaging materials
- Finished products

For Phase 1, keep availability management simple unless actual stock tracking is required by the business.

---

# 28. PRODUCT DATA MODEL

Recommended fields:

```text
Product
├── id
├── name
├── slug
├── category
├── shortDescription
├── description
├── price
├── packSize
├── productWeight
├── sku
├── images
├── videos
├── ingredients
├── benefits
├── usageInstructions
├── preparationInstructions
├── storageInstructions
├── shelfLife
├── availability
├── featured
├── seoTitle
├── seoDescription
├── canonicalUrl
├── altText
├── relatedProducts
└── reviews
```

Do not force irrelevant fields into every product.

Example:

A coffee product does not need a fictional skincare usage field.

---

# 29. CUSTOMER DATA MODEL

Recommended fields:

```text
Customer
├── id
├── name
├── email
├── phone
├── passwordHash
├── addresses
├── createdAt
├── updatedAt
└── accountStatus
```

Passwords must never be stored as plaintext.

---

# 30. ORDER DATA MODEL

Recommended fields:

```text
Order
├── id
├── orderNumber
├── customerId
├── items
├── subtotal
├── shippingCost
├── total
├── currency
├── paymentStatus
├── orderStatus
├── shipmentStatus
├── shippingAddress
├── destinationPin
├── courier
├── trackingNumber
├── estimatedDelivery
├── dispatchDate
├── deliveredDate
├── notes
├── createdAt
├── updatedAt
└── statusHistory
```

---

# 31. ORDER STATUS HISTORY

Every meaningful status change should create a history event.

Example:

```text
Order placed
Payment confirmed
Order confirmed
Processing
Ready to Ship
Tracking number added
Shipped
In Transit
Out for Delivery
Delivered
```

Store timestamps.

This provides operational traceability and makes customer support much easier.

---

# 32. PAYMENT

Phase 1:

**UPI only**

Requirements:

- Payment initiation
- Payment success
- Payment failure
- Payment reference/transaction metadata as returned by provider
- Server-side verification where supported
- Duplicate-payment protection
- Idempotent order creation
- Clear failure handling

Do not mark orders as Paid based only on client-side UI state.

Payment gateway/provider choice can be finalized during implementation.

---

# 33. NOTIFICATIONS

## Customer

- Account creation
- Order placed
- Payment successful
- Order confirmed
- Processing
- Ready to Ship
- Shipped
- Tracking number added
- Delivered

## Admin / Manager

- New order
- Successful payment
- Processing required
- Ready to ship
- Tracking number missing
- Important order issue
- Delivery status requiring update

Do not build complex notification automation unless the actual provider and channel are defined.

---

# 34. SUPPORT

Business contact:

**Phone / WhatsApp:** +91 97420 68899  
**Email:** goodfillsproducts@gmail.com  
**Instagram:** https://www.instagram.com/goodfills2020

Support CTAs may appear:

- In header/contact area
- On product pages where helpful
- In order details
- On damaged-order information
- In footer

Do not use intrusive WhatsApp popups repeatedly.

---

# 35. RETURNS / DAMAGE / CANCELLATION

## Return policy

Products are **not returnable** as a general change-of-mind return.

## Damaged product

Customer should contact Good Fills with:

- Order ID
- Product information
- Description of issue
- Supporting photos/video where useful

Good Fills reviews the issue and communicates the appropriate resolution.

## Cancellation

Cancellation may be considered before the order enters preparation/processing, subject to business policy.

Once preparation has started, cancellation may not be available.

Final policy copy must be reviewed by the business before publication.

---

# 36. UI / VISUAL SYSTEM

## Direction

Premium Modern Luxury Minimal.

## Typography

Use a refined editorial display typeface for major headings and a highly readable modern sans-serif for body/UI text.

Do not use more than two type families unless there is a compelling reason.

## Color

Prioritize:

- Warm white / clean light background
- Dark charcoal text
- Restrained brand accent
- Soft neutral surfaces
- Clear success/warning/error states

Use the supplied brand assets/colors as the final source of truth.

## Layout

- Large whitespace
- Strong alignment
- Editorial composition
- Consistent spacing
- Clear product hierarchy
- Restrained containers

## Product imagery

Products should remain visually dominant.

---

# 37. MOTION

Motion should be:

**Fast → Smooth → Controlled → Intentional**

Use motion for:

- Product gallery transitions
- Hover states
- Add-to-cart confirmation
- Cart transitions
- Search interactions
- Filter interactions
- Page transitions where appropriate
- Order success state
- Small scroll reveals

Do not delay important actions.

Do not animate checkout unnecessarily.

Support reduced-motion preferences.

---

# 38. THREE SIGNATURE EXPERIENCES

## WOW 01 — Product Story

Present product imagery, ingredients, preparation, and usage as one coherent editorial section.

## WOW 02 — Made-to-Order Journey

Visually communicate:

```text
Your Order
   ↓
Prepared
   ↓
Packed
   ↓
Handed to DTDC
   ↓
Delivered
```

This reinforces the real business model.

## WOW 03 — Order Confirmation

Create a polished confirmation moment with:

- Order ID
- Product summary
- Total
- Delivery estimate
- Timeline
- Tracking readiness

Do not turn the moment into a giant animation.

---

# 39. SEARCH

Search should support:

- Exact product names
- Partial product names
- Categories
- Product types
- Relevant ingredient terms

Examples:

`ragi`
→ Ragi Porridge Mix
→ Baby Ragi Sari

`coffee`
→ Filter Coffee Powder

`bath`
→ Kids Bath Powder
→ Sandal Bath Powder

## No results

Show:

- Clear message
- Search suggestions
- Category links
- All Products CTA

---

# 40. RECOMMENDATIONS

Use contextual recommendations.

Examples:

**Ragi Porridge Mix**
→ Baby Ragi Sari

**Ubtan Face Pack**
→ Sandal Bath Powder

**Filter Coffee Powder**
→ Pure Mountain Honey

**Homemade Protein Powder**
→ Wonder Millet Mix

Recommendations should help customers shop, not pressure them.

---

# 41. PROMOTIONS

Launch without aggressive promotional mechanics.

Do not implement:

- Fake urgency
- Fake countdowns
- Fake stock scarcity
- Fake discounts

Future options:

- Coupons
- Bundles
- Quantity discounts
- First-order offers
- Seasonal campaigns

---

# 42. SEO

Every indexable product page needs:

- Clean URL
- SEO title
- Meta description
- Canonical URL
- Product structured data
- Breadcrumbs
- Image alt text
- Internal links

## URL examples

```text
/shop
/shop/baby-kids
/shop/nutrition-wellness
/shop/skin-bath
/shop/pantry-beverages

/products/ragi-porridge-mix
/products/homemade-protein-powder
/products/filter-coffee-powder
```

Avoid query-heavy public URLs when a clean path is possible.

---

# 43. ANALYTICS

Track:

## Discovery

- Homepage view
- Category view
- Product view
- Search
- Search result click

## Commerce

- Add to cart
- Remove from cart
- Begin checkout
- Payment initiated
- Payment success
- Payment failure
- Purchase

## Business

- Revenue
- Orders
- Average order value
- Product conversion
- Repeat purchases
- Cancellation
- RTO
- Shipping issues

Analytics must not collect unnecessary personal data.

---

# 44. ACCESSIBILITY

Required:

- Sufficient color contrast
- Semantic HTML
- Visible focus states
- Keyboard navigation
- Proper labels
- Form validation
- Useful error messages
- Alt text
- Adequate touch targets
- Reduced motion support

---

# 45. PERFORMANCE

Prioritize:

- Optimized images
- Responsive image sizes
- Lazy loading
- Efficient JavaScript
- Minimal third-party scripts
- Fast product pages
- Fast cart
- Fast checkout
- Optimized fonts
- Appropriate caching
- Good loading states

Do not sacrifice performance for decorative effects.

---

# 46. ERROR / EMPTY STATES

Implement intentional states for:

## Product

- Unavailable
- Temporarily unavailable
- Image unavailable

## Search

- No results
- Invalid query

## Cart

- Empty cart
- Product became unavailable
- Price changed

## Checkout

- Invalid address
- Invalid PIN
- Session expired
- Network failure
- Payment failure

## Orders

- Missing tracking number
- Failed shipment
- RTO
- Cancelled order

## Account

- Login failure
- Wrong credentials
- Forgot password
- Expired session

Every error must tell the user what happened and what to do next.

---

# 47. SECURITY

Implement standard secure web practices:

- Secure password hashing
- Authentication/session security
- Authorization by role
- Server-side validation
- Input sanitization
- CSRF protection where applicable
- Rate limiting for sensitive endpoints
- Secure payment verification
- Secure file uploads
- Access control on customer orders
- Audit trail for important admin actions
- Protection of sensitive configuration

Customers must only access their own accounts and orders.

Managers must not access restricted admin functionality.

---

# 48. ADMIN CONFIGURABILITY

These should be configurable without code:

## Business

- Business name
- Phone
- WhatsApp
- Email
- Address
- Social links

## Shipping

- Domestic shipping slabs
- Delivery estimate
- Courier display name
- International shipping message

## Products

- Price
- Availability
- Product content
- Images
- Featured state

## Content

- Homepage sections
- Featured products
- FAQ
- Announcement bar

## Policies

- Policy content

---

# 49. PRIORITY SYSTEM

## P0 — ESSENTIAL

- Public product catalog
- Categories
- Product detail pages
- Cart
- Mandatory customer account
- Checkout
- UPI
- Order creation
- Order ID
- Domestic shipping calculation
- DTDC manual workflow
- Tracking number entry
- Customer order tracking
- Admin panel
- Manager panel
- Role-based access
- Product management
- Order management
- Responsive UI
- Policies
- Basic SEO
- Analytics
- Security
- Loading/error/empty states

## P1 — HIGH VALUE

- Genuine reviews
- Product video
- Related products
- Recently viewed
- Strong search
- Order notifications
- Admin analytics
- CMS controls
- International order request
- Reorder

## P2 — ENHANCEMENT

- Wishlist
- Coupons
- Bundles
- Advanced filtering
- Advanced recommendations
- Review photos
- More advanced analytics

## FUTURE

- Automated DTDC/shipping API
- Automated tracking updates
- International payment gateway
- International shipping calculator
- Raw-material inventory
- Advanced personalization
- Loyalty
- Subscription/reorder automation

---

# 50. MUST NOT DO

Do not:

1. Replace DTDC with India Post.
2. Add bank transfer in Phase 1.
3. Add COD.
4. Add card payments.
5. Build courier API automation in Phase 1.
6. Invent ingredients.
7. Invent product benefits.
8. Invent medical outcomes.
9. Invent reviews/testimonials.
10. Invent certifications.
11. Invent discounts.
12. Create fake scarcity.
13. Create fake real-time shipping estimates.
14. Hide shipping cost until the final step.
15. Mix payment/order/shipment statuses.
16. Give Manager unrestricted Admin access.
17. Require login just to browse.
18. Build Amazon-style complexity for 13 products.
19. Overuse cards.
20. Overuse rounded UI.
21. Overuse gradients.
22. Add decorative animation that slows the website.
23. Use generic stock imagery when real product imagery is available.
24. Make checkout visually complicated.
25. Add AI features without a concrete customer/business benefit.

---

# 51. LEGAL / POLICY PAGES

The site should include initial versions of:

- Privacy Policy
- Terms & Conditions
- Shipping & Delivery Policy
- Cancellation Policy
- Return / Damage Policy
- Cookie Policy
- Product Disclaimer

Final legal content must be reviewed and approved by the business before production publication.

Do not hard-code legal text in a way that makes future updates difficult.

---

# 52. FINAL EXPERIENCE PRINCIPLE

The website should make the customer understand:

1. **What Good Fills sells**
2. **Why the products are different**
3. **What each product is**
4. **What is inside it**
5. **How much it costs**
6. **When it should arrive**
7. **How to buy it**
8. **How to track it**
9. **How to get help if there is a problem**

The experience should feel premium without becoming confusing.

The website is an e-commerce product first and a visual showcase second.

---

# 53. IMPLEMENTATION NOTES

The coding agent is responsible for implementation details, but architecture should remain modular enough to support future additions without rebuilding the entire system.

Particularly keep these modules separable:

- Authentication
- Products
- Categories
- Cart
- Checkout
- Payment
- Orders
- Shipping
- Notifications
- Customers
- Reviews
- Admin
- Manager
- Analytics

The Phase 1 shipping workflow is intentionally manual, but the shipping data model should allow future courier/API integrations.

The Phase 1 payment method is intentionally UPI-only, but the payment layer should be designed so additional payment providers/methods can be added later.

---

# 54. LAUNCH CHECKLIST

Before production launch, confirm:

- [ ] All 13 products are entered correctly
- [ ] Product prices are confirmed
- [ ] Product weights are confirmed
- [ ] Ingredient data is confirmed
- [ ] Usage/preparation information is confirmed
- [ ] Storage information is confirmed
- [ ] Product images are approved
- [ ] Packaging images are approved
- [ ] FSSAI details are verified
- [ ] Business address is confirmed
- [ ] Shipping slab values are configured
- [ ] Delivery estimate is configured to 2–4 days
- [ ] DTDC workflow is tested
- [ ] UPI payment is tested
- [ ] Payment failure is tested
- [ ] Duplicate payment/order creation is tested
- [ ] Customer account creation works
- [ ] Customer can only view own orders
- [ ] Admin permissions are tested
- [ ] Manager restrictions are tested
- [ ] Order timeline works
- [ ] Tracking number entry works
- [ ] Mobile checkout works
- [ ] Shipping cost appears correctly
- [ ] International order request flow works
- [ ] Legal pages are reviewed
- [ ] Analytics events are tested
- [ ] SEO metadata is present
- [ ] Accessibility basics are checked
- [ ] Error/empty states are tested
- [ ] Production security review is completed

---

# END

**Build the smallest complete system that makes Good Fills easy and trustworthy to buy from.**

Do not confuse complexity with quality.

**P0 first. Then P1. Then P2. Future remains future.**
