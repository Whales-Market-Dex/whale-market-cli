import axios from 'axios';
import ora from 'ora';

const LZ_SCAN_API = 'https://scan.layerzero-api.com/v1';

export function lzScanUrl(txHash: string): string {
  return `https://layerzeroscan.com/tx/${txHash}`;
}

/** Fetch the current LayerZero delivery status for a bridge tx. */
export async function getLzStatus(txHash: string): Promise<string> {
  const res = await axios.get(`${LZ_SCAN_API}/messages/tx/${txHash}`);
  const messages: any[] = res.data?.data ?? [];
  return messages[0]?.status ?? 'UNKNOWN';
}

/**
 * Block until LayerZero delivers the message or timeout.
 * Shows a spinner with current status. Prints the LayerZero scan URL.
 * Throws on timeout with a hint to use `whales bridge status <txHash>`.
 */
export async function waitForLayerZeroDelivery(
  txHash: string,
  opts: { timeoutMs?: number } = {}
): Promise<void> {
  const timeoutMs = opts.timeoutMs ?? 20 * 60 * 1000;
  const pollMs = 4_000;
  const deadline = Date.now() + timeoutMs;

  console.log(`  LayerZero: ${lzScanUrl(txHash)}`);
  console.log('  Press Ctrl+C to stop waiting (bridge will continue on-chain)\n');

  const spinner = ora('LayerZero: checking...').start();

  while (Date.now() < deadline) {
    let status: string;
    try {
      status = await getLzStatus(txHash);
    } catch {
      status = 'UNKNOWN';
    }

    if (status === 'DELIVERED') {
      spinner.succeed('LayerZero: DELIVERED');
      return;
    }

    spinner.text = `LayerZero: ${status}...`;
    await new Promise(r => setTimeout(r, pollMs));
  }

  spinner.fail('LayerZero: timed out waiting for delivery');
  throw new Error(
    `Bridge not confirmed after ${timeoutMs / 60_000} minutes. ` +
    `Check status: whales bridge status ${txHash}`
  );
}
