'use strict';

import {HomePage} from './index.js';

const domNodeHomePage = document.getElementById('home-page');
const rootHomePage = ReactDOM.createRoot(domNodeHomePage);
rootHomePage.render(<HomePage />);
