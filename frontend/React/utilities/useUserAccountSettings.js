'use strict';

import {fetchUserAccountSettings} from './fetchUserAccountSettings.js';

export function useUserAccountSettings() {
    const [userAccountSettings, setUserAccountSettings] = React.useState(null);

    React.useEffect(() => {
        let ignore = false;
        setUserAccountSettings(null);
    
        fetchUserAccountSettings(setUserAccountSettings, ignore);
    
        return () => {
          ignore = true;
        }
      }, [setUserAccountSettings]);

    return userAccountSettings;
}
