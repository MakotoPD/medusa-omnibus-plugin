# Medusa Omnibus Plugin

A Medusa v2 plugin for **EU Omnibus Directive (2019/2161)** compliance. Automatically tracks product price history and displays the lowest price from the last 30 days.

## ✨ Features

- 📊 **Automatic price tracking** - records every price change for product variants
- 🏷️ **30-day lowest price** - API endpoint returning the lowest price for each variant
- 🔄 **Workflow hooks** - integrates with Medusa workflows (create/update products)
- 🗑️ **Automatic cleanup** - scheduled job removes old records (configurable retention)

## 📦 Installation

```bash
npm install medusa-omnibus-plugin
```

Or with Medusa CLI:

```bash
npx medusa plugin:add medusa-omnibus-plugin
```

## ⚙️ Configuration

### 1. Add plugin to `medusa-config.ts`

```typescript
module.exports = defineConfig({
  // ... other options
  plugins: [
    {
      resolve: "medusa-omnibus-plugin",
      options: {
        // Number of days to keep price history (default: 30)
        retentionDays: 30,
      },
    },
  ],
})
```

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `retentionDays` | `number` | `30` | Number of days to keep price history. Older records are automatically deleted by the scheduled job. |

### 2. Run migrations

```bash
npx medusa db:migrate
```

### 3. Start the server

```bash
npm run dev
```

## 🚀 How It Works

### Automatic Price Recording

The plugin automatically records price history when:

1. **Creating a new product** with variants and prices
2. **Creating a new variant** with a price
3. **Updating a variant's price** via admin panel or API

No manual action required - the plugin listens to Medusa workflow hooks:
- `createProductsWorkflow.hooks.productsCreated`
- `createProductVariantsWorkflow.hooks.productVariantsCreated`
- `updateProductVariantsWorkflow.hooks.productVariantsUpdated`

### Fetching the Lowest Price

#### API Endpoint

```
GET /store/products/:productId/price-history
```

**Headers:**
```
x-publishable-api-key: pk_xxxxx
```

**Response:**
```json
{
  "lowestPrices": {
    "variant_01ABC...": {
      "price": "4500",
      "currency_code": "pln",
      "recorded_at": "2026-01-15T10:30:00.000Z"
    },
    "variant_02DEF...": {
      "price": "3500",
      "currency_code": "pln",
      "recorded_at": "2026-01-20T14:15:00.000Z"
    }
  }
}
```

### Usage Example (Vue/Nuxt)

```vue
<script setup lang="ts">
const config = useRuntimeConfig()
const priceHistory = ref(null)

const fetchPriceHistory = async (productId: string) => {
  try {
    const response = await $fetch(
      `${config.public.medusaBackendUrl}/store/products/${productId}/price-history`,
      {
        headers: {
          'x-publishable-api-key': config.public.medusaPublishableKey
        }
      }
    )
    priceHistory.value = response
  } catch (e) {
    console.warn('Could not fetch price history:', e)
  }
}

// Calculate lowest price for selected variant
const lowestPriceInfo = computed(() => {
  if (!selectedVariantId.value || !priceHistory.value?.lowestPrices) {
    return null
  }
  
  const record = priceHistory.value.lowestPrices[selectedVariantId.value]
  if (!record) return null
  
  return {
    price: formatPrice(Number(record.price)),
    date: new Date(record.recorded_at).toLocaleDateString()
  }
})
</script>

<template>
  <div v-if="lowestPriceInfo" class="text-sm text-gray-500">
    ℹ️ Lowest price in the last 30 days: {{ lowestPriceInfo.price }}
  </div>
</template>
```

### Usage Example (React/Next.js)

```tsx
import { useEffect, useState } from 'react'

function PriceHistory({ productId, variantId }) {
  const [lowestPrice, setLowestPrice] = useState(null)

  useEffect(() => {
    fetch(`${MEDUSA_BACKEND_URL}/store/products/${productId}/price-history`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_KEY
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.lowestPrices?.[variantId]) {
          setLowestPrice(data.lowestPrices[variantId])
        }
      })
  }, [productId, variantId])

  if (!lowestPrice) return null

  return (
    <p className="text-sm text-gray-500">
      ℹ️ Lowest price in the last 30 days: {formatPrice(lowestPrice.price)}
    </p>
  )
}
```

## 📁 Plugin Structure

```
src/
├── api/
│   └── store/products/[productId]/price-history/
│       └── route.ts          # GET /store/products/:id/price-history endpoint
├── config.ts                 # Plugin configuration
├── modules/
│   └── price-history/
│       ├── index.ts          # Module definition
│       ├── service.ts        # Service with recordPriceChange, getLowestPrices methods
│       ├── models/           # OmnibusPrice data model
│       └── migrations/       # Database migrations
├── workflows/
│   └── hooks/
│       ├── variant-prices-updated.ts  # Hook after variant update
│       ├── variant-created.ts         # Hook after variant creation
│       └── products-created.ts        # Hook after product creation
└── jobs/
    └── price-history-cleanup.ts  # Scheduled job for cleaning old records
```

## 🔧 Compatibility

- Medusa v2.4.0+
- Node.js 20+
- PostgreSQL

## 📄 License

MIT

## 🤝 Support

If you have questions or issues:
- [GitHub Issues](https://github.com/MakotoPD/medusa-omnibus-plugin/issues)
