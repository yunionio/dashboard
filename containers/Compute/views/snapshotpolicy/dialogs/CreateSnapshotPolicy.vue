<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">{{$t('compute.text_1087')}}<br />{{$t('compute.text_1088')}}<br />{{$t('compute.text_1089')}}</div>
      </a-alert>
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])" v-bind="formItemLayout">
          <domain-project :fc="form.fc" :form-layout="formItemLayout" isDefaultSelect :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_428')" v-bind="formItemLayout">
          <a-input
            v-decorator="decorators.generate_name"
            :placeholder="$t('compute.text_1090')"
            @change="nameChangeHandle" />
          <div slot="extra" v-if="showRepeatTips">
            <div>{{$t('compute.text_1091')}}</div>
          </div>
        </a-form-item>
        <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item :label="$t('common.resource_type')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.type" :disabled="params.type === 'update'">
            <a-select-option value="server" v-if="types.includes('server')">{{$t('dictionary.server')}}</a-select-option>
            <a-select-option value="disk" v-if="types.includes('disk')">{{$t('dictionary.disk')}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.text_431')" v-bind="formItemLayout">
          <a-checkbox-group v-decorator="decorators.repeat_weekdays">
            <a-checkbox
              v-for="(week, idx) of weekOptions"
              :key="idx + 1"
              :value="idx + 1">{{ week }}</a-checkbox>
            </a-checkbox-group>
        </a-form-item>
        <a-form-item :label="$t('compute.text_432')" v-bind="formItemLayout">
          <!-- <a-button-group v-decorator="decorators.time_points">
            <a-button
                class="select-btn"
                v-for="(time, idx) of timeOptions"
                size="small"
                :key="idx"
                :type="form.fd.time_points.includes(idx) ? 'primary' : ''"
                @click="timeSelectHandle(idx)">{{ time }}</a-button>
          </a-button-group> -->
          <a-select v-decorator="decorators.time_points" mode="multiple">
            <a-select-option v-for="(time, idx) in timeOptions" :key="idx" :value="idx">{{time}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.text_433')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.alwaysReserved">
            <div class="mb-2">
              <a-radio value="day" :disabled="params.type === 'update' && form.fd.alwaysReserved !== 'day'">
                <span class="mr-2">{{$t('compute.text_1092')}}</span>
                <a-input-number
                  size="small"
                  v-decorator="decorators.retention_days"
                  :step="1"
                  :max="49"
                  :min="1"
                  :disabled="params.type === 'update' && form.fd.alwaysReserved !== 'day'"
                  step-strictly />
                <span style="color: #606266;" class="ml-2">{{$t('compute.text_1093')}}</span>
              </a-radio>
            </div>
            <div class="mb-2">
              <a-radio value="count" :disabled="params.type === 'update' && form.fd.alwaysReserved !== 'count'">
                <span class="mr-2">{{$t('compute.retention_count_prefix')}}</span>
                <a-input-number
                  size="small"
                  v-decorator="decorators.retention_count"
                  :step="1"
                  :min="1"
                  :disabled="params.type === 'update' && form.fd.alwaysReserved !== 'count'"
                  step-strictly />
                <span style="color: #606266;" class="ml-2">{{$t('compute.retention_count_suffix')}}</span>
              </a-radio>
            </div>
            <div>
              <a-radio value="always" :disabled="params.type === 'update' && form.fd.alwaysReserved !== 'always'">
                {{$t('compute.text_1094')}}
              </a-radio>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject'
import validateForm, { isRequired } from '@/utils/validate'
import { weekOptions, timeOptions } from '../constants'

export default {
  name: 'CreateSnapshotPolicyDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const tenant = this.params.extParams && this.params.extParams.tenant
    const domain = this.params.extParams && this.params.extParams.domain
    const types = (this.params.extParams && this.params.extParams.types) || ['server', 'disk']
    const initData = this.params.type === 'update' ? this.params.data[0] : {}
    let alwaysReserved = 'day'
    if (initData.retention_count) {
      alwaysReserved = 'count'
    } else if (initData.retention_days > 0) {
      alwaysReserved = 'day'
    } else {
      alwaysReserved = 'always'
    }
    return {
      loading: false,
      action: this.$t('compute.text_1095'),
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          generate_name: initData.name || '',
          description: initData.description || '',
          repeat_weekdays: initData.repeat_weekdays || [],
          time_points: initData.time_points || [],
          retention_days: initData.retention_days || 7,
          retention_count: initData.retention_count || 7,
          type: initData.type || types[0],
          alwaysReserved,
        },
      },
      types,
      decorators: {
        generate_name: [
          'generate_name',
          {
            validateFirst: true,
            initialValue: initData.name || '',
            rules: [
              { required: true, message: this.$t('compute.text_1090') },
              { validator: validateForm('serverName') },
            ],
          },
        ],
        description: ['description', { initialValue: initData.description || '' }],
        type: [
          'type',
          {
            initialValue: initData.type || types[0],
          },
        ],
        repeat_weekdays: [
          'repeat_weekdays',
          {
            initialValue: initData.repeat_weekdays || [],
            rules: [
              { required: true, message: this.$t('compute.text_1096') },
            ],
          },
        ],
        time_points: [
          'time_points',
          {
            initialValue: initData.time_points || [],
            rules: [
              { required: true, message: this.$t('compute.text_1097') },
            ],
          },
        ],
        retention_days: [
          'retention_days',
          {
            initialValue: initData.retention_days || 7,
          },
        ],
        alwaysReserved: [
          'alwaysReserved',
          {
            initialValue: alwaysReserved,
          },
        ],
        retention_count: [
          'retention_count',
          {
            initialValue: initData.retention_count || 7,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('compute.retention_count')]) },
            ],
          },
        ],
        domain: [
          'domain',
          {
            initialValue: initData.domain_id || domain || this.$store.getters.userInfo.projectDomainId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: initData.tenant_id || tenant || this.$store.getters.userInfo.projectId,
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
    genParams () {
      const { alwaysReserved, retention_count, retention_days, domain, project, time_points, ...rest } = this.form.fd
      const params = {
        ...rest,
      }
      if (alwaysReserved === 'count') {
        params.retention_count = retention_count
        params.retention_days = -1
      } else if (alwaysReserved === 'always') {
        params.retention_days = -1
      } else if (alwaysReserved === 'day') {
        params.retention_days = retention_days
      }
      if (domain) {
        params.domain = domain.key
      }
      if (project) {
        params.tenant = project.key
      }
      params.time_points = time_points
      return params
    },
    async doCreateSnapshotPolicySubmit () {
      const params = this.genParams()
      return this.manager.create({ data: params })
    },
    async doUpdateSnapshotPolicySubmit () {
      const params = this.genParams()
      return this.params.onManager('update', {
        id: this.params.data[0].id,
        managerArgs: {
          data: { ...params, name: this.form.fd.generate_name },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.form.fc.validateFields()
        if (this.params.type === 'update') {
          await this.doUpdateSnapshotPolicySubmit()
        } else {
          await this.doCreateSnapshotPolicySubmit()
          this.params.refresh && this.params.refresh()
          this.params.success && this.params.success()
        }
        this.loading = false
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
    // timeSelectHandle (val) {
    //   this.form.fd.time_points = [val]
    //   this.$nextTick(() => {
    //     this.form.fc.setFieldsValue({ time_points: [val] })
    //   })
    // },
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
