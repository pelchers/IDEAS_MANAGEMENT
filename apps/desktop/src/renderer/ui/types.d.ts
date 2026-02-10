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
    };
  }
}
