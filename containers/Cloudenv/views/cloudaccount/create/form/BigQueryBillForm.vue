<template>
  <div>
    <a-alert :showIcon="false" :message="$t('cloudenv.text_194')" banner />
    <a-form class="pt-3" :form="form.fc" v-bind="formLayout">
      <a-divider orientation="left">{{$t('cloudenv.text_199')}}</a-divider>
      <a-form-item :label="$t('cloudenv.text_200')">
        <a-radio-group v-model="billingType">
          <a-radio-button :value="1">{{$t('cloudenv.text_201')}}</a-radio-button>
          <a-radio-button :value="2">{{$t('cloudenv.text_202')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        :label="$t('cloudenv.text_201')"
        v-if="billingType === 2"
        :extra="$t('cloudenv.text_203')">
        <a-select
          :filterOption="filterOption"
          showSearch
          :loading="cloudAccountLoading"
          v-decorator="decorators.billing_bigquery_account">
          <template v-for="item in cloudAccounts">
            <a-select-option v-if="id !== item.id" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_2041')">
        <a-input v-decorator="decorators.billing_bigquery_table" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.billing_scope')">
        <a-radio-group v-decorator="decorators.billing_scope">
          <a-radio-button value="managed" key="managed">{{ $t('cloudenv.billing_scope.managed') }}</a-radio-button>
          <a-radio-button value="all" key="all">{{ $t('cloudenv.billing_scope.all') }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_210')" :extra="$t('cloudenv.text_211')">
        <a-switch v-decorator="decorators.sync_info" />
      </a-form-item>
      <a-form-item
        :label="$t('cloudenv.text_212')"
        v-if="form.fc.getFieldValue('sync_info')"
        :extra="$t('cloudenv.text_213')">
        <a-form-item style="display:inline-block">
          <a-month-picker
            v-decorator="decorators.start_day"
            :disabled-date="dateDisabledStart"
            format="YYYY-MM" />
        </a-form-item>
        <span class="ml-2 mr-2">~</span>
        <a-form-item style="display:inline-block">
          <a-month-picker
            v-decorator="decorators.end_day"
            :disabled-date="dateDisabledEnd"
            format="YYYY-MM" />
        </a-form-item>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BigQueryBillForm',
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
    decorators () {
      const { options = {} } = this.cloudAccount
      return {
        billing_bigquery_account: [
          'billing_bigquery_account',
          {
            initialValue: options.billing_bigquery_account,
          },
        ],
        billing_bigquery_table: [
          'billing_bigquery_table',
          {
            initialValue: options.billing_bigquery_table,
            rules: [
              { required: true, message: this.$t('cloudenv.text_220') },
            ],
          },
        ],
        sync_info: [
          'sync_info',
          {
            initialValue: false,
            valuePropName: 'checked',
          },
        ],
        start_day: ['start_day', {
          initialValue: this.$moment().startOf('month'),
          rules: [{ required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_461')]) }],
        }],
        end_day: ['end_day', {
          initialValue: this.$moment(),
          rules: [{ required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_462')]) }],
        }],
        billing_scope: [
          'billing_scope',
          {
            initialValue: options.billing_scope || 'managed',
            rules: [
              { required: true, message: this.$t('cloudenv.billing_scope.prompt') },
            ],
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
      const { id } = this.$route.query
      if (!id) {
        return false
      }
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
        // billing_scope没有时默认选中一个
        if (!data.options || !data.options.billing_scope) {
          data.options = data.options || {}
          data.options.billing_scope = data.options.billing_scope || 'managed'
        }
        this.cloudAccount = data
        if (data && data.options && data.options.billing_bucket_account) {
          this.billingType = 2
        }
        return data
      } catch (err) {
        throw err
      }
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
    },
    async postBillTasks (id, values) {
      const manager = new this.$Manager('billtasks/submit', 'v1')
      try {
        const { start_day, end_day } = values
        const data = {
          account_id: id,
          start_day: parseInt(this.$moment(start_day).startOf('month').format('YYYYMMDD')),
          end_day: parseInt(this.$moment(end_day).endOf('month').format('YYYYMMDD')),
          task_type: 'pull_bill',
        }
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
        delete values.start_day
        delete values.end_day
        const p = { ...values }
        for (const key in p) {
          if (R.is(String, p[key])) {
            p[key] = p[key].trim()
          }
        }
        const params = {
          id,
          data: {
            options: p,
          },
        }
        if (this.billingType === 1) {
          params.data = {
            remove_options: ['billing_bucket_account'],
            ...params.data,
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
      const p = { ...values }
      for (const key in p) {
        if (R.is(String, p[key])) {
          p[key] = p[key].trim()
        }
      }
      const res = await new this.$Manager('bigquery_options', 'v1').performClassAction({
        action: 'verify',
        data: p,
      })
      if (!res || !res.data || !res.data.status) return false
      if (res.data.status === 'success') {
        this.$notification.success({
          message: this.$t('common_270'),
          description: this.$t('common_271'),
        })
      } else if (res.data.msg && res.data.msg === 'bucket file not found') {
        this.$notification.warning({
          message: this.$t('cloudenv.text_577'),
          description: (
            <div>
              {this.$t('cloudenv.text_578')}<br />{this.$t('cloudenv.text_579')}
            </div>
          ),
        })
      } else return false
    },
  },
}
</script>

<style scoped>
</style>
