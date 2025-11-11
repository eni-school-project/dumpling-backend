import { ConnectionCredentials, StorageValue } from "./types";

function useParseConnectionCredentials(value: StorageValue): ConnectionCredentials {
  if (!value || typeof value !== 'object') {
    return;
  }

  const obj = value as Record<string, unknown>;

  if (
    typeof obj.connectionType !== 'string' ||
    typeof obj.host !== 'string' ||
    typeof obj.user !== 'string' ||
    typeof obj.password !== 'string' ||
    (obj.port !== undefined && typeof obj.port !== 'number') ||
    (obj.database !== undefined && typeof obj.database !== 'string')
  ) {
    return;
  }

  return obj as ConnectionCredentials;
}

export { useParseConnectionCredentials };