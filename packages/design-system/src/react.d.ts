import type { DesignEngine, DesignProfile, HeaderOptions } from './index.js';
/** The injected React module is intentionally typed structurally to avoid requiring @types/react in vanilla consumers. */
export function createReactBindings(React: {
  createElement: Function;
  useState: Function;
  useEffect: Function;
  useRef: Function;
}): {
  useDesign(engine: DesignEngine): DesignProfile;
  Header(props: Omit<HeaderOptions, 'container'>): any;
};
