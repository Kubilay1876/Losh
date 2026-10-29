import '@losh/viewer/theme.css';
import './home.css';
import { createLocalStore } from '@losh/viewer/settings';
import { registerServiceWorker } from '../registerServiceWorker';
import { wake } from '../prerendered';
import { Home } from './Home';

wake('home', createLocalStore(), (store, initial) => <Home store={store} initial={initial} />);
registerServiceWorker('./sw.js', './');
