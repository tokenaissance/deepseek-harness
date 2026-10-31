/** macOS platform authenticator (Touch ID) for Web Authentication in the shell. */
import { app } from 'electron'

/**
 * Keychain access group that holds WebAuthn credentials. The same value must be
 * listed under `keychain-access-groups` in `scripts/macos-entitlements.plist`,
 * because macOS binds the group to the signing team.
 */
export const WEBAUTHN_KEYCHAIN_ACCESS_GROUP = 'NAN929V4UM.com.deepseek.dsh.webauthn'

/**
 * macOS renders the Touch ID prompt as `"<App Name>" is trying to <promptReason>`;
 * `$1` is replaced with the relying party ID of the request.
 */
export const WEBAUTHN_TOUCH_ID_PROMPT_REASON = 'sign in to $1'

/**
 * Enable the Touch ID platform authenticator for `navigator.credentials`.
 *
 * Electron services platform-authenticator requests only after this call: until
 * then `isUserVerifyingPlatformAuthenticatorAvailable()` resolves to false and a
 * passkey sign-in page waits for a prompt that can never appear. Call it once the
 * app is ready: the Touch ID prompt text lives in a resource bundle that does not
 * exist earlier. The other platforms have no platform authenticator to configure.
 * @param target - application object supplying Electron's WebAuthn configuration.
 */
export function configureWebAuthn(target: Pick<typeof app, 'configureWebAuthn'> = app): void {
  if (process.platform !== 'darwin') return
  target.configureWebAuthn({
    touchID: {
      keychainAccessGroup: WEBAUTHN_KEYCHAIN_ACCESS_GROUP,
      promptReason: WEBAUTHN_TOUCH_ID_PROMPT_REASON,
    },
  })
}
