import { createProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
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

/**
 * Hook handler that records initial price history when product variants are created.
 * This ensures Omnibus Directive compliance by tracking all prices from creation.
 */
createProductVariantsWorkflow.hooks.productVariantsCreated(
  async ({ product_variants }, { container }) => {
    const priceHistoryService: PriceHistoryModuleService = container.resolve(
      PRICE_HISTORY_MODULE
    )

    const variants = product_variants as VariantWithPriceSet[]

    for (const variant of variants) {
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
)
