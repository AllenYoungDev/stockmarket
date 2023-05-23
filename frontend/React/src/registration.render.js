'use strict';

import {UserRegistrationPage} from './registration.js';

const domNodeUserRegistrationPage = document.getElementById('user-registration-page');
const rootUserRegistrationPage = ReactDOM.createRoot(domNodeUserRegistrationPage);
rootUserRegistrationPage.render(<UserRegistrationPage />);
