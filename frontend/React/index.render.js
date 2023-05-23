'use strict';

import { HomePage } from './index.js';

var domNodeHomePage = document.getElementById('home-page');
var rootHomePage = ReactDOM.createRoot(domNodeHomePage);
rootHomePage.render(React.createElement(HomePage, null));