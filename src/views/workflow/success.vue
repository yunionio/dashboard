<template>
  <div class="workflow-success">
    <div class="wrapper">
      <a-icon type="check-circle" class="icon-success mb-4" />
      <h3 class="title">{{$t('common_647')}}</h3>
      <p class="content">{{$t('common_644')}}</p>
      <div>
        <a-button class="mr-2" type="primary" @click="closePage">{{$t('common_646')}}</a-button>
        <a-button @click="openLogin">{{$t('common_335')}}</a-button>
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
