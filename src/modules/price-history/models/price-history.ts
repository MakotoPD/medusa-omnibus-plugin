import { model } from "@medusajs/framework/utils"

/**
 * PriceHistory model for tracking historical prices of product variants.
 * Used for Omnibus Directive compliance - displaying lowest price from last 30 days.
 */
const PriceHistory = model.define("omnibus_price_history", {
  id: model.id().primaryKey(),
  variant_id: model.text(),
  price: model.bigNumber(),
  currency_code: model.text(),
  recorded_at: model.dateTime(),
})

export default PriceHistory
