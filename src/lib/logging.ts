export class Logging {
  static info = (msg: any, ...more: any[]) => {
    console.info(this._timestamp(), msg, ...more);
  };

  static error = (msg: any, ...more: any[]) => {
    Logging.error(this._timestamp(), msg, ...more);
  };

  static warn = (msg: any, ...more: any[]) => {
    console.warn(this._timestamp(), msg, ...more);
  };
  private static _timestamp = () => {
    return new Date().toLocaleTimeString();
  };
}
