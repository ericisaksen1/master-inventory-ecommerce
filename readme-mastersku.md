# Master SKU — Linking Enoch to Lab Rats

Lab Rats is the **master inventory hub**. Connected sites (like Enoch) reference Lab Rats master SKUs so that stock is tracked centrally and orders are forwarded for fulfillment.

---

## Architecture Overview

```
┌──────────────────────┐         ┌──────────────────────┐
│      ENOCH-2026      │         │    LABRATS-2026       │
│  (connected site)    │         │  (master inventory)   │
│                      │         │                       │
│  Product.masterSku ──┼── API ──┼─► MasterSku.sku       │
│  "MSKU-BPC-157-10MG" │         │   "MSKU-BPC-157-10MG" │
│                      │         │        │               │
│                      │         │   MasterSkuLink        │
│                      │         │   ├─ productId (local) │
│                      │         │   └─ siteId + remoteRef│
└──────────────────────┘         └──────────────────────┘
```

### Key tables

| Site | Table | Purpose |
|------|-------|---------|
| **Lab Rats** | `MasterSku` | Central SKU with `sku`, `name`, `stock` |
| **Lab Rats** | `MasterSkuLink` | Links a master SKU to a local product (`productId`) or to a remote site product (`siteId` + `remoteRef`) |
| **Lab Rats** | `ConnectedSite` | Registered external sites with `name`, `domain`, `apiKey` |
| **Enoch** | `Product.masterSku` | Simple string field storing the master SKU code (e.g. `MSKU-BPC-157-10MG`) |

---

## How It Works at Checkout

1. **Enoch checkout** checks if a cart item's product has a `masterSku` value
2. If yes, Enoch calls `POST /api/inventory/check` on Lab Rats to verify stock
3. After payment, Enoch calls `POST /api/inventory/orders` to forward the order
4. Lab Rats decrements `MasterSku.stock`, creates a drop-ship order, and notifies admins

---

## Step-by-Step: Linking a New Product

### 1. Create the Master SKU on Lab Rats

**Admin UI:** Go to `/admin/inventory` → **New Master SKU**

- **SKU**: Use the convention `MSKU-PRODUCT-NAME` (uppercase, hyphens). Example: `MSKU-BPC-157-10MG`
- **Name**: The product name (e.g. `BPC-157 10mg`)
- **Stock**: Set initial inventory count

**Or via script:**
```ts
await prisma.masterSku.create({
  data: {
    sku: "MSKU-BPC-157-10MG",
    name: "BPC-157 10mg",
    stock: 100,
    isActive: true,
  },
})
```

### 2. Link it to the Lab Rats local product

**Admin UI:** Go to the product edit page → **Master Inventory** section → **+ Link SKU** → select the master SKU

This creates a `MasterSkuLink` with `productId` set and `siteId` = null (meaning it's a local link).

**Or via script:**
```ts
await prisma.masterSkuLink.create({
  data: {
    masterSkuId: "<master-sku-id>",
    productId: "<labrats-product-id>",
    quantityMultiplier: 1,
  },
})
```

### 3. Set the Master SKU on the Enoch product

**Admin UI (Enoch):** Go to the product edit page → fill in the **Master SKU** field with the exact SKU string (e.g. `MSKU-BPC-157-10MG`)

**Or via script (run from enoch-2026):**
```ts
await prisma.product.update({
  where: { id: "<enoch-product-id>" },
  data: { masterSku: "MSKU-BPC-157-10MG" },
})
```

### 4. (Optional) Create a remote link on Lab Rats

This is used for resolving Enoch product IDs back to master SKUs on the Lab Rats side:

```ts
await prisma.masterSkuLink.create({
  data: {
    masterSkuId: "<master-sku-id>",
    siteId: "<connected-site-id>",        // Enoch's ConnectedSite.id
    remoteRef: "<enoch-product-id>",       // Enoch's Product.id
    quantityMultiplier: 1,
  },
})
```

---

## Environment Variables (Enoch)

In `enoch-2026/.env`:

```env
MASTER_INVENTORY_API_URL="http://localhost:4567/api/inventory"
MASTER_INVENTORY_API_KEY="<api-key-matching-ConnectedSite.apiKey>"
```

For production, replace `localhost:4567` with the Lab Rats domain.

---

## API Endpoints (Lab Rats)

### `POST /api/inventory/check`

Check stock availability before checkout.

```json
// Request
{
  "items": [
    { "sku": "MSKU-BPC-157-10MG", "quantity": 2 }
  ]
}

// Response
{
  "items": [
    { "sku": "MSKU-BPC-157-10MG", "available": 50, "sufficient": true }
  ]
}
```

### `POST /api/inventory/orders`

Forward a completed order for drop-ship fulfillment. Decrements stock and creates an order on Lab Rats.

```json
// Request
{
  "orderNumber": "ORD-1234",
  "customer": { "email": "...", "firstName": "...", "lastName": "..." },
  "shippingAddress": { "firstName": "...", "lastName": "...", "line1": "...", "city": "...", "state": "...", "postalCode": "..." },
  "items": [
    { "masterSku": "MSKU-BPC-157-10MG", "name": "BPC-157 10mg", "quantity": 1, "price": 49.99, "total": 49.99 }
  ],
  "subtotal": 49.99,
  "tax": 0,
  "shippingCost": 5.00,
  "discountAmount": 0,
  "total": 54.99
}

// Response (201)
{
  "success": true,
  "orderId": "clxyz...",
  "orderNumber": "LR-5678"
}
```

Both endpoints require `Authorization: Bearer <api-key>` header.

---

## Variant Handling

Lab Rats products have variants (Single, 3 Pack, 5 Pack, 10 Pack) with `unitsPerItem` set on each variant. When a master SKU is linked at the **product level**, the system automatically multiplies the quantity by the variant's `unitsPerItem`. For example:

- Customer orders 1× "BPC-157 10mg — 3 Pack"
- Variant has `unitsPerItem: 3`
- Master inventory deducts 3 units

No need to create separate master SKU links per variant.

---

## SKU Naming Convention

```
MSKU-{PRODUCT-NAME-UPPERCASE}
```

Examples:
- `MSKU-BPC-157-10MG`
- `MSKU-GLP-T-40MG`
- `MSKU-BACTERIOSTATIC-WATER`
- `MSKU-TRIPLE-HELIX-MITOCHONDRIAL-POWERHOUSE-RESEARCH-BLEND`

---

## Quick Reference: Current Setup

- **Lab Rats database**: `cms_labrats2026`
- **Enoch database**: `cms_enoch2026`
- **Connected Site name**: `Enoch`
- **Total products linked**: 52
- **Master SKU stock field**: `MasterSku.stock` on Lab Rats (set/adjust in admin at `/admin/inventory`)
