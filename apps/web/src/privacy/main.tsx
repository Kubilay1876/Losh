import '@losh/viewer/theme.css';
import '../home/home.css';
import { render } from 'preact';
import { createLocalStore } from '@losh/viewer/settings';
import { registerServiceWorker } from '../registerServiceWorker';
import { Privacy } from './Privacy';

render(<Privacy store={createLocalStore()} />, document.getElementById('privacy')!);
registerServiceWorker('../sw.js', '../');
