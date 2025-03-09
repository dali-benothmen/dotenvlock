export type EnvVarType = "string" | "number" | "boolean"

export interface EnvVarConfig {
    type: EnvVarType
    required?: boolean
    default?: string | number | boolean
}

export interface EnvConfig {
    [key: string]: EnvVarConfig
}

export interface ValidationResult {
    valid: boolean
    messages: {
        errors: string[]
        warnings: string[]
        info: string[]
        success: string[]
    }
    values: Record<string, string | number | boolean>
}
