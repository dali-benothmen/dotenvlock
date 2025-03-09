import { EnvVarType } from "./types"

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
