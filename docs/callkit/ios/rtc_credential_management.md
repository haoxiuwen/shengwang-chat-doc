# CallTokenProvider 

## 概述

默认情况下，CallKit 使用声网提供的 RTC 凭证体系，即登录即时通讯 IM 后，由 IM SDK 自动下发 RTC AppId、Token、UID 以及 UID 和 IM 用户 ID（`userId`）的映射，你只需要通过 `CallKitManager.shared.setup(config)` 完成配置即可。

**如果你已有自己的声网 App ID，并希望在自己的应用服务端独立签发 RTC Token、自行维护 IM userId 与 RTC UID 的映射关系**，你可以使用 `CallTokenProvider`方式接入。[示例项目](https://github.com/easemob/easemob-callkit-iOS)的首页点击 **Token Provider** 可进入完整可运行示例，源码详见 [Example/EaseCallUIKit/TokenProviderViewController.swift](https://github.com/easemob/easemob-callkit-iOS/blob/dev/Example/EaseCallUIKit/TokenProviderViewController.swift)。

你可根据业务场景选择 CallKit 的两种凭证管理方式：

| 项    | 默认方式   | `CallTokenProvider`              |
| :--- | :-------- | :-------- |
| **RTC App ID**        | 登录 IM 后从 IM SDK 的 `options.appId` 读取 | 由你的应用服务端通过 `CallTokenProvider.getAppId()` 提供     |
| **RTC Token / UID**   | 登录后向 IM SDK 请求下发                    | 由你的应用服务端通过 `CallTokenProvider.getRTCToken(withChannel:)` 签发 |
| **声网 UID 与 IM 用户 ID（`userId`）的映射** | 依赖 IM SDK 内置映射 | 由你的应用服务端通过 `CallTokenProvider.getRelations(rtc:)` 维护 |

:::tip
两种方式只能选其一。RTC 引擎创建后 **无法切换凭证来源**。如需从默认方式切换至 `CallTokenProvider` 方式，请 **重启 App** 后直接进入 Token Provider 页面，不要在首页先完成 IM 登录。
:::

## 使用流程

本节介绍从初始化到呼叫的流程。

### 步骤 1：通过自有 App ID 初始化 IM SDK

与默认方式相同，使用你的 IM 的 App ID 初始化 IM SDK。

**不要将 RTC App ID 填入 IM Options，它将在后续由 `CallTokenProvider.getAppId()` 单独提供。** 

```Swift
let option = ChatSDKOptions(appID: appID)
option.enableConsoleLog = true
option.isAutoLogin = false
ChatClient.shared().initializeSDK(with: option)
```

### 步骤 2：通过 CallTokenProvider 初始化 CallKit

调用 `setup(_:tokenProvider:)` 时，`CallKit` 会立即调用 `getAppId()` 创建 RTC 引擎。此后，登录、进房、Token 续期等所有 RTC 凭证需求均通过 `CallTokenProvider` 从你的服务端获取，不再依赖 IM SDK。

```Swift
let config = CallKitConfig()
config.enablePIPOn1V1VideoScene = true
CallKitManager.shared.setup(config, tokenProvider: self)
CallKitManager.shared.profileProvider = self
CallKitManager.shared.addListener(self)
```

### 步骤 3：实现 CallTokenProvider 协议

`CallTokenProvider` 提供了三个必须实现的方法，用于自定义 RTC 凭证管理。`CallKit` 会在以下时机自动回调对应方法，你只需向自己的服务端请求数据并返回即可。**不实现该协议或方法返回空值时，CallKit 会降级到 IM SDK 内部逻辑**。

| 方法  | 说明  | 调用时机  | 回退逻辑（返回 `nil` 或空时）   |
| :-------------- | :----- | :------- | :------------- |
| `getAppId() -> String`  | 同步返回你的声网 App ID（不是 IM 提供的 App ID），**必须返回有效的非空字符串**。 | 在 RTC 引擎初始化前调用，仅调用一次。 | 使用 IM SDK 配置中的 AppId（`ChatClient.shared().options.appId`）。 |
| `getRTCToken(withChannel: String?) async throws -> CallRTCTokenInfo` | 异步提供 RTC Token、uid 和过期时间。当前 `channelName` 固定传 `nil`，请签发 **对所有频道有效的应用级 Token**。 | 登录后、进房前、Token 即将过期、App 从后台回到前台等时机。| 使用 IM SDK 内部缓存/获取逻辑（调用 `ChatClient.shared().getRTCToken(withChannel:)`）。 |
| `getRelations(rtc: [UInt32]) async throws -> [UInt32: String]` | 批量返回声网 UID 与 IM userId 的映射关系，返回字典 `[uid: userId]`。 | 通话中远端用户进房后，需要反查用户信息（头像、昵称等）时调用。 | 缺失的 UID 使用 IM SDK 查询逻辑（调用 `ChatClient.shared().getUserId(byRTCUIds:)`）。 |

**返回值约束：**

- `uid` 必须大于 0，同一用户应尽量保持稳定。
- `expiration` 为 Unix 时间戳（秒），传 `0` 表示永不过期。有效 Token 会在过期前约 5 分钟自动续期。
- 除非将 `CallKitConfig.disableRTCTokenValidation` 设为 `true`，否则 `token` 不能为空。
- 登出 IM 时，请调用 `CallKitManager.shared.cleanUserDefaults()` 清理本地缓存的 Token 和 uid 映射。

```Swift
final class ExampleCallTokenProvider: CallTokenProvider {

    func getAppId() -> String {
        agoraAppId
    }

    func getRTCToken(withChannel channelName: String?) async throws -> CallRTCTokenInfo {
        // channelName 当前为 nil，服务端应按应用级 Token 签发。
        // 建议服务端返回：{ "uid": 123456, "token": "007eJx...", "expiration": 1710000000 }
        let currentUserId = ChatClient.shared().currentUsername ?? ""
        var request = URLRequest(url: URL(string: "https://your-server.com/rtc/token")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: [
            "userId": currentUserId,
            "channelName": channelName as Any
        ])
        let (data, _) = try await URLSession.shared.data(for: request)
        let object = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        return CallRTCTokenInfo(
            uid: (object?["uid"] as? NSNumber)?.uint32Value ?? 0,
            token: object?["token"] as? String ?? "",
            expiration: (object?["expiration"] as? NSNumber)?.int64Value ?? 0
        )
    }

    func getRelations(rtc uids: [UInt32]) async throws -> [UInt32: String] {
        // 建议服务端返回：{ "123456": "userA", "234567": "userB" }
        var request = URLRequest(url: URL(string: "https://your-server.com/rtc/relations")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: [
            "uids": uids.map { NSNumber(value: $0) }
        ])
        let (data, _) = try await URLSession.shared.data(for: request)
        let object = try JSONSerialization.jsonObject(with: data) as? [String: String] ?? [:]
        return object.reduce(into: [UInt32: String]()) { result, item in
            guard let uid = UInt32(item.key), uid > 0, !item.value.isEmpty else { return }
            result[uid] = item.value
        }
    }
}
```

### 步骤 4：登录 IM 并发起呼叫

IM 登录仍使用 IM 用户 Token，**RTC Token 不会在登录时获取**，而是由 `CallTokenProvider` 在进房或续期时按需回调。呼叫 API 与默认方式完全相同。

```Swift
ChatClient.shared().login(withUsername: userId, token: token) { userId, error in
    if error == nil, !userId.isEmpty {
        let profile = CallUserProfile()
        profile.id = userId
        profile.nickname = "\(userId)昵称"
        CallKitManager.shared.currentUserInfo = profile
    }
}

CallKitManager.shared.call(with: peerUserId, type: .singleAudio)
// 或
CallKitManager.shared.groupCall(groupId: groupId)
```

## 完整示例代码

```swift
import UIKit
import EaseCallUIKit
import AgoraRtcKit

// MARK: - 配置常量
let AppKey = "YOUR_IM_APP_KEY"
let userId = "YOUR_USER_ID"
let token = "YOUR_IM_TOKEN"
let agoraAppId = "YOUR_AGORA_APP_ID"
let tokenProviderBaseURL = "https://your-server.com"
let agoraRTCUid: UInt32 = 0
let agoraRTCToken = ""
let agoraRTCTokenExpiration: Int64 = 0
let agoraRTCUidToUserId: [UInt32: String] = [:]

// MARK: - AppDelegate
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // 1. 初始化 IM SDK
        let option = ChatSDKOptions(appkey: AppKey)
        option.enableConsoleLog = true
        option.isAutoLogin = false
        ChatClient.shared().initializeSDK(with: option)
    
        // 2. 设置自定义 RTC 配置提供者（可选）
        let config = CallKitConfig()
        config.enablePIPOn1V1VideoScene = true
        CallKitManager.shared.setup(config, tokenProvider: MyCallTokenProvider())
        CallKitManager.shared.profileProvider = MyCallProfileProvider()
        CallKitManager.shared.addListener(MyCallServiceListener())
        
        return true
    }
}

// MARK: - 自定义 RTC 配置提供者实现
final class MyCallTokenProvider: CallTokenProvider {

    func getAppId() -> String {
        agoraAppId
    }
    
    func getRTCToken(withChannel channelName: String?) async throws -> CallRTCTokenInfo {
        // 如果只是本地验证协议是否接通，可以临时返回下面这组调试值。
        // 真机通话前请改成真实的服务端请求，并删除这段调试返回。
        if !agoraRTCToken.isEmpty, agoraRTCUid > 0 {
            return CallRTCTokenInfo(
                uid: agoraRTCUid,
                token: agoraRTCToken,
                expiration: agoraRTCTokenExpiration
            )
        }
    
        let currentUserId = ChatClient.shared().currentUsername ?? ""
        var request = URLRequest(url: URL(string: "\(tokenProviderBaseURL)/rtc/token")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: [
            "userId": currentUserId,
            "channelName": channelName as Any
        ])
        let (data, _) = try await URLSession.shared.data(for: request)
        let object = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        return CallRTCTokenInfo(
            uid: (object?["uid"] as? NSNumber)?.uint32Value ?? 0,
            token: object?["token"] as? String ?? "",
            expiration: (object?["expiration"] as? NSNumber)?.int64Value ?? 0
        )
    }
    
    func getRelations(rtc uids: [UInt32]) async throws -> [UInt32: String] {
        // 建议服务端返回：{ "123456": "userA", "234567": "userB" }
        var request = URLRequest(url: URL(string: "\(tokenProviderBaseURL)/rtc/relations")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: [
            "uids": uids.map { NSNumber(value: $0) }
        ])
        let (data, _) = try await URLSession.shared.data(for: request)
        let object = try JSONSerialization.jsonObject(with: data) as? [String: String] ?? [:]
        return object.reduce(into: [UInt32: String]()) { result, item in
            guard let uid = UInt32(item.key), uid > 0, !item.value.isEmpty else { return }
            result[uid] = item.value
        }
    }
}

// MARK: - 用户信息提供者
final class MyCallProfileProvider: CallUserProfileProvider {
    func fetchUserProfiles(profileIds: [String]) async -> [any CallProfileProtocol] {
        var resultProfiles: [CallProfileProtocol] = []
        var unknownIds: [String] = []
        for profileId in profileIds {
            if let profile = CallKitManager.shared.usersCache[profileId] {
                resultProfiles.append(profile)
            } else {
                unknownIds.append(profileId)
            }
        }
        guard !unknownIds.isEmpty else { return resultProfiles }
        let result = await ChatClient.shared().userInfoManager?.fetchUserInfo(byId: unknownIds)
        if result?.1 == nil, let infoMap = result?.0 {
            for (userId, info) in infoMap {
                let profile = CallUserProfile()
                profile.id = userId
                profile.nickname = info.nickname ?? ""
                profile.avatarURL = info.avatarUrl ?? ""
                resultProfiles.append(profile)
            }
        }
        return resultProfiles
    }

    func fetchGroupProfiles(profileIds: [String]) async -> [any CallProfileProtocol] {
        let groups = ChatClient.shared().groupManager?.getJoinedGroups() ?? []
        return profileIds.compactMap { groupId in
            guard let group = groups.first(where: { $0.groupId == groupId }) else { return nil }
            let profile = CallUserProfile()
            profile.id = groupId
            profile.nickname = group.groupName
            profile.avatarURL = group.settings.ext
            return profile
        }
    }
}

// MARK: - 通话事件监听
final class MyCallServiceListener: CallServiceListener {
    func didOccurError(error: CallError) {
        DispatchQueue.main.async {
            print("通话错误: \(error.errorMessage)")
        }
    }

    func didUpdateCallEndReason(reason: CallEndReason, info: CallInfo) {
        print("通话结束: \(reason)")
    }
    
    func remoteUserDidJoined(userId: String, uid: UInt, channelName: String, type: CallType) {}
    func remoteUserDidLeft(userId: String, uid: UInt, channelName: String, type: CallType) {}
    func onRtcEngineCreated(engine: AgoraRtcEngineKit) {}
}

// MARK: - 业务服务器实现
struct MyTokenServer {
    static func fetchRtcToken(userId: String, channelName: String?) async throws -> TokenResponse {
        // 实现你的网络请求逻辑，调用你的服务器获取 Token
        // 返回格式应为：{ "uid": 123456, "token": "007eJx...", "expiration": 1710000000 }
        return TokenResponse(
            uid: userId.hashCode().toInt().let { if ($0 < 0) -$0 else $0 },
            token: "your_agora_rtc_token",
            expireTime: Int64(Date().timeIntervalSince1970) + 24 * 3600
        )
    }
}

struct MyUserServer {
    static func queryUserIdsByUids(_ uids: [UInt32]) async throws -> [UInt32: String] {
        // 实现你的网络请求逻辑，调用你的服务器查询 uid 映射
        // 返回格式应为：{ "123456": "userA", "234567": "userB" }
        return uids.reduce(into: [UInt32: String]()) { result, uid in
            result[uid] = "user_\(uid)"
        }
    }
}

struct TokenResponse {
    let uid: UInt32
    let token: String
    let expireTime: Int64
}

// MARK: - 使用示例 ViewController
class MyViewController: UIViewController {
    
    @IBOutlet weak var userIdTextField: UITextField!
    @IBOutlet weak var callIdTextField: UITextField!
    @IBOutlet weak var callTypeSegment: UISegmentedControl!
    
    @IBAction func loginAction(_ sender: UIButton) {
        guard let userId = userIdTextField.text, !userId.isEmpty else { return }
        
        ChatClient.shared().login(withUsername: userId, token: token) { [weak self] loginUserId, error in
            if error == nil, !loginUserId.isEmpty {
                let profile = CallUserProfile()
                profile.id = loginUserId
                profile.nickname = loginUserId
                CallKitManager.shared.currentUserInfo = profile
            }
        }
    }
    
    @IBAction func callAction(_ sender: UIButton) {
        guard let callId = callIdTextField.text?.trimmingCharacters(in: .whitespacesAndNewlines), !callId.isEmpty else { return }
        
        let callType: CallType
        switch callTypeSegment.selectedSegmentIndex {
        case 1:
            callType = .singleVideo
        case 2:
            callType = .groupCall
        default:
            callType = .singleAudio
        }
    
        if callType != .groupCall {
            CallKitManager.shared.call(with: callId, type: callType)
        } else {
            CallKitManager.shared.groupCall(groupId: callId)
        }
    }
}
```

