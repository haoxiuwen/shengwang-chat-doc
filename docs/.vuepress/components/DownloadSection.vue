<template>
  <section class="download-section">
    <h2>资源下载</h2>
    <p class="description">
      从下面选项中选择合适 SDK 下载并集成到你的应用中，以快速接入即时通讯服务。
    </p>

    <div class="compliance-card">
      <div class="compliance-title">SDK 合规信息公示</div>
      <p><strong>功能介绍：</strong>为开发者提供低延时、高并发、可扩展、高可靠的实时消息及状态同步网络服务。</p>
      <p><strong>基本信息：</strong></p>
      <p>【SDK 名称】即时通讯 SDK；【开发者】上海声网科技有限公司。</p>
      <p>
        【使用说明】<a href="https://im.shengwang.cn/docs/sdk/android/security.html" target="_blank" rel="noopener noreferrer">《即时通讯 SDK 合规使用说明》</a>；
        【个人信息处理规则】<a href="https://www.shengwang.cn/SDK-privacy-policy/" target="_blank" rel="noopener noreferrer">《SDK个人信息处理规则》</a>
      </p>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>适用平台</th>
            <th>语言</th>
            <th>最低版本</th>
            <th>包名</th>
            <th>MD5 值</th>
            <th>更新日期</th>
            <th>更新日志</th>
            <th>下载</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in clientSDKDownloadInfo" :key="`${item.platform}-${item.language}`">
            <td>{{ item.platform }}</td>
            <td>{{ item.language }}</td>
            <td>{{ item.version }}</td>
            <td>{{ item.package }}</td>
            <td>{{ item.md5 }}</td>
            <td>{{ item.updateTime }}</td>
            <td><a :href="item.releaseNote">点击查看</a></td>
            <td><a :href="item.downloadLink" target="_blank" rel="noopener noreferrer">下载</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { clientSDKDownloadInfo } from "../data/download.js";
</script>

<style scoped>
.download-section {
  margin-top: 3rem;
}

.download-section h2 {
  margin: 0 0 1rem;
  color: #242f3d;
  font-size: 2rem;
}

.description {
  color: #505e72;
  line-height: 1.5;
}

.compliance-card {
  margin: 1.5rem 0;
  padding: 1.25rem 1.5rem;
  border: 1px solid #dcecf7;
  border-radius: 0.5rem;
  background: #f5fbff;
  color: #303a48;
  line-height: 1.6;
}

.compliance-title {
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.compliance-card p {
  margin: 0.45rem 0;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  background: #fff;
}

th,
td {
  padding: 0.75rem 0.6rem;
  border: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}

th {
  background: #f5f7fa;
  color: #303a48;
  font-weight: 600;
}

a {
  color: #2d85e9;
}
</style>
