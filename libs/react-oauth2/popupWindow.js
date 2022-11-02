import { toQuery, toParams } from "./helpers";

class PopupWindow {
  constructor(id, url, options = {}) {
    this.id = id;
    this.url = url;
    this.options = options;
  }

  open() {
    const {
      url,
      id,
      options: { withHash, ...options },
    } = this;

    this.window = window.open("about:blank", id, toQuery(options, ","));
    if (this.window) {
      this.window.location.href = url;
    }
  }

  close() {
    this.cancel();
    this.window?.close();
  }

  poll() {
    this.promise = new Promise((resolve, reject) => {
      this.interval = window.setInterval(() => {
        try {
          const popup = this.window;

          if (!popup || popup.closed !== false) {
            this.close();

            reject(new Error("The popup was closed"));

            return;
          }

          if (popup.location.pathname === "blank") {
            return;
          }

          const { search, hash } = popup.location;
          const params = toParams(
            (this.options.withHash ? hash : search).replace(this.options.withHash ? /^#/ : /^\?/, "")
          );
          resolve(params);

          this.close();
        } catch (error) {
          /*
           * Ignore DOMException: Blocked a frame with origin from accessing a
           * cross-origin frame.
           */
        }
      }, 1000);
    });
  }

  cancel() {
    if (this.interval) {
      window.clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  static open(id, url, options = {}) {
    const popup = new this(id, url, options);

    popup.open();
    popup.poll();

    return popup.promise;
  }
}

export default PopupWindow;
