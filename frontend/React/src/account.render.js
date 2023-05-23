'use strict';

import { UserAccountPage } from './account.js';

const domNodeUserAccountPage = document.getElementById('user-account-page');
const rootUserAccountPage = ReactDOM.createRoot(domNodeUserAccountPage);
rootUserAccountPage.render(<UserAccountPage />);
