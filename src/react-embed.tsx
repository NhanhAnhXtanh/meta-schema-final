import { createRoot, Root } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import type { BridgeMsg } from "./bridge/bridge-core";

export type MountedMetaSchemaApp = {
  update: (state: any) => void;
  unmount: () => void;
  post: (msg: BridgeMsg) => void;
};

export function mountMetaSchemaApp(
  host: HTMLElement,
  initialState: any,
  postCallback: (msg: BridgeMsg) => void
): MountedMetaSchemaApp {
  let root: Root | null = null;

  const post = (msg: BridgeMsg) => {
    postCallback(msg);
  };

  const update = (_state: any) => {
    if (!root) {
      root = createRoot(host);
    }
    root.render(
      <Provider store={store}>
        <App post={post} />
      </Provider>
    );
  };

  const unmount = () => {
    if (root) {
      root.unmount();
      root = null;
    }
  };

  // Initial render
  update(initialState);

  return { update, unmount, post };
}
