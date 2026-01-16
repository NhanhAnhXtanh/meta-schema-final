import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { eventReceived } from '@/bridge/jmixSlice';
import type { BridgeMsg } from '@/bridge/bridge-core';
import { FlowCanvas } from '@/components/designer/canvas/FlowCanvas';

export type AppProps = {
  bridgeState?: any;
  post: (msg: BridgeMsg) => void;
};

function App({ bridgeState, post }: AppProps) {
  const dispatch = useDispatch<AppDispatch>();
  const lastMsg = bridgeState?.__inbox as BridgeMsg | undefined;

  useEffect(() => {
    // Handshake với Jmix khi component mount
    post({ v: 1, kind: "event", type: "WIDGET_READY", payload: { widget: "meta-schema" } });
  }, [post]);

  useEffect(() => {
    if (!lastMsg) return;

    // Router ở React - convert BridgeMsg to EnvelopeV1 cho middleware
    if (lastMsg.kind !== "response" && lastMsg.type === "STATE_PATCH") {
      // state already handled by Lit/webcomponent
      return;
    }

    // Convert BridgeMsg to EnvelopeV1 for middleware compatibility
    if (lastMsg.kind === "event") {
      dispatch(
        eventReceived({
          v: 1,
          type: lastMsg.type,
          ts: Date.now(),
          payload: lastMsg.payload,
        })
      );
    } else if (lastMsg.kind === "response") {
      // Response messages không cần dispatch vào middleware
      // Chúng được xử lý trực tiếp bởi bridge request/response pattern
      return;
    }
  }, [lastMsg, dispatch]);

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900 overflow-hidden">
      <div className="flex-1 flex flex-col relative h-full">
        <div className="flex-1 h-full">
          <FlowCanvas post={post} />
        </div>
      </div>
    </div>
  );
}

export default App;
