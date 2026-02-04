// Plugin entry point
export * from "./modules/price-history"
export * from "./config"

import type { OmnibusPluginOptions } from "./config"
import { setPluginConfig } from "./config"

/**
 * Plugin initialization function
 * Called by Medusa when the plugin is loaded
 */
export default function initializePlugin(options: OmnibusPluginOptions = {}) {
  setPluginConfig(options)
  console.log("[Omnibus] Plugin initialized with options:", options)
}
