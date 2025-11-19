<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">
          {{ form.fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" />
          <span v-if="isResDeny" class="ml-2"><a-icon class="warning-color mr-1" type="warning" />{{ $t('common.permission.403') }}</span>
          <span v-if="isUsageKeyDeny" class="ml-2">
            <a-tooltip class="mr-2"><template slot="title">{{ $t('dashboard.usage_key_deny_tips') }}</template><icon type="help" /></a-tooltip>
            <a-icon class="warning-color mr-1" type="warning" />
            {{ $t('dashboard.usage_key_deny_tips_2') }}
          </span>
        </div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
          <!-- <router-link v-if="!edit" to="/notice" class="ml-2">{{$t('dashboard.more')}}</router-link> -->
        </div>
      </div>
      <div class="dashboard-card-body flex-column justify-content-center">
        <template v-if="!loading">
          <div class="flex-fill position-relative">
            <div class="dashboard-fco-wrap">
              <div class="account-health-row p-2">
                <div class="account-health-title mt-2">{{$t('dashboard.effective_account_health')}}</div>
                <div class="account-health-value green-color mt-2">{{isUsageKeyDeny ? 0 : avaliableNum}}{{$t('dashboard.each')}}</div>
              </div>
              <div class="account-health-row p-2">
                <div class="account-health-title">{{$t('dashboard.uneffective_account_health')}}</div>
                <div class="account-health-value red-color mt-2">{{isUsageKeyDeny ? 0 : unavaliableNum}}{{$t('dashboard.each')}}</div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <a-empty />
        </template>
      </div>
    </div>
    <base-drawer :visible.sync="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit">
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dashboard.text_6')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { resolveValueChangeField } from '@/utils/common/ant'
import { uuid } from '@/utils/utils'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'AccountHealth',
  components: {
    BaseDrawer,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
    edit: Boolean,
    dataRangeParams: {
      type: Object,
    },
  },
  data () {
    const initialNameValue = (this.params && this.params.name) || this.$t('dashboard.cloud_account_health')
    return {
      data: [],
      visible: false,
      loading: false,
      avaliableNum: 0,
      unavaliableNum: 0,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            const newField = resolveValueChangeField(values)
            R.forEachObjIndexed((item, key) => {
              this.$set(this.form.fd, key, item)
            }, newField)
          },
        }),
        fd: {
          name: initialNameValue,
        },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: initialNameValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_8') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'capability', 'isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
    isResDeny () {
      return !hasPermission({ key: 'bill_analysises_list' })
    },
    isUsageKeyDeny () {
      if (this.isAdminMode && this.dataRangeParams?.scope === 'project') {
        return true
      }
      if (this.isDomainMode && this.dataRangeParams?.scope === 'project') {
        return true
      }
      return false
    },
  },
  watch: {
    'form.fd' (val) {
      this.fetchData()
      for (const key in this.decorators) {
        let config = this.decorators[key][1] || {}
        config = {
          ...config,
          initialValue: val[key],
        }
        this.decorators[key][1] = config
      }
    },
    'dataRangeParams.scope': {
      handler (val) {
        this.fetchData()
      },
      immediate: true,
    },
    'dataRangeParams.domain': {
      handler (val) {
        this.fetchData()
      },
      immediate: true,
    },
    'dataRangeParams.project': {
      handler (val) {
        this.fetchData()
      },
      immediate: true,
    },
  },
  created () {
    const values = { ...this.form.fd }
    this.$emit('update', this.options.i, values)
    this.fetchData()
  },
  methods: {
    refresh () {
      return this.fetchData()
    },
    async fetchData () {
      this.loading = true
      try {
        const extraParams = {}
        if (this.isAdminMode) {
          if (this.dataRangeParams?.scope === 'domain' && this.dataRangeParams?.domain) {
            extraParams.domain_id = this.dataRangeParams?.domain
            extraParams.scope = 'domain'
          }
          if (this.dataRangeParams?.scope === 'project' && this.dataRangeParams?.project) {
            extraParams.project_id = this.dataRangeParams?.project
            extraParams.scope = 'project'
          }
        }
        if (this.isDomainMode) {
          if (this.dataRangeParams?.scope === 'project' && this.dataRangeParams?.project) {
            extraParams.project_id = this.dataRangeParams?.project
          }
        }
        const [avaliableData, inviladData] = await Promise.all([
          new this.$Manager('bill_balances', 'v1').list({
            params: {
              scope: this.scope,
              show_fill_reason: true,
              account_id: 'accountList',
              limit: 1,
              currency: 'CNY',
              status: ['connected'],
              ignoreErrorStatusCode: [403],
              ...extraParams,
            },
          }),
          new this.$Manager('bill_balances', 'v1').list({
            params: {
              $t: uuid(),
              scope: this.scope,
              show_fill_reason: true,
              account_id: 'accountList',
              limit: 1,
              currency: 'CNY',
              status: ['connected'],
              ignoreErrorStatusCode: [403],
              ...extraParams,
            },
          }),
        ])
        this.avaliableNum = avaliableData.data.total || 0
        this.unavaliableNum = inviladData.data.total || 0
      } finally {
        this.loading = false
      }
    },
    handleEdit () {
      this.visible = true
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = values
        const updateValues = { ...values }
        this.$emit('update', this.options.i, updateValues)
        this.visible = false
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
<style lang="less">
.account-health-row{
  .account-health-value{
    font-size: 36px;
  }
  .green-color{
    color: #ADE4B6;
  }
  .red-color{
    color: #F3ADB2;
  }
}
</style>
