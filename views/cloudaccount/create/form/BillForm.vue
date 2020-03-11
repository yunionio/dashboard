<template>
  <div>
    <a-alert :showIcon="false" message="正确录入账单文件访问信息，在OneCloud系统才可以看到账单、费用等相关的信息" banner />
    <a-form class="pt-3" :form="form.fc" v-bind="formLayout">
      <a-divider orientation="left">账单文件/Billing export</a-divider>
      <a-form-item label="云账号类型">
        <a-radio-group  v-model="billingType">
          <a-radio-button :value="1">主账号</a-radio-button>
          <a-radio-button v-if="!isHuawei" :value="2">关联账号</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="主账号" v-if="billingType === 2" extra="一般来说，账单文件的存储桶等信息是主账号设置的，我们需要使用主账号的访问信息去获取这些账单文件进行分析">
        <a-select :filterOption="filterOption" showSearch :loading="cloudAccountLoading" v-decorator="decorators.billing_bucket_account">
         <template v-for="item in cloudAccounts">
          <a-select-option  v-if="id !== item.id" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
         </template>
        </a-select>
      </a-form-item>
      <a-form-item label="存储桶URL" extra="请正确输入账单文件所在存储桶的URL，例如：https://bucket-name.oss-cn-beijing.aliyuncs.com">
        <a-input v-decorator="decorators.billing_report_bucket" />
      </a-form-item>
       <a-form-item v-if="!isHuawei" label="文件前缀"  extra="一般为公有云的账户ID，用于筛选存储桶的账单文件。上述Bucket里面只有账单文件时，不需要关注该字段。">
        <a-input v-decorator="decorators.billing_file_prefix" />
      </a-form-item>
      <!-- google -->
      <template v-if="isGoogle">
        <a-divider class="mt-5" orientation="left">使用量文件/Usage export</a-divider>
        <a-form-item label="存储桶URL" extra="请正确输入使用量所在存储桶的URL，例如：https://bucket-name.oss-cn-beijing.aliyuncs.com">
          <a-input v-decorator="decorators.usage_report_bucket" />
        </a-form-item>
        <a-form-item label="文件前缀" extra="一般为公有云的账户ID，用于筛选存储桶的账单文件。上述Bucket里面只有账单文件时，不需要关注该字段。">
          <a-input v-decorator="decorators.usage_file_prefix" />
        </a-form-item>
      </template>
    </a-form>
  </div>
</template>
<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BillConfig',
  mixins: [DialogMixin, WindowsMixin],
  props: {
    provider: {
      type: String,
    },
    account: {
      type: Object,
    },
  },
  data () {
    return {
      loading: false,
      cloudAccounts: [],
      cloudAccountLoading: false,
      cloudAccount: {},
      billingType: 1,
      form: {
        fc: this.$form.createForm(this),
      },
      formLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 3 },
          xxl: { span: 2 },
        },
      },
    }
  },
  computed: {
    id () {
      return (this.account && this.account.id) || (this.cloudAccount && this.cloudAccount.id)
    },
    isGoogle () {
      return this.provider === 'Google' || (this.cloudAccount && this.cloudAccount.provider === 'Google')
    },
    isHuawei () {
      return this.provider === 'Huawei' || (this.cloudAccount && this.cloudAccount.provider === 'Huawei')
    },
    decorators () {
      const { options = {} } = this.cloudAccount
      return {
        billing_bucket_account: [
          'billing_bucket_account',
          {
            initialValue: options.billing_bucket_account,
          },
        ],
        billing_report_bucket: [
          'billing_report_bucket',
          {
            initialValue: options.billing_report_bucket,
            rules: [
              { required: true, message: '请输入存储桶URL' },
            ],
          },
        ],
        billing_file_prefix: [
          'billing_file_prefix',
          {
            initialValue: options.billing_file_prefix,
          },
        ],
        usage_report_bucket: [
          'usage_report_bucket',
          {
            initialValue: options.usage_report_bucket,
            rules: [
              { required: true, message: '请输入存储桶URL' },
            ],
          },
        ],
        usage_file_prefix: [
          'usage_file_prefix',
          {
            initialValue: options.usage_file_prefix,
          },
        ],
      }
    },
  },
  created () {
    this.manager = new this.$Manager('cloudaccounts')
    this.fetchs()
  },
  methods: {
    async fetchs () {
      await this.fetchCloudAccount()
      await this.fetchCloudAccounts()
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    async fetchCloudAccounts () {
      this.cloudAccountLoading = true
      try {
        const params = {
          scope: this.$store.getters.scope,
          brand: this.provider || this.cloudAccount.brand,
        }
        const { data } = await this.manager.list({ params })
        this.cloudAccounts = data.data || []
      } catch (err) {
        throw err
      } finally {
        this.cloudAccountLoading = false
      }
    },
    async fetchCloudAccount () {
      const { id } = this.$route.query
      if (!id) return false
      try {
        const { data } = await this.manager.get({
          id,
          params: {
            details: true,
          },
        })
        this.cloudAccount = data
        if (data && data.options && data.options['billing_bucket_account']) {
          this.billingType = 2
        }
        return data
      } catch (err) {
        throw err
      }
    },
    async doSubmit ({ id } = this.cloudAccount) {
      try {
        const values = await this.form.fc.validateFields()
        const params = {
          id,
          data: {
            options: values,
          },
        }
        await this.manager.update(params)
        this.$router.push('/cloudaccount')
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
