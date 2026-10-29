import '@losh/viewer/theme.css';
import '../home/home.css';
import { createLocalStore } from '@losh/viewer/settings';
import { registerServiceWorker } from '../registerServiceWorker';
import { wake } from '../prerendered';
import { Privacy } from './Privacy';

wake('privacy', createLocalStore(), (store, initial) => <Privacy store={store} initial={initial} />);
registerServiceWorker('../sw.js', '../');
