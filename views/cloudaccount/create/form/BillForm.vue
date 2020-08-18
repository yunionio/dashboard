<template>
  <div>
    <a-alert :showIcon="false" message="正确录入账单文件访问信息，在OneCloud系统才可以看到账单、费用等相关的信息" banner />
    <a-form class="pt-3" :form="form.fc" v-bind="formLayout">
      <template v-if="isAzure">
        <a-form-item label="合约编号">
          <a-input v-decorator="decorators.enrollment_number" />
          <span slot="extra">
             账单文件存储桶获取可参考 <help-link :href="enrollmentNumberUrl">如何获取azure合约编号和密钥</help-link>
          </span>
        </a-form-item>
        <a-form-item label="密钥">
          <a-input v-decorator="decorators.balance_key" type="textarea" rows="4" />
        </a-form-item>
      </template>
      <template v-else>
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
        <a-form-item label="存储桶URL">
          <a-input v-decorator="decorators.billing_report_bucket" />
          <span slot="extra" v-if="bucketUrl">
            <!-- 请正确输入账单文件所在存储桶的URL，例如：https://bucket-name.oss-cn-beijing.aliyuncs.com <br /> -->
            账单文件存储桶获取可参考 <help-link :href="bucketUrl">如何获取账单存储桶URL</help-link>
          </span>
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
      </template>
      <a-form-item label="立即采集账单"  extra="在账单文件访问信息配置完成后，立即采集历史账单。">
        <a-switch v-decorator="decorators.sync_info" />
      </a-form-item>
      <a-form-item label="时间范围" v-if="form.fc.getFieldValue('sync_info')" extra="请确保在该时间范围内，有账单数据。时间范围不宜过大，建议选择1~6个月之内，数据过多会造成系统压力导致日常采集任务无法正常执行。">
        <a-select v-decorator="decorators.billtask">
          <a-select-option v-for="(val, key) in billTasks" :key="key" :value="key">{{val}}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import { keySecretFields, BILL_BUCKET_URL_DOCS } from '../../constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BillConfig',
  mixins: [DialogMixin, WindowsMixin],
  props: {
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
      billTasks: {
        '7 days': '近1周',
        '1 months': '近1月',
        '3 months': '近3月',
        '6 months': '近6月',
        '1 years': '近1年',
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
      offsetFormLayout: {
        wrapperCol: {
          md: { span: 18, offset: 6 },
          xl: { span: 20, offset: 3 },
          xxl: { span: 22, offset: 2 },
        },
      },
    }
  },
  computed: {
    id () {
      return (this.account && this.account.id) || (this.cloudAccount && this.cloudAccount.id)
    },
    provider () {
      const { provider } = this.$route.query
      return provider || (this.cloudAccount && this.cloudAccount.provider)
    },
    isGoogle () {
      return this.provider === 'Google'
    },
    isHuawei () {
      return this.provider === 'Huawei'
    },
    isAzure () {
      return this.provider === 'Azure'
    },
    brandCn () {
      const { brand } = this.cloudAccount
      return brand ? keySecretFields[brand.toLowerCase()].text : ''
    },
    bucketUrl () {
      const { brand } = this.cloudAccount
      return brand ? BILL_BUCKET_URL_DOCS[brand.toLowerCase()] : ''
    },
    enrollmentNumberUrl () {
      return '/docs/user/multiplecloud/cloudaccount/cloudaccount/#如何获取azure合约编号和密钥'
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
              // { required: true, message: '请输入存储桶URL' },
            ],
          },
        ],
        usage_file_prefix: [
          'usage_file_prefix',
          {
            initialValue: options.usage_file_prefix,
          },
        ],
        sync_info: [
          'sync_info',
          {
            initialValue: false,
          },
        ],
        enrollment_number: [
          'enrollment_number',
          {
            initialValue: options.enrollment_number,
            rules: [
              { required: true, message: '请输入合同编号' },
            ],
          },
        ],
        balance_key: [
          'balance_key',
          {
            initialValue: options.balance_key,
            rules: [
              { required: true, message: '请输入密钥' },
            ],
          },
        ],
        billtask: ['billtask', {
          initialValue: '7 days',
        }],
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
      if (!id) {
        this.cloudAccount = this.account
        return false
      }
      try {
        const { data } = await this.manager.get({
          id,
          params: {
            details: true,
          },
        })
        this.cloudAccount = data
        if (data && data.options && data.options.billing_bucket_account) {
          this.billingType = 2
        }
        return data
      } catch (err) {
        throw err
      }
    },
    async postBillTasks (id, values) {
      const manager = new this.$Manager('bill_tasks', 'v1')
      try {
        const { billtask } = values
        const data = {
          sync_info: true,
          cloudaccount_id: id,
        }
        const [num, format] = billtask.split(' ')
        const endDayMoment = this.$moment().subtract(1, 'd')
        const startDayMoment = this.$moment().subtract(num, format)
        data.end_day = endDayMoment.format('YYYYMMDD')
        data.start_day = startDayMoment.format('YYYYMMDD')
        await manager.create({
          data,
        })
      } catch (err) {
        throw err
      }
    },
    async doSubmit ({ id } = this.cloudAccount, isGoCloudaccount = true) {
      try {
        const values = await this.form.fc.validateFields()
        if (values.sync_info) {
          this.postBillTasks(id, values)
        }
        delete values.sync_info
        delete values.billtask
        const params = {
          id,
          data: {
            options: values,
          },
        }
        await this.manager.update(params)
        if (isGoCloudaccount) {
          this.$router.push('/cloudaccount')
        }
      } catch (err) {
        throw err
      }
    },
    async testPost () {
      const values = await this.form.fc.validateFields()
      values.cloudaccount_id = this.id
      delete values.sync_info
      delete values.billtask
      await new this.$Manager('bucket_options', 'v1').performClassAction({
        action: 'verify',
        data: values,
      })
    },
  },
}
</script>
