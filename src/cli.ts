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
        console.log(chalk.blue(`ℹ️  ${message}`))
    }

    for (const message of results.messages.success) {
        console.log(chalk.green(`✅ ${message}`))
    }
}

function loadEnvFile(filePath: string): void {
    try {
        if (fs.existsSync(filePath)) {
            loadEnvVariables(filePath)
            console.log(chalk.green(`✅ Loaded ${filePath}`))
        } else {
            console.log(chalk.red(`❌ ${filePath} file not found`))
        }
    } catch (error) {
        console.log(chalk.red(`❌ Error loading .env file`))
    }
}

function loadEnvVariables(filePath: string): void {
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
    } catch (error) {
        console.log(
            chalk.red(
                `❌ Error while loading environnement variables from ${filePath}`
            )
        )
        return
    }
}

function loadConfig(): EnvConfig {
    try {
        const configPath = path.resolve(process.cwd(), "dotenvlock.json")
        const configContent = fs.readFileSync(configPath, "utf8")

        return JSON.parse(configContent)
    } catch (error) {
        console.log(
            chalk.red("❌ Could not find or parse dotenvlock.json file")
        )
        process.exit(1)
    }
}

export function cli(): void {
    const envFilePath = process.argv[2]

    if (!envFilePath) {
        console.log(
            chalk.red("❌ .env file not provided in package.json script!")
        )
        console.log(
            chalk.yellow(
                "⚠️  Please ensure your script in package.json is like this:"
            )
        )
        console.log(chalk.cyan('   "dotenvlock": "dotenvlock .env"'))

        return
    }

    if (!fs.existsSync(envFilePath)) {
        console.log(chalk.red(`❌ ${envFilePath} file not found`))
        console.log(
            chalk.yellow(
                `⚠️  The script will not continue loading environment variables.`
            )
        )

        return
    }

    loadEnvFile(envFilePath)

    const config = loadConfig()

    const results = validateEnv(config)

    displayResults(results)

    if (!results.valid) {
        process.exit(1)
    }
}
