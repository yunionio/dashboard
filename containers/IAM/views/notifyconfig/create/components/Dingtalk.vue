<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout"
    hideRequiredMark>
    <a-form-item label="AgentId">
      <template v-slot:extra>
        <div>{{$t('system.text_257')}}
          ，{{ $t('iam.help') }} <help-link :href="docUrl">{{ $t('common_386') }}</help-link>
        </div>
        <div class="mb-0">{{$t('system.text_568')}}</div>
      </template>
      <a-input v-decorator="decorators.agent_id" />
    </a-form-item>
    <a-form-item label="AppKey">
      <template v-slot:extra>
        <div>{{$t('system.text_259')}}</div>
        <div class="mb-0">{{$t('system.text_569')}}</div>
      </template>
      <a-input v-decorator="decorators.app_key" />
    </a-form-item>
    <a-form-item label="AppSecret">
      <template v-slot:extra>
        <div>{{$t('system.text_260')}}</div>
        <div class="mb-0">{{$t('system.text_569')}}</div>
      </template>
      <a-input-password v-decorator="decorators.app_secret" />
    </a-form-item>
    <a-form-item v-if="false">
      <a-button type="primary" @click="handleSubmit" :loading="submiting">{{ $t('common.ok') }}</a-button>
      <test-button v-if="false" class="ml-3" :post="testPost" />
    </a-form-item>
  </a-form>
</template>

<script>
import TestButton from '@/sections/TestButton'
import { genDocsUrl } from '@/utils/utils'
export default {
  name: 'DingtalkConfig',
  components: {
    TestButton,
  },
  props: {
    formItemLayout: {
      required: true,
      type: Object,
    },
    loading: Boolean,
    docUrl: String,
  },
  data () {
    return {
      submiting: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        agent_id: [
          'agent_id',
          {
            rules: [
              { required: true, message: this.$t('system.text_261') },
            ],
          },
        ],
        app_key: [
          'app_key',
          {
            rules: [
              { required: true, message: this.$t('system.text_262') },
            ],
          },
        ],
        app_secret: [
          'app_secret',
          {
            rules: [
              { required: true, message: this.$t('system.text_263') },
            ],
          },
        ],
      },
      contactData: null,
      href: genDocsUrl({
        scope: this.$store.getters.domain,
        isSysCE: this.$store.getters.isSysCE,
        cePath: `guides/misc/notify/mailconfig/#${this.$t('system.steps_to_param_dingtalk')}`,
        eePath: `web_ui/iam/notify/mailconfig/#${this.$t('system.steps_to_param_dingtalk')}`,
      }),
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('notifyconfigs', 'v1')
  },
  methods: {
    async handleSubmit () {
      this.submiting = true
      try {
        const values = await this.form.fc.validateFields()
        await this.manager.create({
          data: {
            content: values,
            type: 'dingtalk',
          },
        })
        this.$message.success(this.$t('system.text_264'))
      } catch (error) {
        this.$message.error(this.$t('common_622', [this.$t('system.text_136')]))
        throw error
      } finally {
        this.submiting = false
      }
    },
    async testPost () {
      try {
        const values = await this.form.fc.validateFields()
        await new this.$Manager('notifyconfigs', 'v1').performClassAction({
          action: 'validate',
          data: {
            content: values,
            type: 'dingtalk',
          },
        })
      } catch (error) {
        this.$message.error(this.$t('common_623', [this.$t('common_269')]))
        throw error
      }
    },
  },
}
</script>
