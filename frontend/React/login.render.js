'use strict';

import { LoginPage } from './login.js';

var domNodeLoginPage = document.getElementById('login-page');
var rootLoginPage = ReactDOM.createRoot(domNodeLoginPage);
rootLoginPage.render(React.createElement(LoginPage, null));