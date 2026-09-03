# RTCConfigProvider 

## 概述

默认情况下，CallKit 使用声网提供的 RTC 凭证体系，即登录即时通讯 IM 后，由 IM SDK 自动下发 RTC AppId、Token、UID 以及 UID 和 IM 用户 ID（`userId`）的映射关系。你只需通过 `CallKitClient.init(context, callKitConfig)` 完成初始化即可。

**如果你已有自己的声网 App ID，并希望在自己的应用服务端独立签发 RTC Token、自行维护 IM userId 与 RTC UID 的映射关系**，你可以使用 `RTCConfigProvider` 接口进行自定义配置。

你可根据业务场景选择 CallKit 的两种凭证管理方式：

| 项 | 默认方式 | `RTCConfigProvider` |
| :--- | :-------- | :-------- |
| **RTC App ID** | 登录 IM 后从 IM SDK 的 `ChatClient.getInstance().options.appId` 读取 | 由你的应用服务端通过 `RTCConfigProvider.onSyncGetAppId()` 提供 |
| **RTC Token / UID** | 登录后向 IM SDK 请求下发 | 由你的应用服务端通过 `RTCConfigProvider.onAsyncFetchRtcToken(channelName, callback)` 签发 |
| **声网 UID 与 IM 用户 ID（`userId`）的映射** | 依赖 IM SDK 内置映射 | 由你的应用服务端通过 `RTCConfigProvider.onAsyncFetchUserIdByUid(uids, callback)` 维护 |

:::tip
两种方式只能选其一。RTC 引擎创建后 **无法切换凭证来源**。如需从默认方式切换至 `RTCConfigProvider` 方式，请 **重启 App** 后直接进入 RTCConfigProvider 页面，不要在首页先完成 IM 登录。
:::

## 使用流程

本节介绍从初始化到呼叫的流程。

### 步骤 1：通过自有 App ID 初始化 IM SDK

使用你的 IM 的 App ID 初始化 IM SDK。

**不要将 RTC App ID 填入 `ChatSDKOptions`，它将在后续由 `RTCConfigProvider.onSyncGetAppId()` 单独提供。**

```kotlin
val options = ChatSDKOptions()
options.appId = "your_im_app_ID"  // IM App ID
options.debugMode = true
ChatClient.getInstance().init(context, options)
```

### 步骤 2：通过 RTCConfigProvider 初始化 CallKit

调用 `CallKitClient.init(context, config)` 时，需提前设置 `RTCConfigProvider`。`CallKit` 会在创建 RTC 引擎前调用 `onSyncGetAppId()` 获取你的声网 App ID。此后，登录、进房、Token 续期等所有 RTC 凭证需求均通过 `RTCConfigProvider` 从你的服务端获取，不再依赖 IM SDK。

:::tip
接口全路径：`com.hyphenate.callkit.interfaces.RTCConfigProvider`。
:::

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // 初始化 IM SDK（需先完成）
        ChatClient.getInstance().init(this, ChatSDKOptions())

        // 设置自定义 RTC 配置提供者
        CallKitClient.rtcConfigProvider = MyRTCConfigProvider()

        // 初始化 CallKit
        CallKitClient.init(this, CallKitConfig())
    }
}
```

### 步骤 3：实现 RTCConfigProvider 接口

`RTCConfigProvider` 提供了三个可选方法，用于自定义 RTC 凭证管理。`CallKit` 会在以下时机自动回调对应方法，你只需向自己的服务端请求数据并返回即可。**不设置该接口或方法采用默认实现（返回 `null`）时，CallKit 默认完全依赖声网服务下发 RTC 配置**

| 方法 | 说明 | 调用时机 | 回退逻辑（返回 `null` 时） |
| :-------------- | :----- | :------- | :------------- |
| `onSyncGetAppId(): String?` | 同步提供你的声网 App ID（不是 IM 提供的 App ID），**勿做耗时操作**。 | 在 RTC 引擎初始化前调用，仅调用一次。 | 使用声网 SDK 配置中的 AppId。 |
| `onAsyncFetchRtcToken(channelName, callback)` | 异步提供 RTC Token，`callback(EMRTCTokenInfo?)` 返回结果。<br/>当前 `channelName` 可能为 `null` 或具体的频道名称，请签发 **对所有频道有效的应用级 Token **。 | 加入频道前、Token 即将过期、App 从后台回到前台等时机 | 使用 SDK 内部缓存/获取逻辑 |
| `onAsyncFetchUserIdByUid(uids, callback)` | 批量返回声网 UID 与 IM userId 的映射关系。 | 通话中远端用户进房后，需要反查用户信息（头像、昵称等）时调用。 | 缺失的 UID 通过 SDK 的 `asyncGetUserIdsWithRTCUids` 查询 |

:::warning
两个异步方法内部以协程挂起等待结果，**必须保证 callback 被调用**，否则流程会一直卡住。
:::

**返回值约束：**

- `uid` 必须大于 0，同一用户应尽量保持稳定。
- `expireTimeStamp` 为 Unix 时间戳（秒），传 `0` 表示永不过期。有效 Token 会在过期前自动续期。
- `rtcToken` 不能为空。
- 登出 IM 时，无需手动清理，CallKit 会自动处理内部缓存。

```kotlin
class MyRTCConfigProvider : RTCConfigProvider {

    override fun onSyncGetAppId(): String? {
        // 返回你自己的声网 App ID，该方法必须立即返回，不能做耗时操作
        return "YOUR_AGORA_APP_ID"
    }

    override fun onAsyncFetchRtcToken(
        channelName: String?,
        callback: OnValueSuccess<EMRTCTokenInfo?>
    ) {
        // 从你的业务服务器异步获取 RTC Token
        // channelName 当前可为 null，服务端应按应用级 Token 签发
        // 建议服务端返回：{ "uid": 123456, "token": "007eJx...", "expireTimeStamp": 1710000000 }
        
        val currentUserId = ChatClient.getInstance().currentUser
        val request = object {
            val userId = currentUserId
            val channelName = channelName
        }
        
        MyTokenServer.fetchRtcToken(request)
            .onSuccess { resp ->
                callback(EMRTCTokenInfo(
                    // 声网 RTC Token，由你的服务端签发
                    rtcToken = resp.token,
                    // Token 过期时间戳（秒），0 表示永不过期
                    expireTimeStamp = resp.expireTimeStamp,
                    // 当前用户对应的声网 RTC UID，必须大于 0
                    uid = resp.uid
                ))
            }
            .onFailure { error ->
                // 返回 null 会回退到 SDK 默认获取逻辑
                callback(null)
            }
    }

    override fun onAsyncFetchUserIdByUid(
        uids: List<Int>,
        callback: OnValueSuccess<Map<Int, String>?>
    ) {
        // 从你的业务服务器查询 uid 到 IM userId 的映射关系
        // 建议服务端返回：{ "123456": "userA", "234567": "userB" }
        
        MyUserServer.queryUserIdsByUids(uids)
            .onSuccess { map ->
                callback(map)
            }
            .onFailure { error ->
                // 返回 null 或缺失部分会回退到 SDK 默认查询逻辑
                callback(null)
            }
    }
}
```

### 步骤 4：登录 IM 并发起呼叫

IM 登录仍使用 IM 用户 Token，**RTC Token 不会在登录时获取**，而是由 `RTCConfigProvider` 在进房或续期时按需回调。呼叫 API 与默认方式完全相同。

```kotlin
ChatClient.getInstance().login(userId, imToken, object : EMCallBack {
    override fun onSuccess() {
        ChatLog.d("Login", "IM login successful")
        // 登录成功，设置当前用户信息（可选）
        CallKitClient.getCache().saveUser(userId)
    }

    override fun onError(code: Int, error: String?) {
        ChatLog.e("Login", "IM login failed: $error")
    }
})

// 发起一对一音频通话
CallKitClient.startSingleCall(peerUserId, CallType.SINGLE_VOICE_CALL)

// 发起一对一视频通话
CallKitClient.startSingleCall(peerUserId, CallType.SINGLE_VIDEO_CALL)

// 发起群组通话
CallKitClient.startGroupCall(groupId, CallType.GROUP_VOICE_CALL)
```

## 完整示例代码

```kotlin
import android.app.Application
import com.hyphenate.callkit.CallKitClient
import com.hyphenate.callkit.CallKitConfig
import com.hyphenate.callkit.interfaces.RTCConfigProvider
import com.hyphenate.chat.ChatClient
import com.hyphenate.chat.ChatSDKOptions
import com.hyphenate.chat.EMRTCTokenInfo
import com.hyphenate.chat.OnValueSuccess

class MyApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // 1. 初始化 IM SDK（需先完成）
        val options = ChatSDKOptions()
        options.appId = "YOUR_IM_APP_ID"
        options.debugMode = true
        ChatClient.getInstance().init(this, options)

        // 2. 设置自定义 RTC 配置提供者（可选）
        CallKitClient.rtcConfigProvider = MyRTCConfigProvider()

        // 3. 初始化 CallKit
        val config = CallKitConfig().apply {
            callTimeout = 30 * 1000 // 按需配置，均为可选
            // 其他配置...
        }
        CallKitClient.init(this, config)
    }
}

/**
 * 自定义 RTC 配置提供者实现
 */
class MyRTCConfigProvider : RTCConfigProvider {

    override fun onSyncGetAppId(): String? {
        // 同步返回你的声网 App ID（不能做耗时操作）
        return "YOUR_AGORA_APP_ID"
    }

    override fun onAsyncFetchRtcToken(
        channelName: String?,
        callback: OnValueSuccess<EMRTCTokenInfo?>
    ) {
        // 从你的业务服务器异步获取 RTC Token
        Thread {
            try {
                val currentUserId = ChatClient.getInstance().currentUser
                val tokenInfo = MyTokenServer.fetchRtcToken(currentUserId, channelName)
                callback(EMRTCTokenInfo(
                    rtcToken = tokenInfo.token,
                    expireTimeStamp = tokenInfo.expireTime,
                    uid = tokenInfo.uid
                ))
            } catch (e: Exception) {
                e.printStackTrace()
                // 返回 null 会回退到 SDK 默认获取逻辑
                callback(null)
            }
        }.start()
    }

    override fun onAsyncFetchUserIdByUid(
        uids: List<Int>,
        callback: OnValueSuccess<Map<Int, String>?>
    ) {
        // 从你的业务服务器批量查询 uid 到 IM userId 的映射
        Thread {
            try {
                val uidToUserIdMap = MyUserServer.queryUserIdsByUids(uids)
                callback(uidToUserIdMap)
            } catch (e: Exception) {
                e.printStackTrace()
                // 返回 null 会回退到 SDK 默认查询逻辑
                callback(null)
            }
        }.start()
    }
}

/**
 * 模拟的业务服务器实现
 */
object MyTokenServer {
    fun fetchRtcToken(userId: String, channelName: String?): TokenResponse {
        // 实现你的网络请求逻辑，调用你的服务器获取 Token
        // 返回格式应为：{ "uid": 123456, "token": "007eJx...", "expireTime": 1710000000 }
        return TokenResponse(
            uid = userId.hashCode().toInt().let { if (it < 0) -it else it },
            token = "your_agora_rtc_token",
            expireTime = System.currentTimeMillis() / 1000 + 24 * 3600
        )
    }
}

object MyUserServer {
    fun queryUserIdsByUids(uids: List<Int>): Map<Int, String> {
        // 实现你的网络请求逻辑，调用你的服务器查询 uid 映射
        // 返回格式应为：{ "123456": "userA", "234567": "userB" }
        return mutableMapOf<Int, String>().apply {
            uids.forEach { uid ->
                this[uid] = "user_$uid"
            }
        }
    }
}

data class TokenResponse(
    val uid: Int,
    val token: String,
    val expireTime: Long
)
```

