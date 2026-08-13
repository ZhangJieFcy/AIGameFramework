import { bootstrap } from "./framework";
import { MyGame } from "./game/MyGame";

void bootstrap(new MyGame()).catch((err) => {
  // 启动失败（如 WebGL 不可用）时给控制台明确错误，而不是静默的 unhandled rejection
  console.error("[AIGame] 启动失败", err);
});
