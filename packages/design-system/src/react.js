/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: react.js | Description: Optional React bindings without a React dependency in the vanilla entry point. */
import { mountHeader } from './header.js';

/** Pass the app's React instance; create the engine before rendering the root. */
export function createReactBindings(React) {
  function useDesign(engine) {
    const [profile, setProfile] = React.useState(() => engine.profile);
    React.useEffect(() => { setProfile(engine.profile); return engine.subscribe(setProfile); }, [engine]);
    return profile;
  }
  function Header(props) {
    const ref = React.useRef(null);
    React.useEffect(() => { const header = mountHeader({ ...props, container: ref.current }); return () => header.dispose(); }, [props.brand, props.actions]);
    return React.createElement('div', { ref, className: 'polaris-header-host' });
  }
  return { useDesign, Header };
}
