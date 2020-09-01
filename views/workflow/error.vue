<template>
  <div class="workflow-error">
    <div class="wrapper">
      <a-icon type="close-circle" class="icon-error mb-3" />
      <h3 class="title">{{errorMsg}}</h3>
      <p class="content">{{$t('common_644')}}</p>
      <div>
        <!-- <el-button type="primary" @click="openPage">{{$t('common_645')}}</el-button> -->
        <a-button class="mr-2" type="primary" @click="closePage">{{$t('common_646')}}</a-button>
        <a-button @click="openLogin">{{$t('common_335')}}</a-button>
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
