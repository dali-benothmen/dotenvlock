# EnvGuard

A tiny but powerful Node.js utility to validate, type-check, and manage environment variables. Catch misconfigurations early and prevent runtime errors in production.

## Features

-   **Prevent crashes** due to missing or invalid environment variables
-   **Enforce type safety** for strings, numbers, and booleans
-   **Set defaults** for optional variables
-   **Fail fast or log warnings** — choose how strict you want it to be
-   **Works with dotenv** or any environment config system
-   **Detailed console feedback** with color-coded, easy-to-read logs

## Installation

```bash
npm install envguard

# or

yarn add envguard
```

## Basic Usage

### Step 1: Create a configuration file

Create a file named `envguard.json` in your project root:

```json
{
    "API_KEY": { "type": "string", "required": true },
    "PORT": { "type": "number", "default": 3000 },
    "DEBUG_MODE": { "type": "boolean", "default": false }
}
```

### Step 2: Add the validation script

Add an EnvGuard script to your `package.json`:

```json
{
    "scripts": {
        "envguard": "envguard .env"
    }
}
```

### Step 3: Run the validation

```bash
npm run envguard
```

You'll see output like:

```
✅ All environment variables are valid!
```

or

```
❌ Missing required environment variable: API_KEY
```

### Step 4: Use in your code

```typescript
import { checkEnv } from "envguard"

// Validates environment variables and returns typed values
const env = checkEnv({
    API_KEY: { type: "string", required: true },
    PORT: { type: "number", default: 3000 },
    DEBUG_MODE: { type: "boolean", default: false },
})

// Now use the type-safe variables
console.log(`Server starting on port ${env.PORT}`)
```

## Advanced Configuration

### Full Configuration Example

```typescript
const env = checkEnv({
    // Required string - will throw error if missing
    API_KEY: {
        type: "string",
        required: true,
    },

    // Optional number with default value
    PORT: {
        type: "number",
        default: 3000,
    },

    // Optional boolean with default
    DEBUG_MODE: {
        type: "boolean",
        default: false,
    },

    // Required number
    MAX_CONNECTIONS: {
        type: "number",
        required: true,
    },

    // Optional string with default
    LOG_LEVEL: {
        type: "string",
        default: "info",
    },
})
```

### Runtime Options

EnvGuard's behavior can be customized at runtime to fit your application's needs:

```typescript
// Throw errors immediately on validation failure
const env = checkEnv(config, process.env, { throwOnError: true })
```

#### The `throwOnError` Option Explained

By default, EnvGuard logs validation errors to the console but doesn't throw JavaScript exceptions. This means your application will continue running even with invalid configuration, which can be useful during development but risky in production.

When you set `throwOnError: true`, EnvGuard will:

1. Validate your environment variables as usual
2. Log validation errors to the console
3. **Throw a JavaScript Error if any validation failures occur**

This enables several important patterns:

```typescript
// Example 1: Fail-fast application startup
try {
    const env = checkEnv(
        {
            DATABASE_URL: { type: "string", required: true },
            API_SECRET: { type: "string", required: true },
        },
        process.env,
        { throwOnError: true }
    )

    // This code only runs if ALL environment variables are valid
    startApplication(env)
} catch (error) {
    console.error("Application startup failed: Invalid configuration")
    process.exit(1) // Exit with error code
}

// Example 2: Different behavior for development vs production
const isDevelopment = process.env.NODE_ENV === "development"

const env = checkEnv(
    {
        DATABASE_URL: { type: "string", required: true },
        API_SECRET: { type: "string", required: true },
    },
    process.env,
    {
        // Only throw errors in production
        throwOnError: !isDevelopment,
    }
)

// Example 3: Custom error handling
try {
    const env = checkEnv(config, process.env, { throwOnError: true })
    startServer(env)
} catch (error) {
    // Send alert to monitoring system
    alertMonitoringSystem("Configuration error detected", error)

    // Log detailed diagnostics
    logger.error("Failed to start due to configuration error", {
        error,
        environmentName: process.env.NODE_ENV,
    })

    // Exit with specific error code for configuration issues
    process.exit(78)
}
```

This option gives you fine-grained control over how your application responds to environment configuration problems.

## Type Conversion

EnvGuard automatically converts values to the correct type:

-   **string**: Used as-is
-   **number**: Converted with `Number()` and validated
-   **boolean**: Supports various formats:
    -   `true`, `1`, `yes`, `y` → `true`
    -   `false`, `0`, `no`, `n` → `false`

## CLI Usage

When running from the command line:

```bash
# Check using default .env file
npx envguard

# Check using a specific .env file
npx envguard .env.production
```

## License

MIT
