<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('common.create') }}</div>
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
            :disabled-items="disabledActions" />
        </a-form-model-item>
        <a-form-model-item v-if="isMonthShow" :label="$t('cloudenv.month')" prop="month" v-bind="formItemLayout">
          <a-month-picker v-model="form.month" :disabled-date="disabledDate" valueFormat="YYYYMM" format="YYYY-MM" />
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
    const TaskTypeList = ['pull_bill', 'prepaid_amortizing', 'project_sharing', 'recalculate', 'delete_bill'].filter(key => {
      if (key === 'recalculate' && !this.$store.state.common.bill.globalConfig.cost_conversion_available) return false
      return true
    })
    const { accountData = {} } = this.params
    const initDisabledActions = []
    if (accountData.status === 'deleted') {
      initDisabledActions.push(...TaskTypeList.slice(0, 4))
    } else if (accountData.brand) {
      if (accountData.cloud_env !== 'public') {
        initDisabledActions.push('project_sharing')
      }
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
        account_id: this.params.account_id,
        task_type: initTaskType,
        month: this.$moment().subtract(1, 'month').format('YYYYMM'),
      },
      rules: {
        account_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('dictionary.cloudaccount')]) }],
        task_type: [{ required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.task_type')]) }],
        month: [{ required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.share_resource_type')]) }],
      },
      taskTypeOpts: TaskTypeList.map(id => {
        return {
          id,
          name: this.$t(`bill.task_type.${id}`),
        }
      }),
      accountParams: {
        scope: this.$store.getters.scope,
      },
      disabledActions: initDisabledActions,
    }
  },
  computed: {
    isMonthShow () {
      return !(this.form.task_type === 'delete_bill' && this.params.accountData?.status === 'deleted')
    },
  },
  created () {
    this.$bM = new this.$Manager('billtasks/submit', 'v1')
  },
  methods: {
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
          account_id: this.form.account_id,
          task_type: this.form.task_type,
        }
        if (this.isMonthShow) {
          data.month = parseInt(this.form.month)
        }
        await this.$bM.create({
          data,
        })
        this.params.success()
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
