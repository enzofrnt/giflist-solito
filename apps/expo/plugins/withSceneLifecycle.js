const { withAppDelegate, withInfoPlist } = require('expo/config-plugins')

const TEMPLATE_CLASS = 'class AppDelegate: ExpoAppDelegate {'
const PROVIDER_CLASS = 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
const TEMPLATE_STARTUP = `    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
`

/** Xcode 27 / iOS 27 UIScene lifecycle compatibility for Expo SDK 57. */
const withSceneLifecycle = (config) => {
  config = withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle: expected a Swift AppDelegate')
    }
    const contents = config.modResults.contents
    if (!contents.includes(PROVIDER_CLASS)) {
      if (!contents.includes(TEMPLATE_CLASS) || !contents.includes(TEMPLATE_STARTUP)) {
        throw new Error('withSceneLifecycle: AppDelegate template changed; update the plugin')
      }
      config.modResults.contents = contents
        .replace(TEMPLATE_CLASS, PROVIDER_CLASS)
        .replace(TEMPLATE_STARTUP, '')
    }
    return config
  })

  return withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: 'EXExpoAppSceneDelegate',
          },
        ],
      },
    }
    return config
  })
}

module.exports = withSceneLifecycle
