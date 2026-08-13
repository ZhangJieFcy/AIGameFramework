/**
 * 抖音小游戏桥接适配器（aigame-framework）
 *
 * 提供 three.js 需要的最小 window/document/canvas 环境，并补齐：
 * - fetch：读本地包内 JSON（config/manifest/关卡表），读不到再走网络 tt.request
 * - Image：tt.createImage 桥接，让 three 的 TextureLoader 能加载贴图
 * - 触摸 → 指针事件：游戏代码统一用 pointerdown/up/move，不用写 tt 专用逻辑
 * - mount 事件转发：InputManager 挂在 mount 上的监听器也能收到 window 事件
 *
 * 已知限制（真机/开发者工具验证项）：
 * - DOM 版 UI（UIManager）在小游戏端是无渲染占位，真机界面需后续 canvas 化
 * - 广告、分享等业务能力在 IPlatform 层是占位实现
 */
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
    // 只有真正的 canvas 值得记录；DOM UI 的占位节点不覆盖 __AIGAME_CANVAS__
    if (node === canvas) rootGlobal.__AIGAME_CANVAS__ = node;
  },
  getBoundingClientRect() {
    return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight };
  },
  // InputManager 把 pointerdown 挂在 mount 上：转发到 window，由触摸桥接触发
  addEventListener(name, cb) {
    gameWindow.addEventListener(name, cb);
  },
  removeEventListener(name, cb) {
    gameWindow.removeEventListener(name, cb);
  }
};

const stubElement = () => ({
  style: {},
  appendChild() {},
  removeChild() {},
  addEventListener() {},
  removeEventListener() {}
});

const createImage = ttGlobal && ttGlobal.createImage ? () => ttGlobal.createImage() : null;

const gameDocument = {
  hidden: false,
  body: mountNode,
  createElement(tag) {
    if (tag === "canvas" && canvas) return canvas;
    if (tag === "img" && createImage) return createImage();
    return stubElement();
  },
  createElementNS(_ns, tag) {
    if (tag === "canvas" && canvas) return canvas;
    if (tag === "img" && createImage) return createImage();
    return stubElement();
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

// fetch：优先读本地包内文件（同步，JSON 配置等），读不到再走网络 tt.request
const fileSystem = ttGlobal && ttGlobal.getFileSystemManager ? ttGlobal.getFileSystemManager() : null;
rootGlobal.fetch = function fetch(url) {
  const clean = String(url).replace(/^\.\//, "").replace(/^\//, "");
  return new Promise((resolve, reject) => {
    if (fileSystem && fileSystem.readFileSync) {
      try {
        const text = fileSystem.readFileSync(clean, "utf8");
        resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(JSON.parse(text))
        });
        return;
      } catch (e) {
        // 本地没有这个文件，落到网络请求
      }
    }
    if (ttGlobal && ttGlobal.request) {
      ttGlobal.request({
        url: String(url),
        method: "GET",
        success(res) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(res.data)
          });
        },
        fail(err) {
          reject(err);
        }
      });
    } else {
      reject(new Error("[aigame-adapter][tt] fetch 不可用: " + url));
    }
  });
};

// 触摸 → 指针事件：three 游戏代码统一用 pointerdown/up/move
function dispatchPointer(type, touch) {
  if (!touch) return;
  gameWindow.dispatchEvent({
    type,
    clientX: touch.clientX,
    clientY: touch.clientY,
    pointerId: touch.identifier || 0,
    isPrimary: true,
    target: canvas,
    preventDefault() {}
  });
}

if (canvas && canvas.addEventListener) {
  canvas.addEventListener("touchstart", (e) => {
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    dispatchPointer("pointerdown", t);
  });
  canvas.addEventListener("touchmove", (e) => {
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    dispatchPointer("pointermove", t);
  });
  canvas.addEventListener("touchend", (e) => {
    const t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
    dispatchPointer("pointerup", t);
  });
  canvas.addEventListener("touchcancel", (e) => {
    const t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
    dispatchPointer("pointercancel", t);
  });
}

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
rootGlobal.HTMLElement = rootGlobal.HTMLElement || function HTMLElement() {};
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
