<template>
  <a-result status="403" title="403" subTitle="抱歉，你无权访问该页面">
    <template v-slot:extra>
      <a-button type="primary">
        <router-link to="/">返回首页</router-link>
      </a-button>
    </template>
  </a-result>
</template>
