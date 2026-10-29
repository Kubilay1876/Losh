import '@losh/viewer/theme.css';
import '../home/home.css';
import { createLocalStore } from '@losh/viewer/settings';
import { wake } from '../prerendered';
import { NotFound } from './NotFound';

// No service worker from here: this page shows up under any wrong address, outside the paths Losh owns.
wake('notfound', createLocalStore(), (store, initial) => <NotFound store={store} initial={initial} />);
