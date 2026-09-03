# Web CallTokenProvider 实现指南

## 概述

默认情况下，CallKit 使用声网提供的 RTC 凭证体系，即登录即时通讯 IM 后，由 IM SDK 自动下发 RTC AppId、Token、UID 以及 UID 和 IM 用户 ID（`userId`）的映射，

**如果你已有自己的声网 App ID，并希望在自己的应用服务端独立签发 RTC Token、自行维护 IM userId 与 RTC UID 的映射关系**，你可以使用 `CallTokenProvider` 方式接入。

你可根据业务场景选择 CallKit 的两种凭证管理方式：

| 项 | 默认方式 | `CallTokenProvider` |
|:---|:--------|:-------------------|
| **RTC App ID** | 登录 IM 后从 IM SDK 的 `options.appId` 读取 | 由你的应用服务端通过 `CallTokenProvider.getAppId()` 提供 |
| **RTC Token / UID** | 登录后向 IM SDK 请求下发 | 由你的应用服务端通过 `CallTokenProvider.getRTCToken()` 签发 |
| **声网 UID 与 IM 用户 ID（`userId`）的映射** | 依赖 IM SDK 内置映射 | 由你的应用服务端通过 `CallTokenProvider.getRelations()` 维护 |

:::tip
两种方式只能选其一。RTC 引擎创建后 **无法切换凭证来源**。如需从默认方式切换至 `CallTokenProvider` 方式，请 **重启应用** 后直接进入 Token Provider 页面。
:::

## 使用流程

本节介绍从初始化到呼叫的完整流程。

### 步骤 1：初始化 IM SDK

使用你的 IM 的 App Key 初始化 IM SDK。

**不要将 RTC App ID 填入 IM Options，它将在后续由 `CallTokenProvider.getAppId()` 单独提供。**

```tsx
import WebIM from 'easemob-websdk';

const connection = new WebIM.connection({
  appId: 'YOUR_APP_ID',
});

await connection.open({
  user: userId,
  accessToken: token,
});
```

### 步骤 2：创建 CallTokenProvider 实现

`CallTokenProvider` 提供了三个必须实现的方法，用于自定义 RTC 凭证管理。CallKit 在相应时机调用这些方法，你只需向自己的后端请求数据并返回即可。**未实现该接口或方法返回 null/空值时，CallKit 会降级到 IM SDK 的内部逻辑。**

| 方法         | 说明             | 调用时机   | 回退逻辑（返回 null/空 或未实现时）    |
| :----- | :------ | :------- | :--------- |
| `getAppId(): string      | Promise<string>`         | 同步或异步返回你的声网 App ID（不是 IM 提供的 App ID），**必须返回有效的非空字符串**。 | 在 RTC 引擎初始化前调用，仅调用一次。                        |
| `getRTCToken(channel?: string): Promise<CallRTCTokenInfo>`   | 异步提供 RTC Token、uid 和过期时间。当前 channel 可按实现约定传入或忽略；建议签发对所有频道有效的应用级 Token（或根据需要签发频道级 Token）。 | 登录后、进房前、Token 即将过期、页面从不可见回到可见等时机。 | 使用 IM SDK 内部的缓存与数据获取机制（例如 IM SDK 提供的获取 Token 的等效方法）。 |
| `getRelations(rtcUids: number[]): Promise<Record<number, string>>` | 批量返回声网 UID 与 IM userId 的映射关系，返回字典 `{ [uid]: userId }`。 | 通话中远端用户进房后，需要反查用户信息（头像、昵称等）时调用。 | 对缺失的 UID 使用 IM SDK 查询逻辑（例如 IM SDK 的批量 UID->userId 查询接口）。 |

```tsx
import { CallTokenProvider, CallRTCTokenInfo } from '@/module/callkit';

class MyCallTokenProvider extends CallTokenProvider {
  private agoraAppId: string;
  private tokenServerUrl: string;

  constructor(agoraAppId: string, tokenServerUrl: string) {
    super();
    this.agoraAppId = agoraAppId;
    this.tokenServerUrl = tokenServerUrl;
  }

  /**
   * 同步返回你的声网 App ID
   * 必须返回有效的非空字符串
   */
  getAppId(): string {
    return this.agoraAppId;
  }

  /**
   * 异步提供 RTC Token、uid 和过期时间
   * channelName 当前固定传 '*'，请签发应用级 Token
   */
  async getRTCToken(channelName?: string): Promise<CallRTCTokenInfo> {
    const currentUserId = localStorage.getItem('currentUserId') || '';
    
    try {
      const response = await fetch(`${this.tokenServerUrl}/rtc/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          channelName: channelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        uid: data.uid || 0,
        token: data.token || '',
        expiration: data.expiration || 0,
      };
    } catch (error) {
      console.error('Failed to fetch RTC token:', error);
      throw error;
    }
  }

  /**
   * 批量返回声网 UID 与 IM userId 的映射关系
   * 返回字典 {uid: userId}
   */
  async getRelations(uids: number[]): Promise<Record<number, string>> {
    try {
      const response = await fetch(`${this.tokenServerUrl}/rtc/relations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uids: uids,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 转换为 {uid: userId} 格式，并验证数据
      const relations: Record<number, string> = {};
      for (const [uidStr, userId] of Object.entries(data)) {
        const uid = parseInt(uidStr, 10);
        if (uid > 0 && userId && typeof userId === 'string' && userId.length > 0) {
          relations[uid] = userId;
        }
      }

      return relations;
    } catch (error) {
      console.error('Failed to fetch UID relations:', error);
      throw error;
    }
  }
}
```

### 步骤 3：初始化 CallService 时使用 TokenProvider

```tsx
import { CallService, CallServiceConfig } from '@/module/callkit';

// 创建 TokenProvider 实例
const tokenProvider = new MyCallTokenProvider(
  'YOUR_AGORA_APP_ID',
  'https://your-server.com'
);

// 配置 CallService
const callServiceConfig: CallServiceConfig = {
  connection: connection,
  tokenProvider: tokenProvider, // 🔧 传入自定义 TokenProvider
  
  onCallStart: (videos) => {
    console.log('通话开始', videos);
  },
  
  onCallEnd: (reason, callInfo) => {
    console.log('通话结束', reason, callInfo);
  },
  
  userInfoProvider: async (userIds) => {
    // 从服务端获取用户信息
    const response = await fetch('https://your-server.com/users/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds }),
    });
    return response.json();
  },
  
  onCallError: (error) => {
    console.error('通话错误:', error);
  },
};

// 初始化 CallService
const callService = new CallService(callServiceConfig);
```

### 步骤 4：登录 IM 并发起呼叫

IM 登录仍使用 IM 用户 Token，RTC Token **不会在登录时获取***，而是由 CallTokenProvider 在进房或续期时按需回调。

```tsx
// IM 登录
await connection.open({
  user: userId,
  accessToken: token,
});

// 发起 1v1 视频通话
await callService.startCall({
  msg: 'msgId',
  callId: generateCallId(),
  channel: generateChannelName(),
  chatType: 'singleChat',
  callType: CALL_TYPE.VIDEO_1V1,
  to: targetUserId,
});

// 或发起群组通话
await callService.startCall({
  msg: 'msgId',
  callId: generateCallId(),
  channel: generateChannelName(),
  chatType: 'groupChat',
  callType: CALL_TYPE.VIDEO_MULTI,
  to: groupId,
  members: ['member1', 'member2'],
  groupId: groupId,
  groupName: 'Group Name',
});
```

## 返回值约束

### getAppId()

- **返回值**：字符串格式的声网 App ID
- **必须返回有效的非空字符串**
- **调用时机**：在 RTC 引擎初始化前调用，仅调用一次
- **返回 null/undefined 时的回退逻辑**：使用 IM SDK 配置中的 AppId

### getRTCToken()

- **uid**：必须大于 0，同一用户应尽量保持稳定
- **expiration**：为 Unix 时间戳（秒），传 0 表示永不过期
- **token**：除非将 `CallServiceConfig.useRTCToken` 设为 `false`，否则 token 不能为空

**调用时机**：

- 登录后、进房前
- Token 即将过期时（提前约 5 分钟自动续期）
- App 从后台回到前台时

**返回 null 时的回退逻辑**：使用 IM SDK 内部缓存/获取逻辑

### getRelations()

- **返回格式**：`{ 123456: "userA", 234567: "userB" }`
- **uid**：必须是数字类型，值必须大于 0
- **userId**：必须是非空字符串

**调用时机**：通话中远端用户进房后，需要反查用户信息（头像、昵称等）时调用

**返回 null/undefined 或缺失的 UID 时的回退逻辑**：使用 IM SDK 查询逻辑

## 完整示例代码

```tsx
import React, { useEffect, useState } from 'react';
import WebIM from 'easemob-websdk';
import { CallService, CallServiceConfig, CALL_TYPE, CallTokenProvider, CallRTCTokenInfo } from '@/module/callkit';

// 自定义 TokenProvider
class MyCallTokenProvider extends CallTokenProvider {
  private agoraAppId: string;
  private tokenServerUrl: string;

  constructor(agoraAppId: string, tokenServerUrl: string) {
    super();
    this.agoraAppId = agoraAppId;
    this.tokenServerUrl = tokenServerUrl;
  }

  getAppId(): string {
    return this.agoraAppId;
  }

  async getRTCToken(channelName?: string): Promise<CallRTCTokenInfo> {
    const currentUserId = localStorage.getItem('currentUserId') || '';
    const response = await fetch(`${this.tokenServerUrl}/rtc/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId, channelName }),
    });
    const data = await response.json();
    return {
      uid: data.uid || 0,
      token: data.token || '',
      expiration: data.expiration || 0,
    };
  }

  async getRelations(uids: number[]): Promise<Record<number, string>> {
    const response = await fetch(`${this.tokenServerUrl}/rtc/relations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uids }),
    });
    return response.json();
  }
}

// 用户信息提供者
async function fetchUserProfiles(userIds: string[]) {
  const response = await fetch('https://your-server.com/users/info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds }),
  });
  return response.json();
}

const App = () => {
  const [connection, setConnection] = useState<any>(null);
  const [callService, setCallService] = useState<CallService | null>(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [appKey, setAppKey] = useState('');

  // 初始化和登录
  const handleLogin = async () => {
    try {
      // 创建连接
      const conn = new WebIM.connection({
        appKey: appKey,
      });

      // 登录
      await conn.open({
        user: userId,
        accessToken: password,
      });

      setConnection(conn);
      localStorage.setItem('currentUserId', userId);

      // 创建 TokenProvider
      const tokenProvider = new MyCallTokenProvider(
        'YOUR_AGORA_APP_ID',
        'https://your-server.com'
      );

      // 配置 CallService
      const config: CallServiceConfig = {
        connection: conn,
        tokenProvider,
        userInfoProvider: fetchUserProfiles,
        onCallStart: (videos) => console.log('Call started', videos),
        onCallEnd: (reason, info) => console.log('Call ended', reason, info),
        onCallError: (error) => console.error('Call error', error),
      };

      // 初始化 CallService
      const service = new CallService(config);
      setCallService(service);

      alert('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + (error as Error).message);
    }
  };

  // 发起通话
  const handleCall = async (targetUserId: string, callType: CALL_TYPE) => {
    if (!callService) {
      alert('CallService not initialized');
      return;
    }

    try {
      await callService.startCall({
        msg: `Call from ${userId}`,
        callId: `call_${Date.now()}`,
        channel: `channel_${Date.now()}`,
        chatType: 'singleChat',
        callType,
        to: targetUserId,
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      alert('Failed to start call: ' + (error as Error).message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Web CallKit - TokenProvider Demo</h1>

      {!connection ? (
        <div>
          <h2>登录</h2>
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password / Token"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="text"
            placeholder="App Key"
            value={appKey}
            onChange={(e) => setAppKey(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>已登录: {userId}</h2>
          <h3>发起通话</h3>
          <input type="text" id="targetUserId" placeholder="Target User ID" />
          <button
            onClick={() => {
              const target = (document.getElementById('targetUserId') as HTMLInputElement).value;
              handleCall(target, CALL_TYPE.AUDIO_1V1);
            }}
          >
            Audio Call
          </button>
          <button
            onClick={() => {
              const target = (document.getElementById('targetUserId') as HTMLInputElement).value;
              handleCall(target, CALL_TYPE.VIDEO_1V1);
            }}
          >
            Video Call
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
```