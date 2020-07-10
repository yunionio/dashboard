<template>
  <div class="email-activate">
    <div id="confirm" v-show="mailVerify.confirm">
      <div class="box1">
        <h2>用户邮箱激活</h2>
        <div class="desc">请点击【确认激活】的按钮，完成OneCloud系统内用户邮箱的激活</div>
        <div class="btn-group">
          <a-button class="btn login" @click="confirmVerification">确认激活</a-button>
        </div>
      </div>
    </div>

    <div id="error" v-show="mailVerify.error">
      <div>
        <div class="box1">
          <a-icon type="close-circle" theme="twoTone" twoToneColor="#f5222d" />
          <h4>你的邮箱：激活失败</h4>
          <div class="desc">你可以点击【登录系统】按钮来进入OneCloud系统</div>
          <div class="btn-group">
            <a-button class="btn login" @click="login">登录系统</a-button>
          </div>
        </div>
      </div>
    </div>

    <div id="invalid" v-show="mailVerify.invalid">
      <div>
        <div class="box1">
          <a-icon type="close-circle" theme="twoTone" twoToneColor="#f5222d" />
          <h2 style="text-align: center">激活链接失效/不合法</h2>
          <div class="desc">验证时间已超过24小时，需要重新发送激活链接/激活链接不合法，更正后重试</div>
          <div class="btn-group">
            <a-button class="btn login" @click="login">登录系统</a-button>
          </div>
        </div>

      </div>
    </div>

    <div id="success" v-show="mailVerify.success">
      <div>
        <div class="box1">
          <a-icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
          <h4 style="text-align: center">您的邮箱已经激活成功</h4>
          <div class="desc">你可以点击【登录系统】按钮来进入OneCloud系统</div>
          <div class="btn-group">
            <a-button class="btn login" @click="login">登录系统</a-button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
export default {
  components: {},
  props: {
    str: {
      type: String,
      required: false,
    },
  },
  data () {
    return {
      mailVerify: {
        confirm: true,
        error: false,
        invalid: false,
        success: false,
      },
      id: '',
      token: '',
      retclass: '',
      retText: '',
    }
  },
  created () {
    const id = this.$route.params.id
    const token = this.$route.params.token
    if (!id || !token) {
      this.$message.error('不合法的网址')
    }
    this.id = id
    this.token = token
  },
  methods: {
    login () {
      this.$router.push('/')
    },
    confirmVerification () {
      const manager = new this.$Manager('verifications', 'v1')
      this.mailVerify.confirm = false
      manager._csrfGet({ id: this.id, words: [], params: { token: this.token, region: this.$route.query.region } })
        .then(res => {
          if (res.data.code === 400) {
            this.mailVerify.invalid = true
          } else {
            this.mailVerify.success = true
          }
        })
        .catch((err) => {
          this.retText = '错误的请求'
          console.log('err', err)
          this.mailVerify.error = true
        })
    },
  },
}
</script>

<style scoped lang="less">
  .email-activate {
    h2 {
      text-align: center;
      font-weight: bold;
      font-size: 1.5em;
      margin: 20px 0;
    }
    h4 {
      font-size: 16px;
      text-align: center;
      font-weight: bold;
      margin: 20px 0;
    }
    .box1 {
      width: 540px;
      height: 540px;
      margin: 300px auto;
      text-align: center;
    }
    .box1::v-deep .anticon {
      font-size: 30px;
    }
    .desc {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.447058823529412);
      text-align: center;
    }
    .btn-group {
      width: max-content;
      height: 32px;
      margin: 30px auto 0;
    }
    .btn {
      width: 80px;
      margin-right: 6px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      font-size: 14px;
      border: none;
      outline: none;
      cursor: pointer;
      border-radius: 4px;
      padding: 0;
    }
    .login {
      background-color: rgba(24, 144, 255, 1);
      color: #fff;
    }
  }
</style>
