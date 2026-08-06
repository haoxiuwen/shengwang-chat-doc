import { sidebar } from "vuepress-theme-hope";
import { DOC_SIDEBAR } from "./document-v4";
import { DOC_V5_SIDEBAR } from "./document";
import { PRIVATE_IM_SIDEBAR, PRIVATE_MEDIA_SIDEBAR } from "./private";
import { CALL_KIT_SIDEBAR } from "./callkit";
import { PUSH_SIDEBAR } from "./push";
import { TRANSLATION_SIDEBAR } from "./translation";

export const zhSidebar = sidebar({
  "/product/": [
    { text: "产品动态", link: "product_dynamics.html" },
    { text: "产品简介", link: "introduction.html" },
    { type: "separator" } as any,
    { text: "购买指南", 
      collapsible: true,
      children: [
        { text: "计费策略", link: "pricing_policy.html"},
        { text: "套餐包功能对比", link: "product_package_feature.html"},
        { text: "购买指引", link: "pricing_method.html" },
      ],
    }, 
    { text: "功能介绍", 
      collapsible: true,
      children: [
        { text: "功能列表", link: "product_function.html" },
        { text: "各类会话的功能", link: "conversation_function.html" },
        { text: "功能详情", 
          collapsible: true,
          children: [
            { text: "用户相关", 
              collapsible: true,
              children: [
              { text: "用户注册与登录", link: "product_user_registration_login.html" },
              { text: "在线状态管理", link: "product_user_presence.html" },
              { text: "用户属性", link: "product_user_attribute.html" },
              { text: "用户关系", link: "product_user_relationship.html" },
              ],
             },
             { text: "消息管理", 
               collapsible: true,
               children: [
                { text: "单聊消息", link: "message_single_chat.html" },
                { text: "群组消息", link: "message_group.html" },
                { text: "聊天室消息", link: "message_chatroom.html" },
                { text: "消息存储", link: "message_store.html" },
                { text: "消息格式", link: "product_message_format.html" },
               ],
              },
              { text: "离线推送", link: "product_offline_push_overview.html" },
              { text: "群组管理", 
                collapsible: true,
                children: [
                { text: "群组概述", link: "product_group_overview.html" },
                { text: "消息话题", link: "product_thread_overview.html" },
                ],
              },
              { text: "聊天室", link: "product_chatroom_overview.html" },
            ],
          },
        ],
      },
    { text: "使用限制", link: "limitation.html" },
    { text: "数据中心", link: "data_center.html" },
    {
      text: "常见方案",
      collapsible: true,
      children: [
        {
          text: "环信 AIGC",
          collapsible: true,
          children: [
            { text: "方案介绍", link: "aigc_solution/aigc_introduction.html" },
            { text: "架构与示例项目", link: "aigc_solution/aigc_architecture.html" },
            { text: "服务端配置", link: "aigc_solution/aigc_run_through_demo_server.html" },
            { text: "客户端配置", link: "aigc_solution/aigc_run_through_demo_client.html" },
          ], 
        },   
        {
          text: "超级社区",
          collapsible: true,
          children: [
            { text: "产品概述", link: "circle/circle_overview.html" },
            {
              text: "快速开始",
              collapsible: true,
              children: [
                {
                  text: "Android 快速开始",
                  link: "circle/circle_quickstart_android.html",
                },
                {
                  text: "iOS 快速开始",
                  link: "circle/circle_quickstart_ios.html",
                },
                {
                  text: "Web 快速开始",
                  link: "circle/circle_quickstart_web.html",
                },
              ],
            },
            {
              text: "集成说明",
              collapsible: true,
              children: [
                {
                  text: "Android 社区管理",
                  link: "circle/server_mgmt_android.html",
                },
                {
                  text: "Android 频道管理",
                  link: "circle/channel_mgmt_android.html",
                },
                {
                  text: "Android 频道分组管理",
                  link: "circle/category_mgmt_android.html",
                },
                { text: "iOS 社区管理", link: "circle/server_mgmt_ios.html" },
                { text: "iOS 频道管理", link: "circle/channel_mgmt_ios.html" },
                {
                  text: "iOS 频道分组管理",
                  link: "circle/category_mgmt_ios.html",
                },
                { text: "Web 社区管理", link: "circle/server_mgmt_web.html" },
                { text: "Web 频道管理", link: "circle/channel_mgmt_web.html" },
                {
                  text: "Web 频道分组管理",
                  link: "circle/category_mgmt_web.html",
                },
              ],
            },
            {
              text: "错误码",
              collapsible: true,
              children: [
                {
                  text: "Android 错误码",
                  link: "circle/circle_errorcode_android.html",
                },
                {
                  text: "iOS 错误码",
                  link: "circle/circle_errorcode_ios.html",
                },
                {
                  text: "Web 错误码",
                  link: "circle/circle_errorcode_web.html",
                },
              ],
            },
            {
              text: "API 参考",
              collapsible: true,
              children: [
                { text: "REST 社区管理", link: "circle/server_mgmt_rest.html" },
                {
                  text: "REST 频道管理",
                  link: "circle/channel_mgmt_rest.html",
                },
                {
                  text: "REST 频道分组管理",
                  link: "circle/category_mgmt_rest.html",
                },
                {
                  text: "Android API 参考",
                  link: "circle/api_reference_android.html",
                },
                { text: "iOS API 参考", link: "circle/api_reference_ios.html" },
                { text: "Web API 参考", link: "circle/api_reference_web.html" },
              ],
            },
          ],
        },
        {
          text: "语聊房",
          collapsible: true,
          children: [
            {
              text: "场景概览",
              collapsible: true,
              children: [
                {
                  text: "场景介绍",
                  link: "voiceroom/demo_scenario_introduction.html",
                },
                {
                  text: "Demo 体验（Android/iOS）",
                  link: "voiceroom/demo_experience.html",
                },
              ],
            },
            {
              text: "快速开始",
              collapsible: true,
              children: [
                {
                  text: "跑通 Android 示例项目",
                  link: "voiceroom/run_through_demo_android.html",
                },
                {
                  text: "跑通 iOS 示例项目",
                  link: "voiceroom/run_through_demo_ios.html",
                },
              ],
            },
            {
              text: "实现流程",
              collapsible: true,
              children: [
                {
                  text: "Android 客户端实现",
                  link: "voiceroom/client_implementation_android.html",
                },
                {
                  text: "iOS 客户端实现",
                  link: "voiceroom/client_implementation_ios.html",
                },
              ],
            },
          ],
        },
      ],
    },
    // {
    //   text: "Demo",
    //   collapsible: true,
    //   children: [
    //     { text: "体验 Demo", link: "demo.html" },
    //   ],
    // },
    // {
    //   text: "增值服务",
    //   collapsible: true,
    //   children: [
    //    {
    //   text: "消息翻译",
    //   collapsible: true,
    //   children: [
    //     { text: "Android", link: "message_translation_android.html" },
    //     { text: "iOS", link: "message_translation_ios.html" },
    //     { text: "Web", link: "message_translation_web.html" },
    //     { text: "小程序", link: "message_translation_applet.html" },
    //     { text: "Flutter", link: "message_translation_flutter.html" },
    //     { text: "React Native", link: "message_translation_react-native.html" },
    //     { text: "Unity", link: "message_translation_unity.html" },
    //     { text: "Windows", link: "message_translation_windows.html" },
    //   ],
    // }, 
    //   
    //  ],
    // },
    // {
    //  text: "常见方案",
    //  collapsible: true,
    //  children: [
    //    { text: "群 @ 消息", link: "solution_common/group_@.html" },
    //    { text: "消息引用", link: "solution_common/message_quote.html" },
    //    { text: "实现输入指示器", link: "solution_common/typing_indication.html" },
    //    { text: "迁移到环信", link: "solution_common/migrate_to_easemob.html" },
    //  ],
    //},
    {
      text: "安全",
      collapsible: true,
      children: [
        { text: "安全最佳实践", link: "security_best_practices.html" },
        { text: "GDPR 安全合规", link: "GDPR.html" },
        {text: "SDK合规使用说明", link:"https://www.easemob.com/news/privacy"},
      ],
    },
    // {
    //   text: "帮助中心",
    //   collapsible: true,
    //   children: [
    //   {
    //   text: "FAQ",
    //   collapsible: true,
    //   children: [
    //     { text: "FAQ 质量", link: "faq_quality_issues.html" },
    //     { text: "FAQ 集成", link: "faq_integration_issues.html" },
    //     ],
    //   },
      
    //  ],
    // },
    { text: "术语表", link: "glossary.html" },
    { type: "separator" } as any,
    { text: "帮助中心", link: "help.html" },
    {
      text: "已废弃内容",
      collapsible: true,
      children: [
        {
          text: "环信 AIGC",
          collapsible: true,
          children: [
            { text: "方案介绍", link: "aigc_api/aigc_introduction.html" },
            { text: "使用 AI 智能功能", link: "aigc_api/aigc_use.html" },
            { text: "REST API", link: "aigc_api/aigc_rest_api.html" },
          ], 
        }, 
      ], 
    },   
  ],
  ...DOC_SIDEBAR,
  ...DOC_V5_SIDEBAR,
  ...CALL_KIT_SIDEBAR,
  "/private/im/": PRIVATE_IM_SIDEBAR,
  "/private/media/": PRIVATE_MEDIA_SIDEBAR,
  "/value-added/push":PUSH_SIDEBAR,
  "/value-added/translation":TRANSLATION_SIDEBAR,
});
