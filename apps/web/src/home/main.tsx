import './home.css';
import { render } from 'preact';
import { createLocalStore } from '@losh/viewer/settings';
import { Home } from './Home';

render(<Home store={createLocalStore()} />, document.getElementById('home')!);
