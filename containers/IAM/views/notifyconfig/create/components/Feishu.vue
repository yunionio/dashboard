<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout"
    hideRequiredMark>
    <a-form-item label="AppID">
      <template v-slot:extra>
        <div>{{$t('system.text_279')}}
          ，{{ $t('iam.help') }} <help-link :href="docUrl">{{ $t('common_386') }}</help-link>
        </div>
        <div class="mb-0">{{ $t('system.text_571') }}</div>
      </template>
      <a-input v-decorator="decorators.app_id" />
    </a-form-item>
    <a-form-item label="AppSecret">
      <template v-slot:extra>
        <div>{{$t('system.text_280')}}</div>
        <div class="mb-0">{{ $t('system.text_571') }}</div>
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
  name: 'FeishuConfig',
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
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        app_id: [
          'app_id',
          {
            rules: [
              { required: true, message: this.$t('system.text_281') },
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
        cePath: `guides/misc/notify/mailconfig/#${this.$t('system.steps_to_param_feishu')}`,
        eePath: `web_ui/iam/notify/mailconfig/#${this.$t('system.steps_to_param_feishu')}`,
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
            type: 'feishu',
          },
        })
        this.$message.success(this.$t('system.text_124', [this.$t('system.text_133')]))
      } catch (error) {
        this.$message.error(this.$t('common_622', [this.$t('system.text_133')]))
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
            type: 'feishu',
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
