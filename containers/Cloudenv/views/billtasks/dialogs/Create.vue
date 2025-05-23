<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'create_billtask' ? $t('common.create') : $t('bill.rerun_bill') }}</div>
    <div slot="body">
      <a-form-model
        ref="form"
        class="mt-3"
        :model="form"
        :rules="rules">
        <a-form-model-item :label="$t('cloudenv.task_type')" v-bind="formItemLayout" prop="task_type">
          <base-select
            v-model="form.task_type"
            :options="taskTypeOpts"
            :select-props="{placeholder: $t('common.tips.select', [$t('cloudenv.task_type')])}"
            :disabled-items="disabledActions"
            @change="taskTypeChange" />
        </a-form-model-item>
        <a-form-model-item v-if="isMonthShow" :label="$t('cloudenv.text_212')" v-bind="formItemLayout" prop="start_day">
          <span slot="extra" style="color:red;">{{ blockTip }}</span>
          <a-form-model-item style="display:inline-block" prop="start_day">
            <a-month-picker v-model="form.start_day" :disabled-date="dateDisabledStart" @change="startChange" :disabled="ignore_time" />
          </a-form-model-item>
          <span class="ml-2 mr-2">~</span>
          <a-form-model-item style="display:inline-block" prop="end_day">
            <a-month-picker v-model="form.end_day" :disabled-date="dateDisabledEnd" :disabled="ignore_time" />
          </a-form-model-item>
          <a-checkbox class="ml-2" v-model="ignore_time">{{$t('cloudenv.run_all_bills')}}</a-checkbox>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BilltasksCreateDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const TaskTypeList = ['pull_bill', 'prepaid_amortizing', 'project_sharing', 'recalculate', 'predict', 'delete_bill', 'sync_product'].filter(key => {
      const { cost_conversion_available, enable_prediction } = this.$store.state.common.bill?.globalConfig || {}
      if (key === 'recalculate' && !cost_conversion_available) return false
      if (key === 'predict' && !enable_prediction) return false
      return true
    })
    const { data = [] } = this.params
    const initDisabledActions = []
    if (data.some(item => item.status === 'deleted')) {
      initDisabledActions.push('pull_bill', 'prepaid_amortizing', 'project_sharing', 'recalculate', 'predict')
    }
    let initTaskType = 'pull_bill'
    for (let i = 0; i < TaskTypeList.length; i++) {
      if (!initDisabledActions.includes(TaskTypeList[i])) {
        initTaskType = TaskTypeList[i]
        break
      }
    }
    return {
      loading: false,
      accountLoading: false,
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      form: {
        account_id: data.map(item => item.id),
        task_type: initTaskType,
        start_day: this.$moment(),
        end_day: this.$moment(),
      },
      rules: {
        account_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('dictionary.cloudaccount')]) }],
        task_type: [{ required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.task_type')]) }],
        start_day: [{ required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_461')]) }],
        end_day: [{ required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_462')]) }],
      },
      taskTypeOpts: TaskTypeList.map(id => {
        return {
          id,
          name: this.$t(`cloudenv.task_type.${id}`),
        }
      }),
      accountParams: {
        scope: this.$store.getters.scope,
      },
      disabledActions: initDisabledActions,
      blockMonths: [],
      ignore_time: false,
    }
  },
  computed: {
    isMonthShow () {
      return !(this.form.task_type === 'delete_bill' && this.params.data.some(item => item.status === 'deleted'))
    },
    start () {
      return this.$moment(this.form.start_day).format('YYYY-MM')
    },
    end () {
      return this.$moment(this.form.end_day).format('YYYY-MM')
    },
    selectedMonths () {
      const list = []
      const start = this.$moment(this.start)
      const end = this.$moment(this.end)
      // eslint-disable-next-line
      while (end > start || start.format('M') === end.format('M')) {
        list.push(start.format('YYYYMM'))
        start.add(1, 'month')
      }
      return list
    },
    blockTip () {
      const blockMonths = []
      this.selectedMonths.map(month => {
        if (this.blockMonths.includes(month)) {
          blockMonths.push(`${month.slice(0, 4)}-${month.slice(4, 6)}`)
        }
      })
      return blockMonths.length ? this.$t('cloudenv.block_month_tip', [blockMonths.join('、')]) : ''
    },
  },
  watch: {
    'form.task_type': {
      handler (val, oldVal) {
        if (oldVal === 'predict') {
          this.form.start_day = this.$moment()
          this.form.end_day = this.$moment()
        }
      },
    },
    start: {
      handler (val) {
        this.fetchBlockAccount()
      },
    },
    end: {
      handler (val) {
        this.fetchBlockAccount()
      },
    },
  },
  created () {
    this.$bM = new this.$Manager('billtasks/submit', 'v1')
    this.fetchBlockAccount()
  },
  methods: {
    fetchBlockAccount () {
      new this.$Manager('blocking_accounts', 'v1').list({
        params: {
          account_id: this.params.account_id,
          enabled: true,
          filter: `month.in(${this.selectedMonths.join(',')})`,
        },
      }).then(res => {
        const { data = [] } = res.data
        this.blockMonths = data.map(item => `${item.month}`)
      })
    },
    startChange (value) {
      const dateEnd = this.form.end_day
      if (dateEnd && value > dateEnd) {
        this.form.end_day = value
      }
    },
    dateDisabledStart (value) {
      if (this.params.accountData?.provider === 'extdb' && this.form.task_type === 'pull_bill') return false
      if (value > this.$moment()) return this.form.task_type !== 'predict'
      return false
    },
    dateDisabledEnd (value) {
      const dateStart = this.form.start_day
      if (dateStart && value < dateStart) return true
      if (this.params.accountData?.provider === 'extdb' && this.form.task_type === 'pull_bill') return false
      if (value > this.$moment()) return this.form.task_type !== 'predict'
      return false
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate((valid, err) => {
          if (valid) {
            resolve(valid)
          } else {
            reject(err)
          }
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const validate = await this.validateForm()
        if (!validate) return
        const data = {
          account_id: this.params.data.map(item => item.id),
          task_type: this.form.task_type,
        }
        if (this.isMonthShow && !this.ignore_time) {
          data.start_day = parseInt(this.$moment(this.form.start_day).startOf('month').format('YYYYMMDD'))
          data.end_day = parseInt(this.$moment(this.form.end_day).endOf('month').format('YYYYMMDD'))
        }
        await this.$bM.create({
          data,
        })
        this.params.success && this.params.success()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.share-label {
  .share-text {
    width: 50px;
    text-align: center;
    display: inline-block;
    height: 32px;
    padding: 0 5px;
    border: 1px solid #d9d9d9;
    line-height: 31px;
  }
}
</style>
