export const CMD_EVENT = '__allow_copy_cmd';
export const DATA_ATTR = 'data-allow-copy';

export const MSG = {
  GET: 'allow-copy/get',
  SET: 'allow-copy/set',
} as const;

export type GetMessage = { type: typeof MSG.GET; tabId?: number };
export type SetMessage = {
  type: typeof MSG.SET;
  enabled: boolean;
  tabId?: number;
};
export type Message = GetMessage | SetMessage;
