/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: photography.jsx | Description: React reference using the same live engine and common header. */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createReactBindings } from './runtime/src/react.js';
const { useDesign, Header } = createReactBindings(React);

export function mountPhotography({ engine, copy, container, headerContainer }) {
  const root = createRoot(container), headerRoot = createRoot(headerContainer);
  function Photography() {
    const profile = useDesign(engine);
    const [feedback, setFeedback] = React.useState('');
    return <div className="photography-reference" data-profile-revision={profile.revision}>
      <div className="photo-art" aria-hidden="true"><div className="photo-sun"/><div className="photo-hill"/><span>J / A</span></div>
      <div className="consumer-copy">
        <p className="eyebrow" data-polaris-role="label">{copy.text('showcase.labelSample')}</p>
        <h2 data-polaris-role="serif_heading">{copy.text('showcase.photoHeading')}</h2>
        <p data-polaris-role="sans_body">{copy.text('showcase.photoBody')}</p>
        <p className="editorial-copy" data-polaris-role="serif_body">{copy.text('showcase.photoEditorial')}</p>
        <div className="consumer-actions">{['primary', 'secondary'].map(kind => <button key={kind} className={`polaris-button polaris-button-${kind}`} onClick={() => setFeedback(copy.text('header.actionFeedback', { action: copy.text(`showcase.${kind}Action`) }))}>{copy.text(`showcase.${kind}Action`)}</button>)}</div>
        <p className="signature" data-polaris-role="script">{copy.text('showcase.photoSignature')}</p>
        <p className="consumer-id" data-polaris-role="mono">{copy.text('showcase.photoContract')}</p>
        <p role="status">{feedback}</p>
      </div>
    </div>;
  }
  root.render(<Photography />);
  return { setHeader: props => headerRoot.render(<Header {...props} />), dispose() { root.unmount(); headerRoot.unmount(); } };
}
