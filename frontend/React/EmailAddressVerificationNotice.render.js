'use strict';

import { EmailAddressVerificationNoticePage } from './EmailAddressVerificationNotice.js';

var domNodeEmailAddressVerificationNoticePage = document.getElementById('email-address-verification-notice-page');
var rootEmailAddressVerificationNoticePage = ReactDOM.createRoot(domNodeEmailAddressVerificationNoticePage);
rootEmailAddressVerificationNoticePage.render(React.createElement(EmailAddressVerificationNoticePage, null));