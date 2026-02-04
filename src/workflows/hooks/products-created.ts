import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { PRICE_HISTORY_MODULE } from "../../modules/price-history"
import type PriceHistoryModuleService from "../../modules/price-history/service"

type PriceData = {
  amount: number
  currency_code: string
}

type VariantWithPriceSet = {
  id: string
  price_set?: {
    id: string
    prices?: PriceData[]
  }
}

type ProductWithVariants = {
  id: string
  variants?: VariantWithPriceSet[]
}

/**
 * Hook handler that records initial price history when products are created.
 * This ensures Omnibus Directive compliance by tracking all prices from creation.
 */
createProductsWorkflow.hooks.productsCreated(
  async ({ products }, { container }) => {
    const priceHistoryService: PriceHistoryModuleService = container.resolve(
      PRICE_HISTORY_MODULE
    )

    const productsList = products as ProductWithVariants[]

    for (const product of productsList) {
      if (!product.variants) {
        continue
      }

      for (const variant of product.variants) {
        if (!variant.price_set?.prices) {
          continue
        }

        for (const price of variant.price_set.prices) {
          try {
            await priceHistoryService.recordPriceChange(
              variant.id,
              price.amount,
              price.currency_code
            )
            console.log(
              `[Omnibus] Recorded initial price ${price.amount} ${price.currency_code} for new variant ${variant.id}`
            )
          } catch (error) {
            console.error(
              `[Omnibus] Failed to record initial price for variant ${variant.id}:`,
              error
            )
          }
        }
      }
    }
  }
)
