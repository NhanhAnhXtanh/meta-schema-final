/// <reference types="vite/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App'
import { store } from './store'
import './index.css'
import type { BridgeMsg } from './bridge/bridge-core'
import { loadSchema } from './utils/schemaLoader'
import { sampleSchemas } from './data/sampleSchemas'
import { setNodes, setEdges } from './store/slices/schemaSlice'

const isDev = import.meta.env.DEV;

// For standalone mode (development)
const defaultPost = (_msg: BridgeMsg) => {
  if (isDev) {
    // Debugging log if needed
    console.log('[MetaSchema] Bridge message:', _msg);
  }
};

// Load sample schema on startup (Development only)
if (isDev) {
  const initialSchema = sampleSchemas.simple;
  const { nodes, edges } = loadSchema(initialSchema);
  store.dispatch(setNodes(nodes));
  store.dispatch(setEdges(edges));

  // Expose loadSchema to window for testing
  (window as any).loadSchema = (type: keyof typeof sampleSchemas) => {
    const schema = sampleSchemas[type];
    if (schema) {
      const { nodes: newNodes, edges: newEdges } = loadSchema(schema);
      store.dispatch(setNodes(newNodes));
      store.dispatch(setEdges(newEdges));
      console.log(`[MetaSchema] Loaded schema: ${type}`);
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App post={defaultPost} />
    </Provider>
  </React.StrictMode>,
)
