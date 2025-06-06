<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout"
    hideRequiredMark>
    <a-form-item :label="$t('system.wecom.corp_id')">
      <template v-slot:extra>
        <div>{{ $t('system.for_example') }}: ww2c41e47d2d3b13cb
          ，{{ $t('iam.help') }} <help-link :href="docUrl">{{ $t('common_386') }}</help-link>
        </div>
        <div class="mb-0">{{ $t('system.wecom.where_to_find_corp_id') }}</div>
      </template>
      <a-input v-decorator="decorators.corp_id" />
    </a-form-item>
    <a-form-item label="AgentId">
      <template v-slot:extra>
        <div>{{ $t('system.for_example') }}: 1000002</div>
        <div class="mb-0">{{ $t('system.wecom.where_to_find_agent_id') }}</div>
      </template>
      <a-input v-decorator="decorators.agent_id" />
    </a-form-item>
    <a-form-item label="Secret">
      <template v-slot:extra>
        <div>{{ $t('system.for_example') }}: ZgyVyfr2Mvd0zzy6bE5prfKX25k4Wrgn4-1DSVDYXVo</div>
        <div class="mb-0">{{ $t('system.wecom.where_to_find_secret') }}</div>
      </template>
      <a-input-password v-decorator="decorators.secret" />
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
  name: 'EnterpriseWeChat',
  components: {
    TestButton,
  },
  props: {
    formItemLayout: {
      required: true,
      type: Object,
    },
    offsetWrapperCol: {
      required: true,
      type: Object,
    },
    loading: Boolean,
    docUrl: String,
  },
  data () {
    return {
      submiting: false,
      testLoding: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        corp_id: [
          'corp_id',
          {
            rules: [
              { required: true, message: this.$t('system.corp_id_require_msg') },
            ],
          },
        ],
        agent_id: [
          'agent_id',
          {
            rules: [
              { required: true, message: this.$t('system.agent_id_require_msg') },
            ],
          },
        ],
        secret: [
          'secret',
          {
            rules: [
              { required: true, message: this.$t('system.secret_require_msg') },
            ],
          },
        ],
      },
      contactData: null,
      href: genDocsUrl({
        scope: this.$store.getters.domain,
        isSysCE: this.$store.getters.isSysCE,
        cePath: `guides/misc/notify/mailconfig/#${this.$t('system.steps_to_param_mailconfig')}`,
        eePath: `web_ui/iam/notify/mailconfig/#${this.$t('system.steps_to_param_mailconfig')}`,
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
      const values = await this.form.fc.validateFields()
      try {
        this.submiting = true
        await this.manager.create({
          data: {
            content: values,
            type: 'workwx',
          },
        })
        this.$message.success(this.$t('system.text_124', [this.$t('system.wecom.1')]))
      } catch (error) {
        this.$message.error(this.$t('common_622', [this.$t('system.wecom.1')]))
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
            type: 'workwx',
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
