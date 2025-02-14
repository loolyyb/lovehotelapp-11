
import { StatusBar } from '@capacitor/status-bar';

export const useStatusBar = () => {
  const setStatusBarColor = async () => {
    try {
      await StatusBar.setBackgroundColor({ color: '#561435' });
    } catch (error) {
      console.log('Status bar color setting failed - probably not on mobile', error);
    }
  };

  return { setStatusBarColor };
};
