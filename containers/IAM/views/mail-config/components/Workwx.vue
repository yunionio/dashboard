<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout">
    <contact-tips
      :before="$t('system.workwx.before')"
      :after="$t('system.workwx.after')"
      :href="href"
      :hrefText="$t('system.detail')" />
    <a-form-item :label="$t('system.wecom.corp_id')">
      <template v-slot:extra>
        <div>{{ $t('system.for_example') }}: ww2c41e47d2d3b13cb</div>
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
    <a-form-item :wrapper-col="offsetWrapperCol">
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
              { required: true, message: '请输入企业ID' },
            ],
          },
        ],
        agent_id: [
          'agent_id',
          {
            rules: [
              { required: true, message: '请输入 AgentId' },
            ],
          },
        ],
        secret: [
          'secret',
          {
            rules: [
              { required: true, message: '请输入 Secret' },
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
    this.fetchData()
  },
  methods: {
    async fetchData () {
      this.$emit('update:loading', true)
      try {
        const response = await this.manager.list({
          params: {
            type: 'workwx',
          },
        })
        const data = response.data.data[0] || {}
        this.contactData = data
        this.$nextTick(() => {
          this.form.fc.setFieldsValue(data.content)
        })
      } catch (error) {
        throw error
      } finally {
        this.$emit('update:loading', false)
      }
    },
    async handleSubmit () {
      const values = await this.form.fc.validateFields()
      try {
        this.submiting = true
        if (this.contactData && this.contactData.id) {
          await this.manager.update({
            id: this.contactData.id,
            data: {
              content: values,
              type: 'workwx',
            },
          })
        } else {
          await this.manager.create({
            data: {
              content: values,
              type: 'workwx',
            },
          })
        }
        await this.fetchData()
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
