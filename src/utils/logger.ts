import { isDebugEnabled } from '../config'

export const getLogger = () => {
  if (isDebugEnabled()) {
    return console
  }

  return {
    log: () => {},
    error: () => {},
    warn: () => {},
    info: () => {},
    debug: () => {},
    group: () => {},
    groupEnd: () => {},
    table: () => {}
  }
}
