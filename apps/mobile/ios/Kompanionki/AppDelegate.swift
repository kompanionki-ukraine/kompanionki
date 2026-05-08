import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

#if DEBUG
    ReactNativeDelegate.syncSharedPackagerHostWithMetroPort()
#endif

    factory.startReactNative(
      withModuleName: "Kompanionki",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  private static let metroDevServerPort = 9087

  static func syncSharedPackagerHostWithMetroPort() {
    RCTBundleURLProvider.sharedSettings().jsLocation = packagerHostWithPort()
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    let hostPort = Self.packagerHostWithPort()
    return RCTBundleURLProvider.jsBundleURL(
      forBundleRoot: "index",
      packagerHost: hostPort,
      enableDev: true,
      enableMinification: false,
      inlineSourceMap: false
    )
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }

  private static func packagerHostWithPort() -> String {
#if targetEnvironment(simulator)
    return "127.0.0.1:\(metroDevServerPort)"
#else
    if let path = Bundle.main.path(forResource: "ip", ofType: "txt"),
       let ip = try? String(contentsOfFile: path, encoding: .utf8)
         .trimmingCharacters(in: .whitespacesAndNewlines),
       !ip.isEmpty {
      return "\(ip):\(metroDevServerPort)"
    }
    return "127.0.0.1:\(metroDevServerPort)"
#endif
  }
}
