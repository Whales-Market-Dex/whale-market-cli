// Plain text formatter - simple, unformatted output

export function printPlain(data: any): void {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log('No data');
      return;
    }
    
    // If it's an array of objects with similar structure, try to format as table
    if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      printPlainTable(data);
    } else {
      data.forEach((item, index) => {
        if (index > 0) console.log('');
        printPlainItem(item);
      });
    }
  } else {
    printPlainItem(data);
  }
}

function printPlainTable(items: any[]): void {
  if (items.length === 0) return;
  
  // Get all unique keys from all items
  const allKeys = new Set<string>();
  items.forEach(item => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach(key => allKeys.add(key));
    }
  });
  
  const keys = Array.from(allKeys);
  if (keys.length === 0) return;
  
  // Calculate column widths
  const widths = keys.map(key => {
    const maxWidth = Math.max(
      key.length,
      ...items.map(item => {
        const value = item[key];
        return value !== null && value !== undefined ? String(value).length : 0;
      })
    );
    return Math.min(maxWidth, 50); // Cap at 50 chars
  });
  
  // Print header
  const headerRow = keys.map((key, i) => key.padEnd(widths[i])).join('  ');
  console.log(headerRow);
  console.log('-'.repeat(headerRow.length));
  
  // Print rows
  items.forEach(item => {
    const row = keys.map((key, i) => {
      const value = item[key];
      const str = value !== null && value !== undefined ? String(value) : '-';
      return truncatePlain(str, widths[i]).padEnd(widths[i]);
    }).join('  ');
    console.log(row);
  });
}

function truncatePlain(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + '...';
}

function printPlainItem(item: any): void {
  if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
    console.log(String(item));
    return;
  }
  
  if (item === null || item === undefined) {
    console.log('');
    return;
  }
  
  // For objects, print key-value pairs
  if (typeof item === 'object') {
    Object.entries(item).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          console.log(`${key}:`);
          printPlainItem(value);
        } else if (Array.isArray(value)) {
          console.log(`${key}:`);
          value.forEach((v, i) => {
            console.log(`  [${i}]: ${formatValue(v)}`);
          });
        } else {
          console.log(`${key}: ${formatValue(value)}`);
        }
      }
    });
  }
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === 'object') return '[object]';
  return String(value);
}

// Plain table formatter - simple tab-separated or space-aligned (for explicit headers/rows)
export function printPlainTableWithHeaders(headers: string[], rows: string[][]): void {
  // Calculate column widths
  const widths = headers.map((header, i) => {
    const maxWidth = Math.max(
      header.length,
      ...rows.map(row => (row[i] || '').toString().length)
    );
    return maxWidth;
  });
  
  // Print header
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join('  ');
  console.log(headerRow);
  console.log('-'.repeat(headerRow.length));
  
  // Print rows
  rows.forEach(row => {
    const rowStr = headers.map((_, i) => (row[i] || '').toString().padEnd(widths[i])).join('  ');
    console.log(rowStr);
  });
}
