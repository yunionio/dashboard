<template>
  <div class="scheduletask">
    <page-header :title="$t('cloudenv.text_432')" />
    <page-body needMarginBottom>
      <a-form :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('cloudenv.text_410', [$t('dictionary.project')])" class="mt-3" v-bind="formItemLayout">
          <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_95')" :extra="$t('cloudenv.name.extra')">
          <a-input :placeholder="$t('cloudenv.text_190')" v-decorator="decorators.name" />
          <template v-slot:extra>
            <name-repeated res="scheduledtasks" :name="form.fd.name" />
          </template>
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <scheduled-task-time ref="taskTime" :form="form" />
        <a-form-item :label="$t('cloudenv.text_384')">
          <a-select v-decorator="decorators.resourceType">
            <a-select-option v-for="(v, k) in resourceTypeOpts" :key="k" :value="k">{{v}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_425')">
          <a-radio-group v-decorator="decorators.action">
            <a-radio-button v-for="(v, k) in $t('cloudenvScheduledtaskRuleAction')" :key="k" :value="k">{{v}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_439')" v-show="false">
          <a-radio-group v-decorator="decorators.labelType">
            <a-radio-button v-for="(v, k) in $t('cloudenvScheduledtaskLabelType')" :key="k" :value="k">{{v}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_440')" v-if="form.fc.getFieldValue('labelType') === 'id'">
          <list-select
            v-decorator="decorators.servers"
            :list-props="resourceProps"
            :multiple="true"
            :formatter="formatter" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_16')" class="mb-0" v-if="form.fc.getFieldValue('labelType') === 'tag'">
          <tag v-decorator="decorators.tag" :extra="$t('cloudenv.text_441')" />
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <template class="content" v-slot:right>
        <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">{{ $t('common.create') }}</a-button>
        <a-button @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ScheduledTaskTime from '@Cloudenv/sections/ScheduledTaskTime'
import Tag from '@/sections/Tag'
import DomainProject from '@/sections/DomainProject'
import ListSelect from '@/sections/ListSelect'
import validateForm, { isRequired } from '@/utils/validate'
import NameRepeated from '@/sections/NameRepeated'
import ResourcePropsMixin from '../mixins/resourceProps'

export default {
  name: 'ScheduledtaskCreateIndex',
  components: {
    DomainProject,
    Tag,
    ListSelect,
    NameRepeated,
    ScheduledTaskTime,
  },
  mixins: [ResourcePropsMixin],
  data () {
    return {
      loading: false,
      resourceTypeOpts: { ...this.$t('cloudenvScheduledtaskResourceType') },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
            ],
          },
        ],
        description: ['description'],
        cycle_type: [
          'cycleTimer.cycle_type',
          {
            initialValue: 'day',
            rules: [
              { required: true, message: this.$t('cloudenv.text_443') },
            ],
          },
        ],
        weekDays: [
          'cycleTimer.week_days',
          {
            initialValue: [1, 2, 3, 4, 5],
            rules: [
              { required: true, message: this.$t('cloudenv.text_444') },
            ],
          },
        ],
        monthDays: [
          'cycleTimer.month_days',
          {
            initialValue: [1],
            rules: [
              { required: true, message: this.$t('cloudenv.text_445') },
            ],
          },
        ],
        cycle_num: [
          'cycleTimer.cycle_num',
          {
            initialValue: 1,
            rules: [
              { required: true, message: this.$t('cloudenv.input_cycle_num') },
            ],
          },
        ],
        cycle_type2: [
          'cycleTimer.cycle_type2',
          {
            initialValue: 'month',
          },
        ],
        // 小时：分钟
        hourMinute: [
          'hourMinute',
          {
            // initialValue: [1],
            rules: [
              { required: true, message: this.$t('cloudenv.text_446') },
            ],
          },
        ],
        // 有效时间
        startEndTime: [
          'startEndTime',
          {
            // initialValue: [1],
            rules: [
              { required: false, message: this.$t('cloudenv.text_447') },
            ],
          },
        ],
        execTime: [
          'timer.execTime',
          {
            initialValue: this.$moment().add(1, 'h'),
            rules: [
              { required: true, message: this.$t('cloudenv.text_437') },
            ],
          },
        ],
        resourceType: [
          'resourceType',
          {
            initialValue: 'server',
            rules: [
              { required: true, message: this.$t('cloudenv.text_448') },
            ],
          },
        ],
        action: [
          'action',
          {
            initialValue: 'start',
            rules: [
              { required: true, message: this.$t('cloudenv.text_449') },
            ],
          },
        ],
        labelType: [
          'labelType',
          {
            initialValue: 'id',
            rules: [
              { required: true, message: this.$t('cloudenv.text_450') },
            ],
          },
        ],
        servers: [
          'servers',
        ],
        tag: [
          'tag',
          {
            // initialValue: { 'user:a': '3', 'user:b': '9' },
            rules: [
              { required: true, message: this.$t('cloudenv.text_451') },
              { validator: validateForm('tagName') },
            ],
          },
        ],
      },
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
            if (values.hasOwnProperty('project')) {
              this.resourceProps.list.getParams.tenant = values.project && values.project.key
            }
          },
        }),
        fd: {
          name: '',
        },
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 2 },
        },
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    delete this.resourceTypeOpts.cloudaccount
  },
  methods: {
    disabledDate (current) {
      return current && current < this.$moment().subtract(1, 'd').endOf('day')
    },
    range (start, end) {
      const result = []
      for (let i = start; i < end; i++) {
        result.push(i)
      }
      return result
    },
    generateData (values) {
      const { domain, project, name, description, action, labelType, servers, resourceType } = values
      const params = {
        generate_name: name,
        description,
        resource_type: resourceType,
        project_domain: (domain && domain.key) || this.userInfo.projectDomainId,
        project_id: (project && project.key) || this.userInfo.projectId,
        operation: action,
        label_type: labelType,
      }
      this.$refs.taskTime.transformParams(params, values)
      if (labelType === 'id') {
        params.labels = servers
      } else if (labelType === 'tag') {
        const tags = Object.keys(values.tag).map((k) => {
          return `${k}:${values.tag[k]}`
        })
        params.labels = tags
      }
      return params
    },
    async handleConfirm () {
      const manager = new this.$Manager('scheduledtasks', 'v1')
      try {
        const values = await this.form.fc.validateFields()
        this.loading = true
        await manager.create({
          data: this.generateData(values),
        })
        this.goBack()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    handleCancel () {
      this.goBack()
    },
    goBack () {
      this.$router.push('/scheduledtask')
    },
    formatter (val) {
      return `${val.name}`
    },
  },
}
</script>
