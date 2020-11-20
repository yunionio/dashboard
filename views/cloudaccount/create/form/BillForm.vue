<template>
  <div>
    <a-alert :showIcon="false" :message="$t('cloudenv.text_194')" banner />
    <a-form class="pt-3" :form="form.fc" v-bind="formLayout">
      <template v-if="isAzure">
        <a-form-item :label="$t('cloudenv.text_195')">
          <a-input v-decorator="decorators.enrollment_number" />
          <span slot="extra">
            <template v-if="isAzure">
              {{$t('cloudenv.text_571')}} <help-link :href="enrollmentNumberUrl">{{$t('cloudenv.text_197')}}</help-link>
            </template>
            <template v-else>
              {{$t('cloudenv.text_196')}} <help-link :href="enrollmentNumberUrl">{{$t('cloudenv.text_197')}}</help-link>
            </template>
          </span>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_198')">
          <a-input v-decorator="decorators.balance_key" type="textarea" rows="4" />
        </a-form-item>
      </template>
      <template v-else>
        <a-divider orientation="left">{{$t('cloudenv.text_199')}}</a-divider>
        <template v-if="!isQcloud">
          <a-form-item :label="$t('cloudenv.text_200')">
            <a-radio-group  v-model="billingType">
              <a-radio-button :value="1">{{$t('cloudenv.text_201')}}</a-radio-button>
              <a-radio-button v-if="!isHuawei" :value="2">{{$t('cloudenv.text_202')}}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="$t('cloudenv.text_201')" v-if="billingType === 2" :extra="$t('cloudenv.text_203')">
            <a-select :filterOption="filterOption" showSearch :loading="cloudAccountLoading" v-decorator="decorators.billing_bucket_account">
            <template v-for="item in cloudAccounts">
              <a-select-option  v-if="id !== item.id" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
            </template>
            </a-select>
          </a-form-item>
          <a-form-item :label="$t('cloudenv.text_204')">
            <a-input v-decorator="decorators.billing_report_bucket" />
            <span slot="extra" v-if="bucketUrl">
              <!-- 请正确输入账单文件所在存储桶的URL，例如：https://bucket-name.oss-cn-beijing.aliyuncs.com <br /> -->{{$t('cloudenv.text_196')}}<help-link :href="bucketUrl">{{$t('cloudenv.text_205')}}</help-link>
            </span>
          </a-form-item>
          <a-form-item v-if="!isHuawei" :label="$t('cloudenv.text_206')"  :extra="$t('cloudenv.text_207')">
            <a-input v-decorator="decorators.billing_file_prefix" />
          </a-form-item>
          <!-- google -->
          <template v-if="isGoogle">
            <a-divider class="mt-5" orientation="left">{{$t('cloudenv.text_208')}}</a-divider>
            <a-form-item :label="$t('cloudenv.text_204')" :extra="$t('cloudenv.text_209')">
              <a-input v-decorator="decorators.usage_report_bucket" />
            </a-form-item>
            <a-form-item :label="$t('cloudenv.text_206')" :extra="$t('cloudenv.text_207')">
              <a-input v-decorator="decorators.usage_file_prefix" />
            </a-form-item>
          </template>
        </template>
      </template>
      <a-form-item :label="$t('cloudenv.text_210')"  :extra="$t('cloudenv.text_211')">
        <a-switch v-decorator="decorators.sync_info" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_212')" v-if="form.fc.getFieldValue('sync_info')" :extra="$t('cloudenv.text_213')">
        <a-range-picker
          v-decorator="decorators.billtask"
          :disabled-date="current => current && current > $moment().endOf('day')"
          :ranges="{
            [billTasks['7 days']]: [$moment().subtract(1, 'w'), $moment()],
            [billTasks['1 months']]: [$moment().subtract(1, 'M'), $moment()],
            [billTasks['3 months']]: [$moment().subtract(3, 'M'), $moment()],
            [billTasks['6 months']]: [$moment().subtract(6, 'M'), $moment()],
          }" />
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
        '7 days': this.$t('cloudenv.text_214'),
        '1 months': this.$t('cloudenv.text_215'),
        '3 months': this.$t('cloudenv.text_216'),
        '6 months': this.$t('cloudenv.text_217'),
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
    isQcloud () {
      return this.provider === 'Qcloud'
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
              { required: true, message: this.$t('cloudenv.text_220') },
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
            valuePropName: 'checked',
          },
        ],
        enrollment_number: [
          'enrollment_number',
          {
            initialValue: options.enrollment_number,
            rules: [
              { required: true, message: this.$t('cloudenv.text_221') },
            ],
          },
        ],
        balance_key: [
          'balance_key',
          {
            initialValue: options.balance_key,
            rules: [
              { required: true, message: this.$t('cloudenv.text_222') },
            ],
          },
        ],
        billtask: ['billtask', {
          initialValue: [this.$moment().subtract(1, 'w'), this.$moment()],
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
          action: 'override',
        }
        // const [num, format] = billtask.split(' ')
        // const endDayMoment = this.$moment().subtract(1, 'd')
        // const startDayMoment = this.$moment().subtract(num, format)
        // data.end_day = endDayMoment.format('YYYYMMDD')
        // data.start_day = startDayMoment.format('YYYYMMDD')
        data.end_day = billtask[1].format('YYYYMMDD')
        data.start_day = billtask[0].format('YYYYMMDD')
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
