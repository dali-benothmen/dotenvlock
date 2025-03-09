import { EnvConfig } from "./types"
import { validateEnv } from "./validator"

export function checkEnv(
    config: EnvConfig,
    env: Record<string, string | undefined> = process.env,
    options: { throwOnError?: boolean } = {}
): Record<string, string | number | boolean> {
    const results = validateEnv(config, env)

    console.log("\nEnvGuard Environment Check:")

    for (const message of results.messages.errors) {
        console.log(`❌ ${message}`)
    }

    for (const message of results.messages.warnings) {
        console.log(`⚠️ ${message}`)
    }

    for (const message of results.messages.info) {
        console.log(`ℹ️ ${message}`)
    }

    if (results.messages.success.length > 0) {
        console.log(`✅ ${results.messages.success[0]}`)
    }

    if (options.throwOnError && !results.valid) {
        throw new Error("Environment validation failed")
    }

    return results.values
}

export type { EnvConfig, EnvVarConfig, ValidationResult } from "./types"
export default checkEnv
