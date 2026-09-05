import { createBrowserAuthStorage } from './browserStorage';

export default createBrowserAuthStorage(() =>
  typeof window === 'undefined' ? null : window.localStorage,
);
