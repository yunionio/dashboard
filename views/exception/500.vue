<template>
  <a-result status="500" title="500" subTitle="抱歉，服务器出错了">
    <template v-slot:extra>
      <a-button type="primary">
        <router-link to="/">返回首页</router-link>
      </a-button>
    </template>
  </a-result>
</template>
