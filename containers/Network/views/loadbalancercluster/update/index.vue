<template>
  <a-spin :spinning="loading">
    <page-header :title="$t('network.update_cluster')" />
    <page-body>
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('network.text_21')">
          <a-input :disabled="!!lbAgentId" v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_83')" :extra="$t('network.text_84')">
          <a-switch :checkedChildren="$t('network.text_85')" :unCheckedChildren="$t('network.text_86')" v-decorator="decorators.preempt" />
        </a-form-item>
        <a-form-item :label="$t('network.text_87')" :extra="$t('network.text_88')">
          <a-input-number v-decorator="decorators.virtual_router_id" :max="255" :min="1" />
        </a-form-item>
        <a-form-item :label="$t('network.text_92')" :extra="$t('network.text_93')">
          <a-input v-decorator="decorators.advert_int" type="number" :addonAfter="$t('network.text_76')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_95')" :extra="$t('network.text_96')">
          <a-input v-decorator="decorators.pass" />
        </a-form-item>
        <a-form-item v-if="!lbAgentId" :label="$t('common.text00012')" class="mb-0">
          <tag v-decorator="decorators.__meta__" />
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" :loading="submiting" @click="handleSubmit">{{ $t('common.ok') }}</a-button>
        <a-button class="ml-2" @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </page-footer>
  </a-spin>
</template>
<script>
import workflowMixin from '@/mixins/workflow'
import WindowsMixin from '@/mixins/windows'
import Tag from '@/sections/Tag'
import validateForm from '@/utils/validate'

export default {
  name: 'LBClusterCreate',
  components: {
    Tag,
  },
  mixins: [WindowsMixin, workflowMixin],
  data () {
    return {
      loading: false,
      submiting: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: ['description'],
        __meta__: [
          '__meta__',
          {
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
        virtual_router_id: [
          'virtual_router_id',
          {
            initialValue: 1,
            rules: [
              { required: true, message: this.$t('network.text_118') },
            ],
          },
        ],
        preempt: [
          'preempt',
          {
            initialValue: false,
            valuePropName: 'checked',
            rules: [
              { required: true, message: this.$t('network.text_120') },
            ],
          },
        ],
        advert_int: [
          'advert_int',
          {
            initialValue: 1,
            normalize: v => Number(v),
            rules: [
              { required: true, message: this.$t('network.text_121') },
              { type: 'integer', min: 1, max: 255, message: this.$t('network.text_122'), trigger: 'blur' },
            ],
          },
        ],
        pass: [
          'pass',
        ],
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 14 },
          xl: { span: 16 },
          xxl: { span: 20 },
        },
        labelCol: {
          md: { span: 10 },
          xl: { span: 8 },
          xxl: { span: 4 },
        },
      },
    }
  },
  computed: {
    clusterId () {
      return this.$route.query.id
    },
  },
  created () {
    this.manager = new this.$Manager('loadbalancerclusters')
    this.getFetchLbCluster()
  },
  methods: {
    setValues (data) {
      if (!data || !Object.keys(data).length || !data.params) return false
      const params = {
        ...data.params,
      }
      this.form.fc.setFieldsValue({
        name: data.name,
        description: data.description,
        ...params,
      })
    },
    formatValues (values) {
      const { name, description, ...params } = values
      return {
        name,
        description,
        ...params,
      }
    },
    doUpdate (values) {
      return this.manager.performAction({
        action: 'params-patch',
        id: this.clusterId,
        data: this.formatValues(values),
      })
    },
    async getFetchLbCluster () {
      const { id } = this.$route.query
      try {
        const { data = {} } = await this.manager.get(({
          id,
        }))
        this.setValues(data)
      } catch (err) {
        throw err
      }
    },
    async handleSubmit () {
      this.submiting = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doUpdate(values)
        this.handleCancel()
      } catch (error) {
        throw error
      } finally {
        this.submiting = false
      }
    },
    handleCancel () {
      this.$router.push('/cluster')
    },
  },
}
</script>
