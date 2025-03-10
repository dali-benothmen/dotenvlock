import chalk from "chalk"
import fs from "fs"
import path from "path"
import { EnvConfig, ValidationResult } from "./types"
import { validateEnv } from "./validator"

function displayResults(results: ValidationResult): void {
    for (const message of results.messages.errors) {
        console.log(chalk.red(`❌ ${message}`))
    }

    for (const message of results.messages.info) {
        console.log(chalk.blue(`ℹ️ ${message}`))
    }

    for (const message of results.messages.success) {
        console.log(chalk.green(`✅ ${message}`))
    }
}

function loadEnvFile(filePath: string): void {
    try {
        const envContent = fs.readFileSync(filePath, "utf8")
        const envLines = envContent.split("\n")

        for (const line of envLines) {
            const trimmedLine = line.trim()
            if (trimmedLine && !trimmedLine.startsWith("#")) {
                const [key, ...valueParts] = trimmedLine.split("=")
                const value = valueParts.join("=")

                if (key && value && process.env[key] === undefined) {
                    process.env[key] = value
                }
            }
        }
    } catch (error) {}
}

function loadConfig(): EnvConfig {
    try {
        const configPath = path.resolve(process.cwd(), "envguard.json")
        const configContent = fs.readFileSync(configPath, "utf8")

        return JSON.parse(configContent)
    } catch (error) {
        console.log(chalk.red("❌ Could not find or parse envguard.json file"))
        process.exit(1)
    }
}

export function cli(): void {
    const envFilePath = process.argv[2] || path.resolve(process.cwd(), ".env")

    loadEnvFile(envFilePath)

    const config = loadConfig()

    const results = validateEnv(config)

    displayResults(results)

    if (!results.valid) {
        process.exit(1)
    }
}
