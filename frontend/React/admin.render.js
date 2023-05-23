'use strict';

import { AdminAccountPage } from './admin.js';

var domNodeAdminAccountPage = document.getElementById('admin-account-page');
var rootAdminAccountPage = ReactDOM.createRoot(domNodeAdminAccountPage);
rootAdminAccountPage.render(React.createElement(AdminAccountPage, null));