import { FlowCanvas } from '@/components/designer/canvas/FlowCanvas';
import { SchemaDialogs } from '@/components/SchemaDialogs';
import type { BridgeMsg } from '@/bridge/bridge-core';
import { PostContext } from '@/contexts/PostContext';

export type AppProps = {
  post: (msg: BridgeMsg) => void;
};

function App({ post }: AppProps) {
  return (
    <PostContext.Provider value={post}>
      <div className="flex h-screen w-screen bg-gray-50 text-gray-900 overflow-hidden">
        <div className="flex-1 flex flex-col relative h-full">
          <div className="flex-1 h-full">
            <FlowCanvas post={post} />
          </div>
        </div>

        <SchemaDialogs />
      </div>
    </PostContext.Provider>
  );
}

export default App;
