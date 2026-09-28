import { createDesignEngine, createContentEngine, mountHeader, type DesignProfile } from '../packages/design-system/src/index.js';
import { profiles } from '../packages/design-system/generated/profiles.js';
import { content } from '../packages/design-system/generated/content.js';
import { mountLabs } from '../packages/design-system/src/labs.js';
import { developerFonts } from '../packages/design-system/generated/developer-fonts.js';
const profile: DesignProfile = profiles.lyra;
const engine = createDesignEngine({ profile, mode: 'production', storage: null });
engine.setPersonal({ 'typography.scale': 1.2 });
mountLabs(engine, { container: document.body, fonts: developerFonts });
mountHeader({ container: document.body, brand: { label: 'Lyra' }, actions: [{ id: 'home', label: 'Home', kind: 'icon', side: 'left' }] });
const copy = createContentEngine(content);
copy.text('showcase.title');
// @ts-expect-error Generated copy keys are closed, so misspelled keys fail compilation.
copy.text('showcase.nonexistent');
// @ts-expect-error Profile roles accept only the agreed optional semantic roles.
profile.typography.roles.heading = {};
