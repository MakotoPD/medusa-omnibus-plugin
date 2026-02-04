import type { MedusaContainer } from "@medusajs/framework"
import { PRICE_HISTORY_MODULE } from "../modules/price-history"
import type PriceHistoryModuleService from "../modules/price-history/service"
import { getPluginConfig } from "../config"

/**
 * Scheduled job that cleans up old price history records.
 * Runs daily and removes records older than the configured retentionDays.
 */
export default async function priceHistoryCleanupJob(
  container: MedusaContainer
) {
  const priceHistoryService: PriceHistoryModuleService = container.resolve(
    PRICE_HISTORY_MODULE
  )
  const config = getPluginConfig()

  try {
    const deletedCount = await priceHistoryService.cleanupOldRecords(config.retentionDays)
    console.log(
      `[Omnibus] Cleanup job completed: removed ${deletedCount} records older than ${config.retentionDays} days`
    )
  } catch (error) {
    console.error("[Omnibus] Cleanup job failed:", error)
  }
}

export const config = {
  name: "omnibus-price-history-cleanup",
  // Run daily at 3:00 AM
  schedule: "0 3 * * *",
}

