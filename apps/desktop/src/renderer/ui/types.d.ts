export {};

declare global {
  interface Window {
    ideaApi: {
      selectDirectory: () => Promise<string | null>;
      listDirectory: (dirPath: string) => Promise<
        { name: string; path: string; isDir: boolean }[]
      >;
      appendSyncOp: (
        projectRoot: string,
        op: Record<string, unknown>
      ) => Promise<{ ok: true; queuePath: string }>;

      auth: {
        storeTokens: (args: {
          sessionToken: string;
          refreshToken: string;
          apiBaseUrl: string;
        }) => Promise<{ ok: true }>;
        validateSession: () => Promise<{
          valid: boolean;
          user?: { id: string; email: string; role: string; emailVerified: boolean };
        }>;
        logout: (args?: { allDevices?: boolean }) => Promise<{ ok: true }>;
        hasStoredTokens: () => Promise<{ hasTokens: boolean }>;
      };
    };
  }
}
