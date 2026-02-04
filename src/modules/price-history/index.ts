import PriceHistoryModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PRICE_HISTORY_MODULE = "priceHistory"

export default Module(PRICE_HISTORY_MODULE, {
  service: PriceHistoryModuleService,
})
