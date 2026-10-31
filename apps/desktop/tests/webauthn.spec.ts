/** The shell enables the macOS platform authenticator that passkey sign-in needs. */
import { readFile } from 'node:fs/promises'
import { expect, it, vi } from 'vitest'
import { configureWebAuthn, WEBAUTHN_KEYCHAIN_ACCESS_GROUP, WEBAUTHN_TOUCH_ID_PROMPT_REASON } from '../src/webauthn.ts'

const electron = vi.hoisted(() => ({ configureWebAuthn: vi.fn() }))
vi.mock('electron', () => ({ app: electron }))

function withPlatform(platform: NodeJS.Platform, run: () => void): void {
  vi.stubGlobal('process', { ...process, platform })
  try { run() } finally { vi.unstubAllGlobals(); vi.resetAllMocks() }
}

it('enables the Touch ID authenticator on macOS', () => {
  withPlatform('darwin', () => {
    configureWebAuthn()
    expect(electron.configureWebAuthn).toHaveBeenCalledExactlyOnceWith({
      touchID: {
        keychainAccessGroup: WEBAUTHN_KEYCHAIN_ACCESS_GROUP,
        promptReason: WEBAUTHN_TOUCH_ID_PROMPT_REASON,
      },
    })
  })
})

it.each(['linux', 'win32'] as const)('leaves %s to the operating system', (platform) => {
  withPlatform(platform, () => {
    configureWebAuthn()
    expect(electron.configureWebAuthn).not.toHaveBeenCalled()
  })
})

it('keeps the keychain group inside the signed entitlement', async () => {
  const entitlements = await readFile(new URL('../scripts/macos-signed-entitlements.plist', import.meta.url), 'utf8')
  expect(entitlements).toContain(`<string>${WEBAUTHN_KEYCHAIN_ACCESS_GROUP}</string>`)
})
