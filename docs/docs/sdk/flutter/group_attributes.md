# 管理群组属性

<Toc />

群组是支持多人沟通的即时通讯系统，本文介绍如何使用即时通讯 IM Flutter SDK 在实时互动 app 中实现群组属性相关功能。

## 技术原理

即时通讯 IM Flutter SDK 提供 `ChatGroup`、`ChatGroupManager` 和 `ChatGroupEventHandler` 类用于群组管理，支持你通过调用 API 在项目中实现如下功能：

- 修改群组名称及描述
- 获取、更新群组公告
- 管理群组共享文件
- 更新群扩展字段

## 前提条件

开始前，请确保满足以下条件：

- 完成 SDK 初始化，详见 [初始化文档](initialization.html)；
- 了解即时通讯 IM 的使用限制，详见 [使用限制](limitation.html)；
- 了解群组和群成员的数量限制，详见 [套餐包详情](billing_strategy.html)。

## 实现方法

本节介绍如何使用即时通讯 IM Flutter SDK 提供的 API 实现上述功能。

### 修改群组名称

仅群主和群管理员可以调用 `ChatGroupManager#changeGroupName` 方法设置和修改群组名称，群名称的长度限制为 128 个字符, 其他成员会收到 `ChatGroupEventHandler#onSpecificationDidUpdate` 回调。

示例代码如下：

```dart
try {
  await ChatClient.getInstance.groupManager.changeGroupName(
    groupId,
    newName,
  );
} on ChatError catch (e) {
}
```

### 修改群组描述

仅群主和群管理员可以调用 `ChatGroupManager#changeGroupDescription` 方法设置和修改群组描述，群描述的长度限制为 512 个字符, 其他成员会收到 `ChatGroupEventHandler#onSpecificationDidUpdate` 回调。

示例代码如下：

```dart
try {
  await ChatClient.getInstance.groupManager.changeGroupDescription(
    groupId,
    newDesc,
  );
} on ChatError catch (e) {
}
```

### 更新群公告

仅群主和群管理员可以调用 `ChatGroupManager#updateGroupAnnouncement` 方法设置和更新群公告。

群公告更新后，其他群成员收到 `ChatGroupEventHandler#onAnnouncementChangedFromGroup` 事件。

群公告的长度限制为 512 个字符。

示例代码如下：

```dart
try {
  await ChatClient.getInstance.groupManager.updateGroupAnnouncement(
    groupId,
    newAnnouncement,
  );
} on ChatError catch (e) {
}
```

### 获取群公告

所有群成员均可以调用 `ChatGroupManager#fetchAnnouncementFromServer` 方法从服务器获取群公告。

示例代码如下：

```dart
try {
  String? announcement =
      await ChatClient.getInstance.groupManager.fetchAnnouncementFromServer(
    groupId,
  );
} on ChatError catch (e) {
}
```

### 管理共享文件

#### 上传共享文件

所有群组成员均可以调用 `ChatGroupManager#uploadGroupSharedFile` 方法上传共享文件至群组。

上传共享文件后，其他群成员收到 `ChatGroupEventHandler#onSharedFileAddedFromGroup` 事件。

单个群共享文件大小限制为 10 MB。

示例代码如下：

```dart
try {
  await ChatClient.getInstance.groupManager.uploadGroupSharedFile(
    groupId,
    filePath,
  );
} on ChatError catch (e) {
}
```

#### 下载共享文件

所有群成员均可调用 `downloadGroupSharedFile` 方法下载群组共享文件。

```dart
try {
  // 获取文件列表
  List<ChatGroupSharedFile> list =
      await ChatClient.getInstance.groupManager.fetchGroupFileListFromServer(
    groupId,
    pageNum: 1,
    pageSize: 10,
  );

  if (list.isNotEmpty) {
    await ChatClient.getInstance.groupManager.downloadGroupSharedFile(
      groupId: groupId,
      fileId: list.first.fileId!,
      savePath: savePath,
    );
  }
} on ChatError catch (e) {
  debugPrint('$e');
}
```

#### 删除共享文件

所有群成员均可以调用 `ChatGroupManager#removeGroupSharedFile` 方法删除群共享文件。删除共享文件后，其他群成员收到 `ChatGroupEventHandler#onSharedFileDeletedFromGroup` 事件。

群主和群管理员可删除全部的群共享文件，群成员只能删除自己上传的群文件。

示例代码如下：

```dart
try {
  await ChatClient.getInstance.groupManager.removeGroupSharedFile(
    groupId,
    fileId,
  );
} on ChatError catch (e) {
}
```

#### 从服务器获取共享文件

所有群成员均可以调用 `ChatGroupManager#fetchGroupFileListFromServer` 方法从服务器获取群组的共享文件列表。

示例代码如下：

```dart
try {
  List<ChatGroupSharedFile> list =
      await ChatClient.getInstance.groupManager.fetchGroupFileListFromServer(
    groupId,
    pageNum: pageNum,
    pageSize: pageSize,
  );
} on ChatError catch (e) {
}
```

### 更新群扩展字段

仅群主和群管理员可以调用 `ChatGroupManager#updateGroupExtension` 方法更新群组的扩展字段，群组扩展字段设置 JSON 格式的数据，用于自定义更多群组信息。群扩展字段的长度限制为 8 KB。

示例代码如下：

```dart
try {
  await ChatClient.getInstance.groupManager.updateGroupExtension(
    groupId,
    extension,
  );
} on ChatError catch (e) {
}
```

### 监听群组事件

详见 [监听群组事件](group_manage.html#监听群组事件)。
