'use strict';

import {AdminAccountPage} from './admin.js';

const domNodeAdminAccountPage = document.getElementById('admin-account-page');
const rootAdminAccountPage = ReactDOM.createRoot(domNodeAdminAccountPage);
rootAdminAccountPage.render(<AdminAccountPage />);
