'use strict';

import { UserRegistrationPage } from './registration.js';

var domNodeUserRegistrationPage = document.getElementById('user-registration-page');
var rootUserRegistrationPage = ReactDOM.createRoot(domNodeUserRegistrationPage);
rootUserRegistrationPage.render(React.createElement(UserRegistrationPage, null));