<template>
  <div class="workflow-error">
    <div class="wrapper">
      <a-icon type="close-circle" class="icon-error mb-3" />
      <h3 class="title">{{errorMsg}}</h3>
      <p class="content">您可以点击【关闭页面】将本页面关闭，也可以点击【登录系统】进行其他任务</p>
      <div>
        <!-- <el-button type="primary" @click="openPage">打开页面</el-button> -->
        <a-button class="mr-2" type="primary" @click="closePage">关闭页面</a-button>
        <a-button @click="openLogin">登录系统</a-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      errorMsg: '',
    }
  },
  created () {
    this.errorMsg = this.$route.query.errorMsg || ''
  },
  methods: {
    closePage () {
      window.close()
    },
    openPage () {
      window.open('/workflow/success')
    },
    openLogin () {
      this.$router.push('/auth/login')
    },
  },
}
</script>

<style lang="scss" scoped>
.workflow-error {
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
  .icon-error {
    font-size: 56px;
    color: #f5222d;
  }
}
</style>
