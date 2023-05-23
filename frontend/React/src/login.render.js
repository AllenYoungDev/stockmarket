'use strict';

import { LoginPage } from './login.js';

const domNodeLoginPage = document.getElementById('login-page');
const rootLoginPage = ReactDOM.createRoot(domNodeLoginPage);
rootLoginPage.render(<LoginPage />);
