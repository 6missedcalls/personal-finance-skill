import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

export interface PlaidConfig {
  readonly clientId: string
  readonly secret: string
  readonly env: 'sandbox' | 'development' | 'production'
  readonly webhookUrl?: string
  readonly clientName: string
  readonly countryCodes: readonly string[]
}

function resolveEnvVar(envVarName: string, label: string): string {
  const value = process.env[envVarName]
  if (!value) {
    throw new Error(
      `Missing environment variable "${envVarName}" for ${label}. ` +
      `Set it or update the plaidClientIdEnv/plaidSecretEnv config.`
    )
  }
  return value
}

function resolveBasePath(env: PlaidConfig['env']): string {
  const paths: Record<PlaidConfig['env'], string> = {
    sandbox: PlaidEnvironments.sandbox,
    development: PlaidEnvironments.development,
    production: PlaidEnvironments.production,
  }
  return paths[env]
}

export function buildPlaidConfig(pluginConfig: Record<string, unknown>): PlaidConfig {
  const clientIdEnv = (pluginConfig.plaidClientIdEnv as string) ?? 'PLAID_CLIENT_ID'
  const secretEnv = (pluginConfig.plaidSecretEnv as string) ?? 'PLAID_SECRET'

  return {
    clientId: resolveEnvVar(clientIdEnv, 'Plaid Client ID'),
    secret: resolveEnvVar(secretEnv, 'Plaid Secret'),
    env: (pluginConfig.plaidEnv as PlaidConfig['env']) ?? 'sandbox',
    webhookUrl: pluginConfig.webhookUrl as string | undefined,
    clientName: (pluginConfig.clientName as string) ?? 'OpenClaw Finance',
    countryCodes: (pluginConfig.countryCodes as string[]) ?? ['US'],
  }
}

export function createPlaidClient(config: PlaidConfig): PlaidApi {
  const configuration = new Configuration({
    basePath: resolveBasePath(config.env),
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': config.clientId,
        'PLAID-SECRET': config.secret,
      },
    },
  })

  return new PlaidApi(configuration)
}
