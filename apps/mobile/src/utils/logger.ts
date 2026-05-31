import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@dev/verbose_log";

type ConsoleFn = (...args: unknown[]) => void;

let originals: {
  log: ConsoleFn;
  warn: ConsoleFn;
  error: ConsoleFn;
  info: ConsoleFn;
} | null = null;

function serialize(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === "object" && a !== null) {
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      }
      return String(a);
    })
    .join(" ");
}

function append(level: string, args: unknown[]): void {
  const line = `[${new Date().toISOString()}] [${level}] ${serialize(args)}\n`;
  AsyncStorage.getItem(STORAGE_KEY)
    .then((existing) => AsyncStorage.setItem(STORAGE_KEY, (existing ?? "") + line))
    .catch(() => {});
}

export function install(): void {
  if (originals) return;

  originals = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    info: console.info.bind(console),
  };

  const header = `=== Session ${new Date().toISOString()} ===\n`;
  AsyncStorage.getItem(STORAGE_KEY)
    .then((existing) => AsyncStorage.setItem(STORAGE_KEY, (existing ?? "") + header))
    .catch(() => {});

  console.log = (...args: unknown[]) => { originals!.log(...args); append("LOG", args); };
  console.warn = (...args: unknown[]) => { originals!.warn(...args); append("WARN", args); };
  console.error = (...args: unknown[]) => { originals!.error(...args); append("ERROR", args); };
  console.info = (...args: unknown[]) => { originals!.info(...args); append("INFO", args); };
}

export function uninstall(): void {
  if (!originals) return;
  console.log = originals.log;
  console.warn = originals.warn;
  console.error = originals.error;
  console.info = originals.info;
  originals = null;
}

/** Returns the AsyncStorage key where logs are stored. */
export function getLogStorageKey(): string {
  return STORAGE_KEY;
}

/** Reads all buffered log lines. */
export async function readLogs(): Promise<string> {
  return (await AsyncStorage.getItem(STORAGE_KEY)) ?? "";
}

/** Clears the log buffer. */
export async function clearLogs(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
