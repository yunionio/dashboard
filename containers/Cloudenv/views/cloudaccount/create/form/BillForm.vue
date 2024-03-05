<template>
  <div>
    <a-alert :showIcon="false" :message="$t('cloudenv.text_194')" banner />
    <a-form class="pt-3" :form="form.fc" v-bind="formLayout">
      <a-form-item v-if="isAzurePublicCloud" :label="$t('cloudenv.text_360')">
        <a-radio-group v-model="billType">
          <a-radio-button
            v-for="item in billTypeOptions"
            :key="item.value"
            :value="item.value"
          >{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <template v-if="isAzure && isEA">
        <a-form-item :label="$t('cloudenv.text_195')">
          <a-input v-decorator="decorators.enrollment_number" />
          <span slot="extra">
            {{ $t('cloudenv.text_572') }}
            <help-link :href="enrollmentNumberUrl">{{ $t('cloudenv.text_197') }}</help-link>
          </span>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_198')">
          <a-input v-decorator="decorators.balance_key" type="textarea" rows="4" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.billing_scope')">
          <a-radio-group v-decorator="decorators.billing_scope">
            <a-radio-button value="managed" key="managed">{{ $t('cloudenv.billing_scope.managed') }}</a-radio-button>
            <a-radio-button value="all" key="all">{{ $t('cloudenv.billing_scope.all') }}</a-radio-button>
          </a-radio-group>
          <div slot="extra">
            <div>{{ $t('cloudenv.billing_scope.extra') }}</div>
            <div>{{ $t('cloudenv.billing_scope.extra_note') }}</div>
          </div>
        </a-form-item>
      </template>
      <template v-if="useBillingBucket && !isEA">
        <a-divider v-if="!isHiddenDriver" orientation="left">{{ $t('cloudenv.text_199') }}</a-divider>
        <a-form-item :label="$t('cloudenv.text_200')">
          <a-radio-group v-model="cloudAccountType">
            <a-radio-button :value="1">{{ $t('cloudenv.text_201') }}</a-radio-button>
            <a-radio-button v-if="!isHuawei" :value="2">{{ $t('cloudenv.text_202') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :label="$t('cloudenv.text_201')"
          v-if="cloudAccountType === 2"
          :extra="$t('cloudenv.text_203')"
        >
          <a-select
            :filterOption="filterOption"
            showSearch
            :loading="cloudAccountLoading"
            v-decorator="decorators.billing_bucket_account"
          >
            <template v-for="item in cloudAccounts">
              <a-select-option v-if="id !== item.id" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_204')">
          <a-input v-decorator="decorators.billing_report_bucket" />
          <span slot="extra" v-if="bucketUrl">
            <!-- 请正确输入账单文件所在存储桶的URL，例如：https://bucket-name.oss-cn-beijing.aliyuncs.com <br /> -->
            {{ $t('cloudenv.text_196') }}
            <help-link :href="bucketUrl">{{ $t('cloudenv.text_205') }}</help-link>
          </span>
        </a-form-item>
        <a-form-item
          v-if="!isHuawei"
          :label="$t('cloudenv.text_206')"
          :extra="$t('cloudenv.text_207')"
        >
          <a-input v-decorator="decorators.billing_file_prefix" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.billing_scope')" v-if="cloudAccountType === 1">
          <div slot="extra">
            <div>{{ $t('cloudenv.billing_scope.extra') }}</div>
            <div>{{ $t('cloudenv.billing_scope.extra_note') }}</div>
          </div>
          <a-radio-group v-decorator="decorators.billing_scope">
            <a-radio-button value="managed" key="managed">{{ $t('cloudenv.billing_scope.managed') }}</a-radio-button>
            <a-radio-button
              value="all"
              key="all"
              :disabled="billingScopeDisabled"
            >{{ $t('cloudenv.billing_scope.all') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <!-- google -->
        <template v-if="isGoogle">
          <a-divider class="mt-5" orientation="left">{{ $t('cloudenv.text_208') }}</a-divider>
          <a-form-item :label="$t('cloudenv.text_204')" :extra="$t('cloudenv.text_209')">
            <a-input v-decorator="decorators.usage_report_bucket" />
          </a-form-item>
          <a-form-item :label="$t('cloudenv.text_206')" :extra="$t('cloudenv.text_207')">
            <a-input v-decorator="decorators.usage_file_prefix" />
          </a-form-item>
        </template>
      </template>
      <a-form-item :label="$t('cloudenv.text_210')" :extra="$t('cloudenv.text_211')">
        <a-switch v-decorator="decorators.sync_info" />
      </a-form-item>
      <a-form-item
        :label="$t('cloudenv.text_212')"
        v-if="form.fc.getFieldValue('sync_info')"
        :extra="$t('cloudenv.text_213')"
      >
        <a-form-item style="display: inline-block">
          <a-month-picker
            v-decorator="decorators.start_day"
            :disabled-date="dateDisabledStart"
            format="YYYY-MM"
          />
        </a-form-item>
        <span class="ml-2 mr-2">~</span>
        <a-form-item style="display: inline-block">
          <a-month-picker
            v-decorator="decorators.end_day"
            :disabled-date="dateDisabledEnd"
            format="YYYY-MM"
          />
        </a-form-item>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'
import {
  keySecretFields,
  getBillBucketUrlDocs,
  getEnrollmentNumberDocs,
  BILL_TYPES,
  BILL_TYPE_MAP
} from '../../constants'

export default {
  name: 'BillConfig',
  mixins: [DialogMixin, WindowsMixin],
  props: {
    account: {
      type: Object
    }
  },
  data () {
    return {
      loading: false,
      cloudAccounts: [],
      cloudAccountLoading: false,
      cloudAccount: {},
      cloudAccountType: 1, // 1 --> 主账号 | 2 --> 关联账号
      billTypeOptions: BILL_TYPES,
      billType: BILL_TYPE_MAP.EA.value, // EA --> EA账号 | Bucket --> 存储桶
      form: {
        fc: this.$form.createForm(this)
      },
      billTasks: {
        '7 days': this.$t('cloudenv.text_214'),
        '1 months': this.$t('cloudenv.text_215'),
        '3 months': this.$t('cloudenv.text_216'),
        '6 months': this.$t('cloudenv.text_217')
      },
      formLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 }
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 3 },
          xxl: { span: 2 }
        }
      },
      offsetFormLayout: {
        wrapperCol: {
          md: { span: 18, offset: 6 },
          xl: { span: 20, offset: 3 },
          xxl: { span: 22, offset: 2 }
        }
      }
    }
  },
  computed: {
    id () {
      return (
        (this.account && this.account.id) ||
        (this.cloudAccount && this.cloudAccount.id)
      )
    },
    provider () {
      const { provider } = this.$route.query
      return provider || (this.cloudAccount && this.cloudAccount.provider)
    },
    isGoogle () {
      return this.provider === HYPERVISORS_MAP.google.provider
    },
    isHuawei () {
      return this.provider === HYPERVISORS_MAP.huawei.provider
    },
    isAzure () {
      return this.provider === HYPERVISORS_MAP.azure.provider
    },
    isAzurePublicCloud () {
      return this.cloudAccount.access_url === 'AzurePublicCloud'
    },
    isQcloud () {
      return this.provider === HYPERVISORS_MAP.qcloud.provider
    },
    isAws () {
      return this.provider === HYPERVISORS_MAP.aws.provider
    },
    isAliyun () {
      return this.provider === HYPERVISORS_MAP.aliyun.provider
    },
    isVolcEngine () {
      return this.provider === HYPERVISORS_MAP.volcengine.provider
    },
    useBillingBucket () {
      const supportProviders = [
        HYPERVISORS_MAP.aliyun.provider,
        HYPERVISORS_MAP.aws.provider,
        HYPERVISORS_MAP.huawei.provider,
        HYPERVISORS_MAP.google.provider,
        HYPERVISORS_MAP.volcengine.provider,
        HYPERVISORS_MAP.qcloud.provider,
        HYPERVISORS_MAP.azure.provider
      ]
      return supportProviders.includes(this.provider)
    },
    brandCn () {
      const { brand } = this.cloudAccount
      return brand ? keySecretFields[brand.toLowerCase()].text : ''
    },
    bucketUrl () {
      const { brand } = this.cloudAccount
      return brand
        ? getBillBucketUrlDocs(this.$store.getters.scope)[brand.toLowerCase()]
        : ''
    },
    enrollmentNumberUrl () {
      return getEnrollmentNumberDocs(this.$store.getters.scope)
    },
    decorators () {
      const options = this.cloudAccount.options || {}
      return {
        billing_bucket_account: [
          'billing_bucket_account',
          {
            initialValue: options.billing_bucket_account
          }
        ],
        billing_report_bucket: [
          'billing_report_bucket',
          {
            initialValue: options.billing_report_bucket,
            rules: [{ required: true, message: this.$t('cloudenv.text_220') }]
          }
        ],
        billing_file_prefix: [
          'billing_file_prefix',
          {
            initialValue: options.billing_file_prefix
          }
        ],
        usage_report_bucket: [
          'usage_report_bucket',
          {
            initialValue: options.usage_report_bucket,
            rules: [
              // { required: true, message: '请输入存储桶URL' },
            ]
          }
        ],
        usage_file_prefix: [
          'usage_file_prefix',
          {
            initialValue: options.usage_file_prefix
          }
        ],
        sync_info: [
          'sync_info',
          {
            initialValue: false,
            valuePropName: 'checked'
          }
        ],
        enrollment_number: [
          'enrollment_number',
          {
            initialValue: options.enrollment_number,
            rules: [{ required: true, message: this.$t('cloudenv.text_221') }]
          }
        ],
        balance_key: [
          'balance_key',
          {
            initialValue: options.balance_key,
            rules: [{ required: true, message: this.$t('cloudenv.text_222') }]
          }
        ],
        start_day: [
          'start_day',
          {
            initialValue: this.$moment().startOf('month'),
            rules: [
              {
                required: true,
                message: this.$t('common.tips.select', [
                  this.$t('cloudenv.text_461')
                ])
              }
            ]
          }
        ],
        end_day: [
          'end_day',
          {
            initialValue: this.$moment(),
            rules: [
              {
                required: true,
                message: this.$t('common.tips.select', [
                  this.$t('cloudenv.text_462')
                ])
              }
            ]
          }
        ],
        billing_scope: [
          'billing_scope',
          {
            initialValue:
              options.billing_scope || this.getDefaultBillingScope(),
            rules: [
              {
                required: true,
                message: this.$t('cloudenv.billing_scope.prompt')
              }
            ]
          }
        ]
      }
    },
    billingScopeDisabled () {
      const supportProviders = [
        HYPERVISORS_MAP.aws.provider,
        HYPERVISORS_MAP.aliyun.provider,
        HYPERVISORS_MAP.volcengine.provider,
        HYPERVISORS_MAP.qcloud.provider,
        HYPERVISORS_MAP.azure.provider
      ]
      return !supportProviders.includes(this.provider)
    },
    isEA () {
      return this.billType === BILL_TYPE_MAP.EA.value
    },
    isHiddenDriver () {
      return this.isAzurePublicCloud
    }
  },
  watch: {
    cloudAccount (val) {
      const { enrollment_number, billing_report_bucket } = val.options || {}
      if (this.provider === HYPERVISORS_MAP.azure.provider) {
        if (enrollment_number) {
          this.billType = BILL_TYPE_MAP.EA.value
        } else if (billing_report_bucket) {
          this.billType = BILL_TYPE_MAP.Bucket.value
        }
      } else {
        this.billType = BILL_TYPE_MAP.Bucket.value
      }
    }
  },
  created () {
    this.manager = new this.$Manager('cloudaccounts')
    this.fetchs()
  },
  methods: {
    getDefaultBillingScope () {
      if (!this.billingScopeDisabled) {
        return 'all'
      } else {
        return 'managed'
      }
    },
    async fetchs () {
      await this.fetchCloudAccount()
      await this.fetchCloudAccounts()
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      )
    },
    async fetchCloudAccounts () {
      this.cloudAccountLoading = true
      try {
        const params = {
          scope: this.$store.getters.scope,
          brand: this.provider || this.cloudAccount.brand
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
            details: true
          }
        })
        // billing_scope没有默认选中一个，选中规则与新建相同
        if (!data.options || !data.options.billing_scope) {
          data.options = data.options || {}
          data.options.billing_scope =
            data.options.billing_scope || this.getDefaultBillingScope()
        }
        this.cloudAccount = data
        if (data && data.options && data.options.billing_bucket_account) {
          this.cloudAccountType = 2
        }
        return data
      } catch (err) {
        throw err
      }
    },
    async postBillTasks (id, values) {
      const manager = new this.$Manager('billtasks/submit', 'v1')
      try {
        const { start_day, end_day } = values
        const data = {
          account_id: id,
          task_type: 'pull_bill',
          start_day: parseInt(
            this.$moment(start_day)
              .startOf('month')
              .format('YYYYMMDD')
          ),
          end_day: parseInt(
            this.$moment(end_day)
              .endOf('month')
              .format('YYYYMMDD')
          )
        }
        await manager.create({
          data
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
        delete values.start_day
        delete values.end_day
        const params = {
          id,
          data: {
            options: values
          }
        }
        if (this.cloudAccountType === 1) {
          params.data = {
            remove_options: [
              'billing_bucket_account',
              'billing_bigquery_table'
            ],
            ...params.data
          }
        }
        if (this.isAzurePublicCloud) {
          const { remove_options = [] } = params.data
          if (this.isEA) {
            params.data = {
              ...params.data,
              remove_options: [...remove_options, 'billing_report_bucket']
            }
          } else {
            params.data = {
              ...params.data,
              remove_options: [
                ...remove_options,
                'enrollment_number',
                'balance_key'
              ]
            }
          }
        }
        await this.manager.update(params)
        // if (isGoCloudaccount) {
        //   this.$router.push('/cloudaccount')
        // }
      } catch (err) {
        throw err
      }
    },
    async testPost () {
      const values = await this.form.fc.validateFields()
      values.cloudaccount_id = this.id
      delete values.sync_info
      delete values.month
      const res = await new this.$Manager(
        'bucket_options',
        'v1'
      ).performClassAction({
        action: 'verify',
        data: values
      })
      if (!res || !res.data || !res.data.status) return false
      if (res.data.status === 'success') {
        this.$notification.success({
          message: this.$t('common_270'),
          description: this.$t('common_271')
        })
      } else if (res.data.msg && res.data.msg === 'bucket file not found') {
        this.$notification.warning({
          message: this.$t('cloudenv.text_577'),
          description: (
            <div>
              {this.$t('cloudenv.text_578')}
              <br />
              {this.$t('cloudenv.text_579')}
            </div>
          )
        })
      } else return false
    },
    dateDisabledStart (value) {
      const dateEnd = this.form.fc.getFieldValue('end_day')
      if (dateEnd && value > dateEnd) return true
      if (value > this.$moment()) return true
      return false
    },
    dateDisabledEnd (value) {
      const dateStart = this.form.fc.getFieldValue('start_day')
      if (dateStart && value < dateStart) return true
      if (value > this.$moment()) return true
      return false
    }
  }
}
</script>
