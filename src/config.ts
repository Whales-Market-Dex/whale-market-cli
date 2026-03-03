import Conf from 'conf';

interface ConfigSchema {
  privateKey?: string;
  walletType?: 'solana' | 'evm';
  chainId?: number;
  apiUrl?: string;
  jwtToken?: string;
  jwtExpiresAt?: string;
}

export class Config {
  private store: Conf<ConfigSchema>;
  
  constructor() {
    this.store = new Conf<ConfigSchema>({
      projectName: 'whales-market-cli',
      defaults: {
        apiUrl: 'https://api.whales.market',
        chainId: 666666,
        walletType: 'solana'
      }
    });
  }
  
  // Get config with priority: CLI flag > env var > config file
  get(key: keyof ConfigSchema, cliValue?: string): string | number | undefined {
    if (cliValue) return cliValue;
    
    const envKey = `WHALES_${key.toUpperCase().replace(/([A-Z])/g, '_$1')}`;
    const envValue = process.env[envKey];
    if (envValue) {
      // Try to parse as number if it's a number field
      if (key === 'chainId') {
        return parseInt(envValue, 10);
      }
      return envValue;
    }
    
    return this.store.get(key);
  }
  
  set(key: keyof ConfigSchema, value: any): void {
    this.store.set(key, value);
  }
  
  getAll(): ConfigSchema {
    return this.store.store;
  }
  
  getPath(): string {
    return this.store.path;
  }
  
  clear(): void {
    this.store.clear();
  }
}

export const config = new Config();
