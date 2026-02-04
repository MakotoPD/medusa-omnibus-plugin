import { MedusaService } from "@medusajs/framework/utils"
import PriceHistory from "./models/price-history"

type PriceHistoryRecord = {
  id: string
  variant_id: string
  price: number
  currency_code: string
  recorded_at: Date
}

class PriceHistoryModuleService extends MedusaService({
  PriceHistory,
}) {
  /**
   * Records a price change for a variant
   */
  async recordPriceChange(
    variantId: string,
    price: number,
    currencyCode: string
  ): Promise<PriceHistoryRecord> {
    const record = await this.createPriceHistories({
      variant_id: variantId,
      price,
      currency_code: currencyCode,
      recorded_at: new Date(),
    })

    return record as PriceHistoryRecord
  }

  /**
   * Gets the lowest price for a variant in the last N days
   */
  async getLowestPriceInPeriod(
    variantId: string,
    days: number = 30
  ): Promise<PriceHistoryRecord | null> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const records = await this.listPriceHistories({
      variant_id: variantId,
      recorded_at: { $gte: cutoffDate },
    })

    if (!records.length) {
      return null
    }

    // Find the record with the lowest price
    return records.reduce((lowest, current) => {
      const lowestPrice = Number(lowest.price)
      const currentPrice = Number(current.price)
      return currentPrice < lowestPrice ? current : lowest
    }) as PriceHistoryRecord
  }

  /**
   * Gets the lowest prices for all variants of a product in the last N days
   */
  async getLowestPricesForVariants(
    variantIds: string[],
    days: number = 30
  ): Promise<Record<string, PriceHistoryRecord>> {
    const result: Record<string, PriceHistoryRecord> = {}

    for (const variantId of variantIds) {
      const lowest = await this.getLowestPriceInPeriod(variantId, days)
      if (lowest) {
        result[variantId] = lowest
      }
    }

    return result
  }

  /**
   * Deletes price history records older than the specified number of days
   */
  async cleanupOldRecords(olderThanDays: number = 60): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const oldRecords = await this.listPriceHistories({
      recorded_at: { $lt: cutoffDate },
    })

    if (oldRecords.length > 0) {
      const ids = oldRecords.map((r) => r.id)
      await this.deletePriceHistories(ids)
    }

    return oldRecords.length
  }

  /**
   * Deletes all price history records for the specified variant IDs
   */
  async deleteForVariants(variantIds: string[]): Promise<number> {
    const records = await this.listPriceHistories({
      variant_id: { $in: variantIds },
    })

    if (records.length > 0) {
      const ids = records.map((r) => r.id)
      await this.deletePriceHistories(ids)
    }

    return records.length
  }
}

export default PriceHistoryModuleService
