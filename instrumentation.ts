export async function register() {
  if (process.env.NODE_ENV === 'development') {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      const msg = String(args[0] ?? '');
      if (msg.includes('getSession') && msg.includes('getUser') && msg.includes('insecure')) {
        return;
      }
      originalWarn.apply(console, args);
    };
  }
}
