import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRICE_HISTORY_MODULE } from "../../../../../modules/price-history"
import type PriceHistoryModuleService from "../../../../../modules/price-history/service"

type ProductWithVariants = {
  id: string
  variants?: Array<{ id: string }>
}

type Params = {
  productId: string
}

/**
 * GET /store/products/:productId/price-history
 * 
 * Returns the lowest prices for all variants of a product over the last 30 days.
 * Used for Omnibus Directive compliance display.
 */
export async function GET(
  req: MedusaRequest<Record<string, unknown>, Params>,
  res: MedusaResponse
) {
  const { productId } = req.params

  try {
    // Resolve services
    const priceHistoryService: PriceHistoryModuleService = req.scope.resolve(
      PRICE_HISTORY_MODULE
    )
    const productService = req.scope.resolve("product")

    // Fetch the product with its variants (without pricing - avoids context issues)
    const product = (await productService.retrieveProduct(productId, {
      relations: ["variants"],
    })) as ProductWithVariants

    if (!product?.variants || product.variants.length === 0) {
      res.json({
        lowestPrices: {},
      })
      return
    }

    // Get variant IDs
    const variantIds = product.variants.map((v) => v.id)

    // Get lowest prices for all variants in the last 30 days
    const lowestPrices = await priceHistoryService.getLowestPricesForVariants(
      variantIds,
      30
    )

    res.json({
      lowestPrices,
    })
  } catch (error) {
    console.error(
      `[Omnibus] Failed to get price history for product ${productId}:`,
      error
    )

    res.status(500).json({
      message: "Failed to retrieve price history",
    })
  }
}

