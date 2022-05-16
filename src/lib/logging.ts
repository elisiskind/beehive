import { executionContext } from "./utils";

enum Loglevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
}

export class Logging {
  private static _logLevel = Loglevel.NONE;

  static debug = (msg: any, ...more: any[]) => {
    if (Logging._logLevel >= 4) {
      console.debug(this._timestamp(), msg, ...more);
    }
  };

  static info = (msg: any, ...more: any[]) => {
    if (Logging._logLevel >= 3) {
      console.info(this._timestamp(), msg, ...more);
    }
  };

  static warn = (msg: any, ...more: any[]) => {
    if (Logging._logLevel >= 2) {
      console.warn(this._timestamp(), msg, ...more);
    }
  };

  static error = (msg: any, ...more: any[]) => {
    if (Logging._logLevel >= 1) {
      console.error(this._timestamp(), msg, ...more);
    }
  };
  private static _timestamp = () => {
    const now = new Date();
    const [time, ampm] = now.toLocaleTimeString().split(" ");
    return (
      time +
      "." +
      now.getMilliseconds() +
      " " +
      ampm +
      " [" +
      executionContext() +
      "]: "
    );
  };
}
