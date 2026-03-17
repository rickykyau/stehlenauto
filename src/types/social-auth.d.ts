/* Google Identity Services */
interface GoogleAccountsId {
  initialize(config: { client_id: string; callback: (response: { credential: string }) => void }): void;
  prompt(momentListener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void): void;
}

interface Window {
  google?: {
    accounts: {
      id: GoogleAccountsId;
    };
  };
  FB?: {
    init(params: { appId: string; cookie: boolean; xfbml: boolean; version: string }): void;
    login(callback: (response: { authResponse: unknown }) => void, params: { scope: string }): void;
    api(path: string, params: { fields: string }, callback: (user: { email?: string; first_name?: string; last_name?: string }) => void): void;
  };
  fbAsyncInit?: () => void;
}
