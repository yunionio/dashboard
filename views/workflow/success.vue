<template>
  <div class="workflow-success">
    <div class="wrapper">
      <a-icon type="check-circle" class="icon-success mb-4" />
      <h3 class="title">工单审批完成</h3>
      <p class="content">您可以点击【关闭页面】将本页面关闭，也可以点击【登录系统】进行其他任务</p>
      <div>
        <a-button class="mr-2" type="primary" @click="closePage">关闭页面</a-button>
        <a-button @click="openLogin">登录系统</a-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    closePage () {
      window.close()
    },
    openLogin () {
      this.$router.push('/auth/login')
    },
  },
}
</script>

<style lang="scss" scoped>
.workflow-success {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  .wrapper {
    text-align: center;
    .title {
      font-size: 16px;
      color: #262627;
    }
    .content {
      font-size: 14px;
      color: #8d8f90;
    }
  }
  .icon-success {
    font-size: 56px;
    color: #52c419;
  }
}
</style>
