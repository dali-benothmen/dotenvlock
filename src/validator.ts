import { EnvVarType, EnvConfig, ValidationResult } from "./types"

// Convert a string value to the specified type
export function convertValue(
    value: string,
    type: EnvVarType
): string | number | boolean {
    if (type === "string") {
        return value
    }

    if (type === "number") {
        const num = Number(value)
        if (isNaN(num)) {
            throw new Error(`Value "${value}" cannot be converted to a number`)
        }
        return num
    }

    if (type === "boolean") {
        const lowerValue = value.toLowerCase()
        if (["true", "1", "yes", "y"].includes(lowerValue)) {
            return true
        }
        if (["false", "0", "no", "n"].includes(lowerValue)) {
            return false
        }
        throw new Error(`Value "${value}" cannot be converted to a boolean`)
    }

    throw new Error(`Unsupported type: ${type}`)
}

// Validate environment variables based on the provided configuration
export function validateEnv(
    envConfig: EnvConfig,
    env: Record<string, string | undefined> = process.env
): ValidationResult {
    const result: ValidationResult = {
        valid: true,
        messages: {
            errors: [],
            warnings: [],
            info: [],
            success: [],
        },
        values: {},
    }

    const envKeys = Object.keys(env)
    const configKeys = Object.keys(envConfig)

    for (const key of configKeys) {
        const config = envConfig[key]
        const value = env[key]

        if (value === undefined) {
            if (config.required) {
                result.messages.errors.push(
                    `Missing required environment variable: ${key}`
                )
                result.valid = false
            } else if (config.default !== undefined) {
                result.messages.info.push(
                    `Loaded default value for ${key}: ${JSON.stringify(
                        config.default
                    )}`
                )
                result.values[key] = config.default
            } else {
                result.messages.warnings.push(
                    `Optional environment variable not defined: ${key}`
                )
            }
            continue
        }

        try {
            result.values[key] = convertValue(value, config.type)
        } catch (error) {
            if (error instanceof Error) {
                result.messages.warnings.push(
                    `Invalid type for ${key}. Expected ${
                        config.type
                    }, but got ${typeof value}.`
                )

                if (config.default !== undefined) {
                    result.messages.info.push(
                        `Loaded default value for ${key}: ${JSON.stringify(
                            config.default
                        )}`
                    )
                    result.values[key] = config.default
                } else if (config.required) {
                    result.messages.errors.push(
                        `Required variable ${key} has invalid type. Expected ${config.type}.`
                    )
                    result.valid = false
                }
            }
        }
    }

    const unknownVars = envKeys.filter(
        (key) =>
            !configKeys.includes(key) &&
            !key.startsWith("npm_") &&
            !["PATH", "NODE_ENV", "PWD", "HOME", "_"].includes(key)
    )

    if (unknownVars.length > 0) {
        result.messages.warnings.push(
            `Found ${
                unknownVars.length
            } undefined variables in environment: ${unknownVars.join(", ")}`
        )
    }

    if (result.valid) {
        result.messages.success.push("All environment variables are valid!")
    }

    return result
}
