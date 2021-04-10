<template>
  <div class="email-activate">
    <div id="confirm" v-show="mailVerify.confirm">
      <div class="box1">
        <h2>{{$t('common_330')}}</h2>
        <div class="desc">{{$t('common_331')}}</div>
        <div class="btn-group">
          <a-button class="btn login" @click="confirmVerification">{{$t('common_332')}}</a-button>
        </div>
      </div>
    </div>

    <div id="error" v-show="mailVerify.error">
      <div>
        <div class="box1">
          <a-icon type="close-circle" theme="twoTone" twoToneColor="#f5222d" />
          <h4>{{$t('common_333')}}</h4>
          <div class="desc">{{$t('common_334')}}</div>
          <div class="btn-group">
            <a-button class="btn login" @click="login">{{$t('common_335')}}</a-button>
          </div>
        </div>
      </div>
    </div>

    <div id="invalid" v-show="mailVerify.invalid">
      <div>
        <div class="box1">
          <a-icon type="close-circle" theme="twoTone" twoToneColor="#f5222d" />
          <h2 style="text-align: center">{{$t('common_336')}}</h2>
          <div class="desc">{{$t('common_337')}}</div>
          <div class="btn-group">
            <a-button class="btn login" @click="login">{{$t('common_335')}}</a-button>
          </div>
        </div>

      </div>
    </div>

    <div id="success" v-show="mailVerify.success">
      <div>
        <div class="box1">
          <a-icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
          <h4 style="text-align: center">{{$t('common_338')}}</h4>
          <div class="desc">{{$t('common_334')}}</div>
          <div class="btn-group">
            <a-button class="btn login" @click="login">{{$t('common_335')}}</a-button>
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
      this.$message.error(this.$t('common_339'))
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
          this.retText = this.$t('common_340')
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
