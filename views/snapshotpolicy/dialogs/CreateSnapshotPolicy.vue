<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">
          创建快照会暂时降低存储I/O性能，出现短暂瞬间变慢。建议您避开业务高峰创建快照
         <br />设定的自动快照时间与实际创建时间可能存在一定差异，快照数据以实际创造时间为准
         <br />每个硬盘自动快照配额有限，超出配额后最早创建的自动快照会被自动删除
        </div>
      </a-alert>
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item :label="`指定${$t('dictionary.project')}`" v-bind="formItemLayout" class="mb-0">
          <domain-project :fc="form.fc" :form-layout="formItemLayout" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item label="策略名称" v-bind="formItemLayout">
          <a-input
            v-decorator="decorators.generate_name"
            placeholder="字母开头，数字和字母大小写组合，长度为2-128个字符，不含'.','_','@'"
            @change="nameChangeHandle" />
          <div slot="extra" v-if="showRepeatTips">
            <div>名称重复，系统默认追加“-1”</div>
          </div>
        </a-form-item>
        <a-form-item label="备份日期" v-bind="formItemLayout">
          <a-checkbox-group v-decorator="decorators.repeat_weekdays">
            <a-checkbox
              v-for="(week, idx) of weekOptions"
              :key="idx + 1"
              :value="idx + 1">{{ week }}</a-checkbox>
            </a-checkbox-group>
        </a-form-item>
        <a-form-item label="备份时间" v-bind="formItemLayout">
          <a-button-group v-decorator="decorators.time_points">
            <a-button
                class="select-btn"
                v-for="(time, idx) of timeOptions"
                size="small"
                :key="idx"
                :type="form.fd.time_points.includes(idx) ? 'primary' : ''"
                @click="timeSelectHandle(idx)">{{ time }}</a-button>
          </a-button-group>
        </a-form-item>
        <a-form-item label="保留时间" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.alwaysReserved">
            <div class="mb-2">
              <a-radio :value="false">
                <span class="mr-2">自定义保留时长</span>
                <a-input-number
                  size="small"
                  v-decorator="decorators.retention_days"
                  :step="1"
                  :max="49"
                  :min="1"
                  step-strictly />
                <span style="color: #606266;" class="ml-2">天</span>
              </a-radio>
            </div>
            <div>
              <a-radio :value="true">永久保留</a-radio>
            </div>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
import { weekOptions, timeOptions } from '../constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject'
import validateForm, { isRequired } from '@/utils/validate'

export default {
  name: 'CreateSnapshotPolicyDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const tenant = this.params.extParams && this.params.extParams.tenant
    const domain = this.params.extParams && this.params.extParams.domain
    return {
      loading: false,
      action: '新建策略',
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          generate_name: '',
          repeat_weekdays: [],
          time_points: [],
          retention_days: 7,
          alwaysReserved: false,
        },
      },
      decorators: {
        generate_name: [
          'generate_name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: "字母开头，数字和字母大小写组合，长度为2-128个字符，不含'.','_','@'" },
              { validator: validateForm('serverName') },
            ],
          },
        ],
        repeat_weekdays: [
          'repeat_weekdays',
          {
            rules: [
              { required: true, message: '请选择备份日期' },
            ],
          },
        ],
        time_points: [
          'time_points',
          {
            rules: [
              { required: true, message: '请选择备份时间' },
            ],
          },
        ],
        retention_days: [
          'retention_days',
          {
            initialValue: 7,
          },
        ],
        alwaysReserved: [
          'alwaysReserved',
          {
            initialValue: false,
          },
        ],
        domain: [
          'domain',
          {
            initialValue: domain || this.$store.getters.userInfo.projectDomainId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: tenant || this.$store.getters.userInfo.projectId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
      },
      snapshotpolicies: [],
      weekOptions: [...weekOptions],
      timeOptions: [...timeOptions],
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    showRepeatTips () {
      const name = this.form.fd.generate_name || ''
      return !!this.snapshotpolicies.find(item => item.name === name.toLowerCase())
    },
  },
  created () {
    this.manager = new this.$Manager('snapshotpolicies')
    this.debounceFetchSnapshotpolicies = debounce(this.fetchSnapshotpolicies, 1000)
  },
  methods: {
    fetchSnapshotpolicies () {
      const params = {
        scope: this.$store.getters.scope,
        filter: `name.contains("${this.form.fd.generate_name}")`,
      }
      this.manager.list({ params }).then(res => {
        const data = res.data.data || []
        this.snapshotpolicies = data
      })
    },
    async doCreateSnapshotPolicySubmit () {
      const { alwaysReserved, domain, project, ...rest } = this.form.fd
      const params = {
        ...rest,
      }
      if (alwaysReserved) {
        params.retention_days = -1
      }
      if (domain && project) {
        params.tenant = project.key
      }
      return this.manager.create({ data: params })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.form.fc.validateFields()
        await this.doCreateSnapshotPolicySubmit()
        this.loading = false
        this.params.refresh && this.params.refresh()
        this.params.success && this.params.success()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    nameChangeHandle (val) {
      this.form.fd.generate_name = val
      this.debounceFetchSnapshotpolicies()
    },
    timeSelectHandle (val) {
      this.form.fd.time_points = [val]
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({ time_points: [val] })
      })
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        this.form.fd[key] = values[key]
      })
    },
  },
}
</script>

<style lang="less" scoped>
.select-btn {
  margin-left: 0 !important;
  margin-right: 8px;
  margin-bottom: 5px;
  width: 80px;
}
.select-btn.ant-btn-primary + .ant-btn:not(.ant-btn-primary):not([disabled]) {
  border-left-color: #d9d9d9 !important;
}
</style>
