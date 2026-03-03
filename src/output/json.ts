export function printJson(data: any): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printError(error: string): void {
  console.log(JSON.stringify({ error }, null, 2));
  process.exit(1);
}
