'use strict';

import { PasswordResetPage } from './PasswordReset.js';

var domNodePasswordResetPage = document.getElementById('password-reset-page');
var rootPasswordResetPage = ReactDOM.createRoot(domNodePasswordResetPage);
rootPasswordResetPage.render(React.createElement(PasswordResetPage, null));