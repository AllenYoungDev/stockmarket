'use strict';

import {EmailAddressVerificationNoticePage} from './EmailAddressVerificationNotice.js';

const domNodeEmailAddressVerificationNoticePage = document.getElementById('email-address-verification-notice-page');
const rootEmailAddressVerificationNoticePage = ReactDOM.createRoot(domNodeEmailAddressVerificationNoticePage);
rootEmailAddressVerificationNoticePage.render(<EmailAddressVerificationNoticePage />);
