'use strict';

import { UserAccountPage } from './account.js';

var domNodeUserAccountPage = document.getElementById('user-account-page');
var rootUserAccountPage = ReactDOM.createRoot(domNodeUserAccountPage);
rootUserAccountPage.render(React.createElement(UserAccountPage, null));