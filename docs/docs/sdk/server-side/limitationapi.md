# Restful API 调用频率限制

<Toc />

## 概述

### API 的调用频率限制计算

除部分 API 接口有特殊说明外，API 调用频率限制默认为 100 次/秒，你可以按模块查看每个接口的调用频率限制。

在即时通讯 IM 系统中，大部分客户端接口的调用实际上是通过对应的 RESTful API 来实现的。
- 下表中标注 * 的 RESTful API 没有对应的客户端接口，因此它们的调用频率仅由相应的 RESTful API 的调用频率决定。若这些接口的调用频率达到上限，你可以联系声网商务提升。
- 其他接口，其调用频率则为 RESTful API 和对应客户端接口调用频率的总和。若这些接口的调用频率达到上限，你可以查看是否是客户端 API 调用过于频繁。如果需要提升调用频率上限，可联系声网商务。

### 超额计费

每个特性的接口表格列明了接口调用频率上限是否可调，并按收费情况将接口分为 6 种类型，如下表所示：

| RESTful API 类型 | 超额收费  | 
| :-------- | :----- |
| API 类型 1    | 50 QPS，100 元/月    |
| API 类型 2    | 50 QPS，200 元/月    |
| API 类型 3    | 50 QPS，400 元/月    |
| API 类型 4    | 10 次/分钟/App，100 元/月    |
| API 类型 5    | 20 QPS，400 元/月    |
| API 类型 6    | 6000 条/分钟，100 元/月    |

## 消息管理

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率（默认值） | 是否可调 | API 类型 | 超额费用  |
| :-------- | :----- | :---------------- | :--------------------- | :--------------------- | :--------------------- | :--------------------- |
| * 发送单聊消息                 | POST   | /app-id/{app_id}/messages/users | 对于单个 app，该 REST API 存在以下三个限制：<br/> - 100 次/秒/App ID <br/> - 6000 条/分钟  <br/> - 600 人/次。若一次向 600 人发消息，视为 600 条消息。  | 是      |  API 类型 6    | 6000条/分钟，100元/月    | 
| * 发送群聊消息                 | POST   | /app-id/{app_id}/messages/chatgroups           | 对于单个 app，该 REST API 存在以下三个限制：<br/> - 20 条/秒/App ID   <br/> - 20 次/秒 <br/> -  3 个群/次   | 是      |  API 类型 5    | 20QPS，400元/月    |
| * 发送聊天室消息               | POST   | /app-id/{app_id}/messages/chatrooms            | 对于单个 app，该 REST API 存在以下三个限制：<br/> - 100 条/秒  <br/> - 20 次/秒   <br/> -  10 个聊天室/次   | 是      |  API 类型 2    | 50 QPS，200 元/月    |
| * 发送聊天室广播消息 | POST | /app-id/{app_id}/messages/chatrooms/broadcast | 每分钟最多可发 10 次，而且每天最多可发 100 次广播消息。 | 否      |      |  |
| 上传文件  |    POST  | /app-id/{app_id}/chatfiles       | 100 次/秒/App ID  | 是      |  API 类型 1    | 50 QPS，100 元/月    |
| 下载文件      |  GET     | /app-id/{app_id}/chatfiles/{file_uuid}       | 100 次/秒/App ID | 是      |  API 类型 1    | 50 QPS，100 元/月    |
| * 获取历史消息（聊天记录）文件   |  GET     | /app-id/{app_id}/chatmessages/${time}          | 10 次/分钟/App ID   | 是      |  API 类型 4    | 10 次/分钟/App，100 元/月    |
| * 撤回单条消息    |    POST  | /app-id/{app_id}/messages/recall        | 100 次/秒/App ID | 是      |  API 类型 1    | 50 QPS，100 元/月    |
| 单向删除会话   |    DELETE    | /app-id/{app_id}/users/{userName}/user_channel          | 5 次/分钟/单用户 ID，100 次/秒/App ID                                              | 是      |  API 类型 1    | 50 QPS，100 元/月    |
| 修改文本或自定义消息 | PUT  | /app-id/{app_id}/messages/rewrite/{msg_id} | 100 次/秒/App ID  | 是      |  API 类型 2    | 50 QPS，200 元/月    |
| 根据消息 ID 单向删除单聊漫游消息  | DELETE    | /app-id/{app_id}/rest/message/roaming/chat/user/{userId}?userId={userId}&msgIdList={msgIdList}    | 100 次/秒/App ID   | 是      |  API 类型 2    | 50 QPS，200 元/月    |
| 根据消息 ID 单向删除群聊漫游消息  | DELETE    | /app-id/{app_id}/rest/message/roaming/group/user/{userId}?groupId={groupId}&msgIdList={msgIdList}   | 100 次/秒/App ID   | 是      |  API 类型 2    | 50 QPS，200 元/月    |
| 单向清空指定用户的漫游消息 | POST  | /app-id/{app_id}/rest/message/roaming/user/{userId}/delete/all | 100 次/秒/App ID  | 是 |  API 类型 1    | 50 QPS，100 元/月    |
| 单向清空单聊会话某个时间点及之前的漫游消息 | POST  | /app-id/{app_id}/rest/message/roaming/chat/user/{userId}/time?userId={userId}&delTime={delTime} | 100 次/秒/App ID  | 是      |  API 类型 2    | 50 QPS，200 元/月    |
| 单向清空群组或聊天室会话某个时间点及之前的漫游消息 | POST  | /app-id/{app_id}/rest/message/roaming/group/user/{userId}/time?groupId={groupId}&delTime={delTime} | 100 次/秒/App ID  | 是      |  API 类型 2    | 50 QPS，200 元/月    |
| 导入单聊消息 | POST  | /app-id/{app_id}/messages/users/import | 100 条/秒/App ID   | 是      |  API 类型 1    | 50 QPS，100 元/月    |

### 消息表情回复 Reaction

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率（默认值） | 是否可调 | API 类型 | 超额费用  |
| :-------- | :----- | :---------------- | :--------------------- | :--------------------- | :--------------------- | :--------------------- |
| 创建/添加 Reaction         | POST   | /app-id/{app_id}/reaction/user/{userId}   | 100 次/秒/App ID | 是   |  API 类型 2    | 50 QPS，200 元/月    |
| 根据消息 ID 获取 Reaction     | GET    | /app-id/{app_id}/reaction/user/{userId}  | 100 次/秒/App ID  | 是      |  API 类型 3    | 50 QPS，400 元/月    |
| 删除 Reaction     | DELETE | /app-id/{app_id}/reaction/user/{userId} | 100 次/秒/App ID  | 是   |  API 类型 2    | 50 QPS，200 元/月    |
| 根据消息 ID 和表情 ID 获取 Reaction 信息 | GET    | /app-id/{app_id}/reaction/user/{userId}/detail | 100 次/秒/App ID  | 是   |  API 类型 3    | 50 QPS，400 元/月    |

## 群组

### 群组管理

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率（默认值） | 是否可调 | API 类型 | 超额费用  |
| :-------- | :----- | :---------------- | :--------------------- | :--------------------- | :--------------------- | :--------------------- |
| 查看指定用户是否已加入群组 | POST  | /app-id/{app_id}/chatgroups/{group_id}/user/{user_id}/is_joined | 100 次/秒/App ID | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 获取群组详情        |  GET        | /app-id/{app_id}/chatgroups/{group_ids}           | 100 次/秒/App ID  | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 创建群组  |    POST      | /app-id/{app_id}/chatgroups                  | 100 次/秒/App ID   | 是      |  API 类型 1    | 50 QPS，100 元/月    |
| 修改群组信息   |    PUT         | /app-id/{app_id}/chatgroups/{group_id}  | 100 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 解散群组 |    DELETE    | /app-id/{app_id}/chatgroups/{group_id}   | 100 次/秒/App ID   | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 获取群组公告     |  GET     | /app-id/{app_id}/chatgroups/{group_id}/announcement  | 100 次/秒/App ID   |  是  |  API 类型 1    | 50 QPS，100 元/月    |
| 修改群组公告  |    POST| /app-id/{app_id}/chatgroups/{group_id}/announcement          | 100 次/秒/App ID   | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 分页获取群组共享文件   |  GET     | /app-id/{app_id}/chatgroups/{group_id}/share_files?pagenum=1&pagesize=10        | 100 次/秒/App ID   | 是  |  API 类型 1    | 50 QPS，100 元/月    | 
| 上传群组共享文件  |    POST  | /app-id/{app_id}/chatgroups/{group_id}/share_files       | 100 次/秒/App ID | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 下载群组共享文件    |  GET   | /app-id/{app_id}/chatgroups/{group_id}/share_files/{file_id}   | 100 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 删除群组共享文件   |    DELETE   | /app-id/{app_id}/chatgroups/{group_id}/share_files/{file_id}     | 100 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |

### 群成员管理

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率（默认值） | 是否可调 | API 类型 | 超额费用  |
| :-------- | :----- | :---------------- | :--------------------- | :--------------------- | :--------------------- | :--------------------- |
| 分页获取群组成员  |  GET     | /app-id/{app_id}/chatgroups/{group_id}/users       | 100 次/秒/App ID    | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 添加单个群组成员     |    POST | /app-id/{app_id}/chatgroups/{group_id}/users/{username}    | 100 次/秒/App ID  | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 批量添加群组成员    |    POST   | /app-id/{app_id}/chatgroups/{group_id}/users           | 100 次/秒/App ID    | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 移除单个群组成员     |    DELETE    | /app-id/{app_id}/chatgroups/{group_id}/users/{username}    | 100 次/秒/App ID     | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 批量移除群组成员    |    DELETE     | /app-id/{app_id}/chatgroups/{group_id}/users/{usernames}    | 100 次/秒/App ID       | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 获取群管理员列表    |  GET       | /app-id/{app_id}/chatgroups/{group_id}/admin              | 100 次/秒/App ID   | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 添加群管理员     |    POST    | /app-id/{app_id}/chatgroups/{group_id}/admin              | 100 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 移除群管理员     |    DELETE  | /app-id/{app_id}/chatgroups/{group_id}/admin/{oldadmin}    | 100 次/秒/App ID    | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 查询群组黑名单    |    GET   | /app-id/{app_id}/chatgroups/{group_id}/blocks/users       | 100 次/秒/App ID    | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 添加单个用户至群组黑名单   |    POST      | /app-id/{app_id}/chatgroups/{group_id}/blocks/users/{username}    | 100 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 批量添加用户至群组黑名单   |    POST    | /app-id/{app_id}/chatgroups/{group_id}/blocks/users       | 100 次/秒/App ID      | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 从群组黑名单移除单个用户   |    DELETE  | /app-id/{app_id}/chatgroups/{group_id}/blocks/users/{username}    | 100 次/秒/App ID | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 批量从群组黑名单移除用户  |    DELETE  | /app-id/{app_id}/chatgroups/{group_id}/blocks/users/{usernames}    | 100 次/秒/App ID | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 查询群组白名单  |    GET | /app-id/{app_id}/chatgroups/{group_id}/white/users        | 100 次/秒/App ID         | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 添加单个用户至群组白名单 |    POST    | /app-id/{app_id}/chatgroups/{group_id}/white/users/{username}    | 100 次/秒/App ID      | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 批量添加用户至群组白名单|    POST    | /app-id/{app_id}/chatgroups/{group_id}/blocks/users       | 100 次/秒/App ID      | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 将用户移除群组白名单 |    DELETE    | /app-id/{app_id}/chatgroups/{group_id}/white/users/{username}    | 100 次/秒/App ID    | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 获取禁言列表 |    GET    | /app-id/{app_id}/chatgroups/{group_id}/mute              | 100 次/秒/App ID    | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 禁言单个群成员    |    POST    | /app-id/{app_id}/chatgroups/{group_id}/mute               | 100 次/秒/App ID   | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 禁言全体成员    |    POST    | /app-id/{app_id}/chatgroups/{group_id}/ban                | 100 次/秒/App ID    | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 解除成员禁言   |    DELETE   | /app-id/{app_id}/chatgroups/{group_id}/mute/{member1}(,{member2},…)    | 100 次/秒/App ID    | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 解除全员禁言 |    DELETE    | /app-id/{app_id}/chatgroups/{group_id}/ban                | 100 次/秒/App ID     | 是  |  API 类型 1    | 50 QPS，100 元/月    |

## 聊天室

### 聊天室管理

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率（默认值） | 是否可调 | API 类型 | 超额费用  |
| :-------- | :----- | :---------------- | :--------------------- | :--------------------- | :--------------------- | :--------------------- |
| 获取 app 中的聊天室  |    GET   | /app-id/{app_id}/chatrooms?limit={N}&cursor={cursor}   | 50 次/秒/App ID    | 是  |  API 类型 2  | 50 QPS，200 元/月    |
| 获取用户加入的聊天室 | GET       | /app-id/{app_id}/users/{username}/joined_chatrooms         | 50 次/秒/App ID     | 是  |  API 类型 3    | 50 QPS，400 元/月    |
| 获取聊天室详情     |    GET    | /app-id/{app_id}/chatrooms/{chatroom_id}       | 100 次/秒/App ID       | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 创建一个聊天室   |    POST   | /app-id/{app_id}/chatrooms         | 50 次/秒/App ID     | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 修改聊天室信息 |    PUT     | /app-id/{app_id}/chatrooms/{chatroom_id}    | 100 次/秒/App ID      | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 转让聊天室          | PUT    | /app-id/{app_id}/chatrooms/{chatroom_id} | 100 次/秒/App ID    | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 解散聊天室  |  DELETE  | /app-id/{app_id}/chatrooms/{chatroom_id}    | 100 次/秒/App ID     | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 获取聊天室公告  |   GET  | /app-id/{app_id}/chatrooms/{chatroom_id}/announcement      | 100 次/秒/App ID     | 是  |   API 类型 1    | 50 QPS，100 元/月    |
| 修改聊天室公告   |    POST | /app-id/{app_id}/chatrooms/{chatroom_id}/announcement      | 100 次/秒/App ID        |  是  |  API 类型 1    | 50 QPS，100 元/月    |
| 获取聊天室自定义属性 | POST  | /app-id/{app_id}/metadata/chatroom/{chatroom_id} | 100 次/秒/App ID       | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 设置聊天室自定义属性 | PUT  | /app-id/{app_id}/metadata/chatroom/{chatroom_id}/user/{username} | 100 次/秒/App ID       | 是  |  API 类型 3    | 50 QPS，400 元/月    |
| 强制设置聊天室自定义属性 | PUT | /app-id/{app_id}/metadata/chatroom/{chatroom_id}/user/{username}/forced | 100 次/秒/App ID | 是  |  API 类型 3    | 50 QPS，400 元/月    |
| 删除聊天室自定义属性 | DELETE  | /app-id/{app_id}/metadata/chatroom/{chatroom_id}/user/{username} | 100 次/秒/App ID    | 是  |  API 类型 3    | 50 QPS，400 元/月    |
| 强制删除聊天室自定义属性 | DELETE  | /app-id/{app_id}/metadata/chatroom/{chatroom_id}/user/{username}/forced | 100 次/秒/App ID   | 是  |  API 类型 3    | 50 QPS，400 元/月    |

### 聊天室成员管理

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率（默认值） | 是否可调 | API 类型 | 超额费用  |
| :-------- | :----- | :---------------- | :--------------------- | :--------------------- | :--------------------- | :--------------------- |
| 分页获取聊天室成员   |   GET   | /app-id/{app_id}/chatrooms/{chatroom_id}/users          | 100 次/秒/App ID                                                 | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 添加单个聊天室成员    |    POST   | /app-id/{app_id}/chatrooms/{chatroom_id}/users/{username}  | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 批量添加聊天室成员    |    POST   | /app-id/{app_id}/chatrooms/{chatroom_id}/users           | 100 次/秒/App ID                                                 | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 删除单个聊天室成员  |  DELETE   | /app-id/{app_id}/chatrooms/{chatroom_id}/users/{username}  | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 批量删除聊天室成员 |  DELETE   | /app-id/{app_id}/chatrooms/{chatroom_id}/users/{usernames}  | 100 次/秒/App ID                                                 | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 获取聊天室管理员列表    |   GET    | /app-id/{app_id}/chatrooms/{chatroom_id}/admin          | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 添加聊天室管理员  |    POST    | /app-id/{app_id}/chatrooms/{chatroom_id}/admin          | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 移除聊天室管理员   |  DELETE    | /app-id/{app_id}/chatrooms/{chatroom_id}/admin/{oldadmin}  | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 查询聊天室黑名单    |   GET   | /app-id/{app_id}/chatrooms/{chatroom_id}/blocks/users   | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 添加单个用户至聊天室黑名单 |    POST    | /app-id/{app_id}/chatrooms/{chatroom_id}/blocks/users/{username}  | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 批量添加用户至聊天室黑名单  |    POST     | /app-id/{app_id}/chatrooms/{chatroom_id}/blocks/users   | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 从聊天室黑名单移除单个用户   |  DELETE     | /app-id/{app_id}/chatrooms/{chatroom_id}/blocks/users/{username}  | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 批量从聊天室黑名单移除用户   |  DELETE     | /app-id/{app_id}/chatrooms/{chatroom_id}/blocks/users/{usernames}  | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 查询聊天室白名单   |   GET   | /app-id/{app_id}/chatrooms/{chatroom_id}/white/users`   | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 添加单个用户至聊天室白名单  |    POST     | /app-id/{app_id}/chatrooms/{chatroom_id}/white/users/{username}  | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 批量添加用户至聊天室白名单   |    POST    | /app-id/{app_id}/chatrooms/{chatroom_id}/white/users    | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 将用户移除聊天室白名单  |  DELETE       | /app-id/{app_id}/chatrooms/{chatroom_id}/white/users/{username}  | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 获取聊天室的禁言列表  |   GET   | /app-id/{app_id}/chatrooms/{chatroom_id}/mute           | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 禁言聊天室成员   |    POST    | /app-id/{app_id}/chatrooms/{chatroom_id}/mute           | 100 次/秒/App ID                                                 |
| 禁言聊天室全体成员    |    POST  | /app-id/{app_id}/chatrooms/{chatroom_id}/ban            | 100 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 解除聊天室禁言成员   |  DELETE     | /app-id/{app_id}/chatrooms/{chatroom_id}/mute/{member1}(,{member2},…)  | 100 次/秒/App ID      | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 解除聊天室全员禁言    |  DELETE     | /app-id/{app_id}/chatrooms/{chatroom_id}/ban            | 100 次/秒/App ID   | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 获取超级管理员列表   |   GET    | /app-id/{app_id}/chatrooms/super_admin                  | 100 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 添加超级管理员   |    POST    | /app-id/{app_id}/chatrooms/super_admin                  | 100 次/秒/App ID   | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 移除超级管理员    |  DELETE    | /app-id/{app_id}/chatrooms/super_admin/{superAdmin}     | 100 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |

## 用户相关

###  用户体系管理

| Restful API 接口 |方法  | 接口 URL|
| :------------ | :--- | :--------------------------- |
| 注册单个/批量用户  |  POST  | /app-id/{app_id}/users    | 是  |  API 类型 1    | 50 QPS，100 元/月    |

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率（默认值） |
| :----------- | :----- | :------------------- | :------------- |
| 获取单个用户  |  GET | /app-id/{app_id}/users/{username}   | 100 次/秒/App ID   | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 设置推送消息显示昵称/展示方式 | PUT  | /app-id/{app_id}/users/{userId} | 100 次/秒/App ID | 否  |     |     |
| * 批量获取用户 |  GET  | /app-id/{app_id}/users      | 100 次/秒/App ID| 是  |  API 类型 1    | 50 QPS，100 元/月    |
| * 删除单个用户 |  DELETE  | /app-id/{app_id}/users/{username}         | 100 次/秒/App ID | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| * 批量删除用户 |  DELETE   | /app-id/{app_id}/users  | 30 次/秒/App ID   | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| * 修改用户密码  |  POST | /app-id/{app_id}/users/{username}/password   | 100 次/秒/App ID   | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| * 获取用户在线状态  |  GET | /app-id/{app_id}/users/{username}/status   | 100 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| * 批量获取用户在线状态  |  POST    | /app-id/{app_id}/users/batch/status  | 50 次/秒/App ID | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| * 获取离线消息数       |  GET     | /app-id/{app_id}/users/{owner_username}/offline_msg_count    | 100 次/秒/App ID | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| * 获取离线消息的状态    |  GET   | /app-id/{app_id}/users/{username}/offline_msg_status/{msg_id}   | 100 次/秒/App ID   | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| * 账号封禁   |  POST     | /app-id/{app_id}/users/{username}/deactivate          | 100 次/秒/App ID     | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| * 账号解禁    |  POST                    | /app-id/{app_id}/users/{username}/activate         | 100 次/秒/App ID      | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| * 强制用户下线         |  GET    | /app-id/{app_id}/users/{username}/disconnect    | 100 次/秒/App ID   | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| * 强制用户从单设备下线 | DELETE | /app-id/{app_id}/users/{username}/disconnect/{resourceId} | 100 次/秒/App ID | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| * 获取指定账号的在线登录设备列表    | GET  | /app-id/{app_id}/users/{username}/resources | 100 次/秒/App ID  | 是  |  API 类型 2    | 50 QPS，200 元/月    |

### 用户属性

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率（默认值） |
| :---------- | :----- | :-------------------- | :---------------- |
| 设置用户属性      | PUT     | /app-id/{app_id}/metadata/user/{username}            | 100 次/秒/App ID | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 批量获取用户属性    | POST      | /app-id/{app_id}/metadata/user/get           | 100 次/秒/App ID    | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 删除用户属性   | DELETE     | /app-id/{app_id}/metadata/user/{username}      | 100 次/秒/App ID  |是  |  API 类型 1    | 50 QPS，100 元/月    |
| 获取指定用户的所有用户属性   | GET     | /app-id/{app_id}/metadata/user/{username}      | 100 次/秒/App ID | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| * 获取 app 下的用户属性总大小   | GET     | /app-id/{app_id}/metadata/user/capacity   | 100 次/秒/App ID | 是  |  API 类型 1    | 50 QPS，100 元/月    |

### 用户在线状态订阅

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率（默认值） |
| :--------------- |:------ | :------------  | :----------- |
| 设置用户在线状态信息  |  POST     | /app-id/{app_id}/users/{uid}/presence/{resource}/{status} | 50 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 批量订阅在线状态    |  POST      | /app-id/{app_id}/users/{uid}/presence/{expiry}         | 50 次/秒/App ID   | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 批量获取在线状态信息    |  POST   | /app-id/{app_id}/users/{uid}/presence                  | 50 次/秒/App ID | 是  | API 类型 2    | 50 QPS，200 元/月    |
| 查询单个群组的在线成员数量    |  GET   | /app-id/{app_id}/presence/online/{group_id}/type/{query_type}  | 100 次/秒/App ID | 是  |  API 类型 2    | 50 QPS，200 元/月    |
| 取消订阅多个用户的在线状态     |  DELETE           | /app-id/{app_id}/users/{uid}/presence                  | 50 次/秒/App ID    | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 查询订阅列表    |   GET       | /app-id/{app_id}/users/{uid}/presence/sublist?pageNum={pagenumber}&pageSize={pagesize} | 50 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |

### 全局禁言

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率（默认值） |
| :--------------- |:------ | :------------  | :----------- |
| * 设置用户全局禁言  |  POST      | /app-id/{app_id}/mutes         | 100 次/秒/App ID  | 是  | API 类型 2    | 50 QPS，200 元/月    |
| * 查询单个用户 ID 全局禁言 |   GET   | /{org_name}/{appName}/mutes/username  | 100 次/秒/App ID  | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| * 查询 app 下的所有全局禁言的用户  |   GET  | /app-id/{app_id}/mutes        | 100 次/秒/App ID  | 是  | API 类型 2    | 50 QPS，200 元/月    |

### 用户关系管理

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率 |
| :------------- | :----- | :---------------- | :-------------- |
| 添加好友   | POST   | /app-id/{app_id}/users/{owner_username}/contacts/users/{friend_username}    | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 移除好友    | DELETE | /app-id/{app_id}/users/{owner_username}/contacts/users/{friend_username}    | 100 次/秒/App ID                                                 | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 设置好友备注 | PUT | /app-id/{app_id}/user/{owner_username}/contacts/users/{friend_username} | 100 次/秒/App ID | 是  | API 类型 2    | 50 QPS，200 元/月    |
| 一次性获取好友列表    |  GET  | /app-id/{app_id}/users/{owner_username}/contacts/users   | 100 次/秒/App ID   | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 获取黑名单列表     | GET   | /app-id/{app_id}/users/{owner_username}/blocks/users   | 50 次/秒/App ID                                                  | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 添加用户至黑名单    | POST  | /app-id/{app_id}/users/{owner_username}/blocks/users    | 50 次/秒/App ID                                                  | 是  |  API 类型 1    | 50 QPS，100 元/月    |
| 从黑名单移除用户 | DELETE  | /app-id/{app_id}/users/{owner_username}/blocks/users/{blocked_username}   | 50 次/秒/App ID                                                  | 是  |  API 类型 1    | 50 QPS，100 元/月    |

## 回调

| RESTful API 接口 |方法  | 接口 URL| 接口最高调用频率（默认值） | 是否可调 | API 类型 | 超额费用  |
| :-------- | :----- | :---------------- | :--------------------- | :--------------------- | :--------------------- | :--------------------- |
|  查询回调储存详情   | GET   | /app-id/callbacks/storage/info   | 100 次/秒/App Key   | 是  |  API 类型 2    | 50 QPS，200 元/月    |
|  补发回调存储信息 | POST   | /app-id/callbacks/storage/retry  | 100 次/秒/App Key   | 是  |  API 类型 2    | 50 QPS，200 元/月    |
