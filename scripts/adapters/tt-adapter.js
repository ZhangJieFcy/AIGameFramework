const ttGlobal = typeof tt !== "undefined" ? tt : null;
const rootGlobal = typeof GameGlobal !== "undefined" ? GameGlobal : globalThis;
const sysInfo =
  ttGlobal && ttGlobal.getSystemInfoSync
    ? ttGlobal.getSystemInfoSync()
    : { windowWidth: 720, windowHeight: 1280, pixelRatio: 1 };
const canvas = ttGlobal && ttGlobal.createCanvas ? ttGlobal.createCanvas() : null;

if (!canvas) {
  console.warn("[aigame-adapter][tt] createCanvas 不可用，Three.js 可能无法初始化");
}

if (canvas) {
  canvas.width = Math.floor((sysInfo.windowWidth || 720) * (sysInfo.pixelRatio || 1));
  canvas.height = Math.floor((sysInfo.windowHeight || 1280) * (sysInfo.pixelRatio || 1));
  canvas.style = canvas.style || {};
}

const eventMap = {};
const gameWindow = {
  innerWidth: sysInfo.windowWidth || 720,
  innerHeight: sysInfo.windowHeight || 1280,
  devicePixelRatio: sysInfo.pixelRatio || 1,
  addEventListener(name, cb) {
    const list = eventMap[name] || [];
    list.push(cb);
    eventMap[name] = list;
  },
  removeEventListener(name, cb) {
    const list = eventMap[name] || [];
    eventMap[name] = list.filter((fn) => fn !== cb);
  },
  dispatchEvent(evt) {
    const list = eventMap[evt.type] || [];
    for (const fn of list) fn(evt);
  },
  requestAnimationFrame(cb) {
    return setTimeout(() => cb(Date.now()), 16);
  },
  cancelAnimationFrame(id) {
    clearTimeout(id);
  }
};

const mountNode = {
  style: {},
  clientWidth: gameWindow.innerWidth,
  clientHeight: gameWindow.innerHeight,
  appendChild(node) {
    rootGlobal.__AIGAME_CANVAS__ = node;
  },
  getBoundingClientRect() {
    return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight };
  },
  addEventListener() {},
  removeEventListener() {}
};

const gameDocument = {
  hidden: false,
  body: mountNode,
  createElement(tag) {
    if (tag === "canvas" && canvas) return canvas;
    return { style: {}, appendChild() {}, addEventListener() {}, removeEventListener() {} };
  },
  createElementNS(_ns, tag) {
    if (tag === "canvas" && canvas) return canvas;
    return this.createElement(tag);
  },
  getElementById(id) {
    if (id === "app") return mountNode;
    return null;
  },
  addEventListener(name, cb) {
    gameWindow.addEventListener(name, cb);
  },
  removeEventListener(name, cb) {
    gameWindow.removeEventListener(name, cb);
  }
};

const storageBridge = {
  getItem(key) {
    if (!ttGlobal || !ttGlobal.getStorageSync) return null;
    const value = ttGlobal.getStorageSync(key);
    return value === "" ? null : String(value);
  },
  setItem(key, value) {
    if (!ttGlobal || !ttGlobal.setStorageSync) return;
    ttGlobal.setStorageSync(key, String(value));
  }
};

if (typeof globalThis !== "undefined") {
  globalThis.__AIGAME_STORAGE__ = storageBridge;
  globalThis.__AIGAME_MOUNT__ = mountNode;
}

rootGlobal.window = rootGlobal.window || gameWindow;
rootGlobal.document = rootGlobal.document || gameDocument;
rootGlobal.self = rootGlobal.self || rootGlobal.window;
rootGlobal.navigator = rootGlobal.navigator || { userAgent: "douyin-minigame" };
rootGlobal.performance = rootGlobal.performance || { now: () => Date.now() };
rootGlobal.requestAnimationFrame = rootGlobal.requestAnimationFrame || gameWindow.requestAnimationFrame;
rootGlobal.cancelAnimationFrame = rootGlobal.cancelAnimationFrame || gameWindow.cancelAnimationFrame;
rootGlobal.HTMLCanvasElement = rootGlobal.HTMLCanvasElement || function HTMLCanvasElement() {};
rootGlobal.Event = rootGlobal.Event || function Event(type) { this.type = type; };
rootGlobal.__AIGAME_CANVAS__ = canvas;

if (ttGlobal && ttGlobal.onHide) {
  ttGlobal.onHide(() => {
    if (rootGlobal.window && rootGlobal.window.dispatchEvent) {
      rootGlobal.window.dispatchEvent(new rootGlobal.Event("app:pause"));
    }
  });
}

if (ttGlobal && ttGlobal.onShow) {
  ttGlobal.onShow(() => {
    if (rootGlobal.window && rootGlobal.window.dispatchEvent) {
      rootGlobal.window.dispatchEvent(new rootGlobal.Event("app:resume"));
    }
  });
}

console.info("[aigame-adapter][tt] runtime ready", {
  width: gameWindow.innerWidth,
  height: gameWindow.innerHeight,
  dpr: gameWindow.devicePixelRatio
});
