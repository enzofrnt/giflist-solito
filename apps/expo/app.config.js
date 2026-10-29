/**
 * Associated Domains (webcredentials) is required for the iOS password manager
 * to link giftlist.fr credentials with the app, but Apple Personal Teams do not
 * support that capability. Keep it opt-in for paid/EAS builds:
 *
 *   EXPO_PUBLIC_ENABLE_WEB_CREDENTIALS=1 npx expo prebuild --clean
 */
module.exports = ({ config }) => {
  const webCredentials = process.env.EXPO_PUBLIC_ENABLE_WEB_CREDENTIALS === '1'
  return {
    ...config,
    ios: {
      ...config.ios,
      ...(webCredentials ? { associatedDomains: ['webcredentials:giftlist.fr'] } : {}),
    },
  }
}
