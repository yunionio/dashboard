<template>
  <a-spin :spinning="loading">
    <page-header :title="$t('network.text_722')" />
    <page-body>
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('network.text_21')">
          <a-input :disabled="!!lbAgentId" v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_19')">
          <base-select
            :disabled="!!lbAgentId"
            v-decorator="decorators.cluster_id"
            resource="loadbalancerclusters"
            remote
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            showSync
            :select-props="{ placeholder: $t('network.text_79') }" />
          <p slot="extra">{{$t('network.text_80')}}<a-button type="link" size="small" @click="createCluster">{{$t('network.text_26')}}</a-button>
          </p>
        </a-form-item>
        <a-form-item :label="$t('network.priority')">
          <a-tooltip>
            <template slot="title">
              {{ $t('network.priority.extra') }}
            </template>
            <a-input-number
              v-decorator="decorators.priority"
              :min="1"
              :max="255"
              :step="1"
              :formatter="v => `${ isNaN(parseInt(v)) ? 1 : parseInt(v) }`"
              :parser="v => `${ isNaN(parseInt(v)) ? 1 : parseInt(v) }`" />
          </a-tooltip>
        </a-form-item>
        <a-collapse :bordered="false">
         <a-collapse-panel :header="$t('network.text_94')" key="1" forceRender>
            <a-collapse @change="handleCollapseChange">
              <a-collapse-panel key="telegraf" :header="$t('network.text_97')" forceRender>
                <a-form-item :label="$t('network.text_98')" :extra="$t('network.text_99')">
                  <a-row :gutter="8">
                    <a-col :span="12">
                      <a-input v-decorator="decorators.telegraf_influx_db_output_url" :placeholder="$t('network.text_100')" />
                    </a-col>
                    <a-col :span="12">
                      <a-checkbox class="ml-4" v-decorator="decorators.telegraf_influx_db_output_unsafe_ssl">{{$t('network.text_101')}}</a-checkbox>
                    </a-col>
                  </a-row>
                </a-form-item>
                <a-form-item :label="$t('network.text_102')">
                  <a-input v-decorator="decorators.telegraf_influx_db_output_name" />
                </a-form-item>
                <a-form-item :label="$t('network.text_103')">
                  <a-input v-decorator="decorators.telegraf_haproxy_input_interval" type="Number" :addonAfter="$t('network.text_76')" />
                </a-form-item>
                <a-form-item :label="$t('network.text_104')">
                  <code-mirror v-decorator="decorators.telegraf_conf_tmpl" :options="cmOptions" />
                </a-form-item>
              </a-collapse-panel>
              <a-collapse-panel key="haproxy" :header="$t('network.text_105')" forceRender>
                <a-form-item :label="$t('network.text_106')">
                  <a-input v-decorator="decorators.haproxy_global_nbthread" type="Number" />
                </a-form-item>
                <a-form-item :label="$t('network.text_107')" :extra="$t('network.text_108')">
                  <a-input v-decorator="decorators.haproxy_global_log" :placeholder="$t('network.text_109')" />
                </a-form-item>
                <a-form-item :label="$t('network.text_110')">
                  <a-switch v-decorator="decorators.haproxy_log_http" />
                </a-form-item>
                <a-form-item :label="$t('network.text_111')">
                  <a-switch v-decorator="decorators.haproxy_log_tcp" />
                </a-form-item>
                 <a-form-item :label="$t('network.text_112')">
                  <a-switch v-decorator="decorators.haproxy_log_normal" />
                </a-form-item>
                <a-form-item :label="$t('network.text_113')">
                  <a-input v-decorator="decorators.haproxy_tune_http_maxhdr" :extra="$t('network.text_114')" type="Number" />
                </a-form-item>
                <a-form-item :label="$t('network.text_104')">
                  <code-mirror v-decorator="decorators.haproxy_conf_tmpl" :options="cmOptions" />
                </a-form-item>
              </a-collapse-panel>
              <a-collapse-panel key="keepalived" :header="$t('network.text_115')" forceRender>
                <a-form-item :label="$t('network.text_104')">
                  <code-mirror v-decorator="decorators.keepalived_conf_tmpl" :options="cmOptions" />
                </a-form-item>
              </a-collapse-panel>
            </a-collapse>
         </a-collapse-panel>
        </a-collapse>
      </a-form>
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" :loading="submiting" @click="handleSubmit">{{ $t('common.ok') }}</a-button>
        <a-button class="ml-2" @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </page-footer>
  </a-spin>
</template>
<script>
import workflowMixin from '@/mixins/workflow'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AgentCreate',
  components: {},
  mixins: [WindowsMixin, workflowMixin],
  data () {
    return {
      loading: false,
      submiting: false,
      defaultParams: {},
      form: {
        fc: this.$form.createForm(this),
      },
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        theme: 'material',
        autofocus: true,
        value: undefined,
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: ['description'],
        cluster_id: [
          'cluster_id',
          {
            rules: [
              { required: true, message: this.$t('network.text_79') },
            ],
          },
        ],
        priority: [
          'priority',
          {
            initialValue: 1,
          },
        ],
        telegraf_influx_db_output_url: [
          'telegraf.influx_db_output_url',
        ],
        telegraf_influx_db_output_unsafe_ssl: [
          'telegraf.influx_db_output_unsafe_ssl',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ],
        telegraf_influx_db_output_name: [
          'telegraf.influx_db_output_name',
        ],
        telegraf_conf_tmpl: [
          'telegraf_conf_tmpl',
        ],
        telegraf_haproxy_input_interval: [
          'telegraf.haproxy_input_interval',
          {
            normalize: v => Number(v),
            rules: [
              { type: 'integer', min: 1, max: 600, message: this.$t('network.text_123'), trigger: 'blur' },
            ],
          },
        ],
        haproxy_global_nbthread: [
          'haproxy.global_nbthread',
          {
            normalize: v => Number(v),
            rules: [
              { type: 'integer', min: 1, max: 64, message: this.$t('network.text_124'), trigger: 'blur' },
            ],
          },
        ],
        haproxy_global_log: [
          'haproxy.global_log_path',
        ],
        haproxy_log_http: [
          'haproxy.log_http',
          {
            valuePropName: 'checked',
          },
        ],
        haproxy_log_tcp: [
          'haproxy.log_tcp',
          {
            valuePropName: 'checked',
          },
        ],
        haproxy_log_normal: [
          'haproxy.log_normal',
          {
            valuePropName: 'checked',
          },
        ],
        haproxy_tune_http_maxhdr: [
          'haproxy.tune_http_maxhdr',
          {
            initialValue: 101,
            normalize: v => Number(v),
            rules: [
              { type: 'integer', min: 1, max: 32767, message: this.$t('network.text_125'), trigger: 'blur' },
            ],
          },
        ],
        haproxy_conf_tmpl: [
          'haproxy_conf_tmpl',
        ],
        keepalived_conf_tmpl: [
          'keepalived_conf_tmpl',
        ],
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 14 },
          xl: { span: 16 },
          xxl: { span: 20 },
        },
        labelCol: {
          md: { span: 10 },
          xl: { span: 8 },
          xxl: { span: 4 },
        },
      },
    }
  },
  computed: {
    lbAgentId () {
      return this.$route.query.id
    },
  },
  created () {
    this.manager = new this.$Manager('loadbalanceragents')
    if (this.lbAgentId) {
      this.getFetchLbAgent()
    }
  },
  methods: {
    createCluster () {
      this.createDialog('LoadbalancerclusterCreateDialog', {
        title: this.$t('network.text_26'),
      })
    },
    handleClusterChange (id) {
      !this.lbAgentId && this.getFetchDefaultParams(id)
    },
    setValues (data) {
      if (!data || !Object.keys(data).length || !data.params) return false
      const params = {
        ...data.params,
        // 在handleCollapseChange赋值， 为了解决code-mirror赋值bug
        ...{
          telegraf_conf_tmpl: undefined,
          haproxy_conf_tmpl: undefined,
          keepalived_conf_tmpl: undefined,
        },
      }
      if (params.haproxy && params.haproxy.global_log) {
        params.haproxy.global_log_path = params.haproxy.global_log.split(' ')[1]
      }
      this.form.fc.setFieldsValue({
        name: data.name,
        description: data.description,
        cluster_id: data.cluster_id,
        priority: data.priority,
        ...params,
      })
      this.defaultParams = data.params
    },
    formatValues (values) {
      const templKeys = ['telegraf_conf_tmpl', 'haproxy_conf_tmpl', 'keepalived_conf_tmpl']
      templKeys.forEach(k => {
        if (values[k]) {
          values[k] = window.btoa(values[k])
        } else {
          values[k] = this.defaultParams[k]
        }
      })
      if (values.haproxy.global_log_path) {
        const logConfs = this.defaultParams.haproxy.global_log.split(' ')
        logConfs[1] = values.haproxy.global_log_path
        values.haproxy.global_log = logConfs.join(' ')
        delete values.global_log_path
      }
      const { name, description, cluster_id, priority, ...rest } = values
      if (this.lbAgentId) {
        return {
          name,
          description,
          cluster_id,
          priority,
          params: {
            ...rest,
          },
        }
      }
      return {
        name,
        description,
        cluster_id,
        priority,
        params: {
          ...rest,
        },
      }
    },
    async doUpdate (values) {
      const { params, ...rest } = this.formatValues(values)
      await this.manager.update({
        id: this.lbAgentId,
        data: rest,
      })
      await this.manager.performAction({
        action: 'params-patch',
        id: this.lbAgentId,
        data: { params },
      })
    },
    async handleCollapseChange (activeKeys) {
      activeKeys.forEach((k) => {
        const tk = `${k}_conf_tmpl`
        if (!this.form.fc.getFieldValue(tk)) {
          this.form.fc.setFieldsValue({
            [tk]: window.atob(this.defaultParams[tk]),
          })
        }
      })
    },
    async getFetchLbAgent () {
      const { id } = this.$route.query
      try {
        const { data = {} } = await this.manager.get(({
          id,
        }))
        this.setValues(data)
      } catch (err) {
        throw err
      }
    },
    async getFetchDefaultParams (cluster) {
      try {
        const { data = {} } = await this.manager.get(({
          id: 'default-params',
          params: {
            cluster,
          },
        }))
        if (data && data.params) {
          this.setValues(data)
        }
      } catch (err) {
        throw err
      }
    },
    async handleSubmit () {
      this.submiting = true
      try {
        const values = await this.form.fc.validateFields()
        if (this.lbAgentId) {
          await this.doUpdate(values)
        }
        this.handleCancel()
      } catch (error) {
        throw error
      } finally {
        this.submiting = false
      }
    },
    handleCancel () {
      this.$router.push('/lbagent')
    },
  },
}
</script>
