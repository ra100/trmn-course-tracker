import { isDebugEnabled } from '../config'

export const logger = isDebugEnabled()
  ? console
  : {
      log: () => {},
      error: () => {},
      warn: () => {},
      info: () => {},
      debug: () => {},
      group: () => {},
      groupEnd: () => {},
      table: () => {}
    }
