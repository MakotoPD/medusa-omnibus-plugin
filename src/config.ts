/**
 * Plugin configuration options
 */
export interface OmnibusPluginOptions {
  /**
   * Number of days to keep price history records.
   * Older records will be automatically deleted by the cleanup job.
   * @default 30
   */
  retentionDays?: number
}

/**
 * Default plugin options
 */
export const defaultOptions: Required<OmnibusPluginOptions> = {
  retentionDays: 30,
}

/**
 * Global plugin config - populated at plugin initialization
 */
let pluginConfig: Required<OmnibusPluginOptions> = { ...defaultOptions }

/**
 * Set plugin configuration (called during plugin initialization)
 */
export function setPluginConfig(options: OmnibusPluginOptions = {}): void {
  pluginConfig = {
    ...defaultOptions,
    ...options,
  }
}

/**
 * Get current plugin configuration
 */
export function getPluginConfig(): Required<OmnibusPluginOptions> {
  return pluginConfig
}
