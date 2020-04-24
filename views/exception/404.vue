<template>
  <a-result status="404" title="404" subTitle="抱歉，你访问的页面不存在或仍在开发中">
    <template v-slot:extra>
      <a-button type="primary">
        <router-link to="/">返回首页</router-link>
      </a-button>
    </template>
  </a-result>
</template>
