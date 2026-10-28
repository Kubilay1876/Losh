import '@losh/viewer/theme.css';
import './home.css';
import { render } from 'preact';
import { createLocalStore } from '@losh/viewer/settings';
import { registerServiceWorker } from '../registerServiceWorker';
import { Home } from './Home';

render(<Home store={createLocalStore()} />, document.getElementById('home')!);
registerServiceWorker('./sw.js', './');
