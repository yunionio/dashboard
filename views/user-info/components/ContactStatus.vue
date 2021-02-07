<template>
  <span>
    <a-tooltip :title="statusDictTips">
      <a-icon
        :type="statusIcon[status]"
        :style="{ color: statusColor[status] }"
        @click="handleIconClick" />
    </a-tooltip>
    <a-modal
      :title="$t('scope.text_199')"
      width="600px"
      :visible="mobileDialog.visible"
      @cancel="() => mobileDialog.visible = false"
      destroyOnClose>
      <template v-slot:footer>
        <a-button key="submit" type="primary" :loading="mobileDialog.loading" @click="doVerifyMobile">{{$t('scope.text_14')}}</a-button>
        <a-button key="back" @click="() => mobileDialog.visible = false">{{$t('scope.text_152')}}</a-button>
      </template>
      <a-form :form="mobileForm.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('scope.text_200')">
          {{ contact }}
        </a-form-item>
        <a-form-item :label="$t('scope.text_201')">
          <div class="d-flex">
            <a-input v-decorator="mobileDecorators.code" style="max-width: 100px;" />
            <a-button type="link" class="flex-grow-0 flex-shrink-0" @click="getMobileVerifyCode" :disabled="codeButtonDisable" style="width: 150px; border-left-width: 0;">{{ codeButtonText }}</a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal
      :title="$t('scope.text_202')"
      width="600px"
      :visible="emailDialog.visible"
      @cancel="() => emailDialog.visible = false"
      :okText="$t('scope.text_203')"
      destroyOnClose>
      <template v-slot:footer>
        <a-button key="submit" type="primary" :loading="emailDialog.loading" @click="doVerifyEmail">{{$t('scope.text_14')}}</a-button>
        <a-button key="back" @click="() => emailDialog.visible = false">{{$t('scope.text_152')}}</a-button>
      </template>
      <a-form :form="emailForm.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('scope.text_204')" :help="$t('scope.text_205')">
          {{ contact }}
        </a-form-item>
        <a-form-item :label="$t('scope.text_201')">
          <div class="d-flex">
            <a-input v-decorator="emailDecorators.code" style="max-width: 100px;" />
            <a-button type="link" class="flex-grow-0 flex-shrink-0" @click="getEmailVerifyCode" :disabled="codeButtonDisable" style="width: 150px; border-left-width: 0;">{{ codeButtonText }}</a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </span>
</template>

<script>
import Cookies from 'js-cookie'
import { mapGetters } from 'vuex'

export default {
  name: 'ContactStatus',
  props: {
    type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      processId: '',
      codeButtonText: this.$t('scope.text_206'),
      codeButtonDisable: false,
      mobileForm: {
        fc: this.$form.createForm(this),
      },
      emailForm: {
        fc: this.$form.createForm(this),
      },
      mobileDialog: {
        loading: false,
        visible: false,
      },
      emailDialog: {
        loading: false,
        visible: false,
      },
      formItemLayout: {
        labelCol: {
          sm: { span: 3 },
        },
        wrapperCol: {
          sm: { span: 21 },
        },
      },
      statusColor: {
        init: '#f5222d',
        verified: '#52c41a',
        verifying: '#faad14',
      },
      statusIcon: {
        init: 'info-circle',
        verified: 'check-circle',
        verifying: 'loading',
      },
      contactDict: {
        mobile: this.$t('scope.text_207'),
        email: this.$t('scope.text_204'),
      },
      codeDict: {
        mobile: this.$t('scope.text_201'),
        email: this.$t('scope.text_208'),
      },
      mobileDecorators: {
        code: [
          'code',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('scope.text_209') },
              {
                pattern: '[0-9]{6}',
                message: this.$t('scope.text_210'),
              },
            ],
          },
        ],
      },
      emailDecorators: {
        code: [
          'code',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('scope.text_209') },
              {
                pattern: '[0-9]{6}',
                message: this.$t('scope.text_210'),
              },
            ],
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    statusDictForEdit () {
      return {
        init: this.$t('scope.text_211', [this.contactDict[this.type]]),
        verifying: this.$t('scope.text_212', [this.codeDict[this.type]]),
        verified: this.$t('scope.text_213', [this.contactDict[this.type]]),
      }
    },
    statusDictForReadOnly () {
      return {
        init: this.$t('scope.text_214', [this.contactDict[this.type]]),
        verifying: this.$t('scope.text_217', [this.codeDict[this.type]]),
        verified: this.$t('scope.text_213', [this.contactDict[this.type]]),
      }
    },
    statusDictTips () {
      return this.statusDictForEdit[this.status]
    },
  },
  destroyed () {
    this.manager = null
    this.vm = null
    clearInterval(this.codeInt)
  },
  created () {
    this.manager = new this.$Manager('receivers', 'v1')
    this.vm = new this.$Manager('verifications', 'v1')
  },
  methods: {
    handleIconClick () {
      if (this.status === 'verified' || !this.status) {
        return null
      }
      if (this.type === 'email') {
        this.emailDialog.visible = true
        return
      }
      this.mobileDialog.visible = true
    },
    async getMobileVerifyCode () {
      try {
        const response = await this.manager.performAction({
          id: this.userInfo.id,
          action: 'verify',
          data: {
            contact: this.contact,
            contact_type: 'mobile',
          },
        })
        if (response.data.process_id && response.data.process_id.length > 0) {
          this.processId = response.data.process_id
        }
        if (response.data && response.data.message) {
          return this.$message.warning(response.data.message)
        }
        if (!(response.data && response.data.process_id)) {
          return this.$message.error(this.$t('scope.text_218'))
        }
        let sec = 120
        this.codeButtonDisable = true
        this.codeButtonText = this.$t('scope.text_219', [sec])

        this.codeInt = setInterval(() => {
          sec -= 1
          const text = this.$t('scope.text_219', [sec])
          this.codeButtonText = text
          if (sec <= 0) {
            this.codeButtonDisable = false
            this.codeButtonText = this.$t('scope.text_206')
            clearInterval(this.codeInt)
          }
        }, 1000)
      } catch (error) {
        throw error
      }
    },
    async doVerifyMobile () {
      this.mobileDialog.loading = true
      try {
        const values = await this.mobileForm.fc.validateFields()
        if (!this.processId || this.processId.length <= 0) {
          this.$message.error(this.$t('scope.text_220'))
        } else {
          const response = await this.vm._csrfGet({
            id: this.processId,
            words: [],
            params: {
              token: values.code,
              region: Cookies.get('region'),
            },
          })
          if (response.data.code === 400) {
            this.$message.error(this.$t('scope.text_221'))
          } else {
            this.mobileDialog.visible = false
            this.$message.success(this.$t('scope.text_222'))
            this.$emit('refresh')
          }
        }
      } catch (error) {
        throw error
      } finally {
        this.mobileDialog.loading = false
      }
    },
    async getEmailVerifyCode () {
      try {
        await this.manager.performAction({
          id: this.userInfo.id,
          action: 'trigger-verify',
          data: {
            contact: this.contact,
            contact_type: 'email',
          },
        })
        let sec = 120
        this.codeButtonDisable = true
        this.codeButtonText = this.$t('scope.text_219', [sec])

        this.codeInt = setInterval(() => {
          sec -= 1
          const text = this.$t('scope.text_219', [sec])
          this.codeButtonText = text
          if (sec <= 0) {
            this.codeButtonDisable = false
            this.codeButtonText = this.$t('scope.text_206')
            clearInterval(this.codeInt)
          }
        }, 1000)
      } catch (error) {
        throw error
      }
    },
    async doVerifyEmail () {
      this.emailDialog.loading = true
      try {
        const values = await this.emailForm.fc.validateFields()
        await this.manager.performAction({
          id: this.userInfo.id,
          action: 'verify',
          data: {
            contact: this.contact,
            contact_type: 'email',
            token: values.code,
          },
        })
        this.emailDialog.visible = false
        this.$emit('refresh')
      } catch (error) {
        throw error
      } finally {
        this.emailDialog.loading = false
      }
    },
  },
}
</script>
