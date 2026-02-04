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
 * DELETE /admin/products/:productId/price-history
 *
 * Deletes all price history records for a product's variants.
 * Used by admin to reset price history for Omnibus Directive.
 */
export async function DELETE(
  req: MedusaRequest<Record<string, unknown>, Params>,
  res: MedusaResponse
) {
  const { productId } = req.params

  try {
    const priceHistoryService: PriceHistoryModuleService = req.scope.resolve(
      PRICE_HISTORY_MODULE
    )
    const productService = req.scope.resolve("product")

    // Fetch the product with its variants
    const product = (await productService.retrieveProduct(productId, {
      relations: ["variants"],
    })) as ProductWithVariants

    if (!product?.variants || product.variants.length === 0) {
      res.json({
        success: true,
        deleted_count: 0,
        message: "No variants found for this product",
      })
      return
    }

    // Get variant IDs
    const variantIds = product.variants.map((v) => v.id)

    // Delete all price history for these variants
    const deletedCount = await priceHistoryService.deleteForVariants(variantIds)

    console.log(
      `[Omnibus] Deleted ${deletedCount} price history records for product ${productId}`
    )

    res.json({
      success: true,
      deleted_count: deletedCount,
      message: `Deleted ${deletedCount} price history records`,
    })
  } catch (error) {
    console.error(
      `[Omnibus] Failed to delete price history for product ${productId}:`,
      error
    )

    res.status(500).json({
      success: false,
      message: "Failed to delete price history",
    })
  }
}
