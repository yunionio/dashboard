<template>
  <a-spin :spinning="loading">
    <page-header :title="title" />
    <page-body>
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('network.text_21')">
          <a-input :disabled="!!lbAgentId" v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_19')" v-bind="formItemLayout">
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
        <a-form-item :label="$t('network.text_81')" :extra="$t('network.text_82')">
          <a-tooltip :title="$t('network.text_81')">
            <a-input-number v-decorator="decorators.vrrp_priority" :max="255" :min="1" />
          </a-tooltip>
        </a-form-item>
        <a-form-item :label="$t('network.text_83')" :extra="$t('network.text_84')">
          <a-switch :checkedChildren="$t('network.text_85')" :unCheckedChildren="$t('network.text_86')" v-decorator="decorators.vrrp_preempt" />
        </a-form-item>
        <a-form-item :label="$t('network.text_87')" :extra="$t('network.text_88')">
          <a-input-number v-decorator="decorators.virtual_router_id" :max="255" :min="1" />
        </a-form-item>
        <a-form-item :label="$t('network.text_89')" :extra="$t('network.text_90')">
          <a-input v-decorator="decorators.vrrp_interface" :placeholder="$t('network.text_91')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_92')" :extra="$t('network.text_93')">
          <a-input v-decorator="decorators.vrrp_advert_int" type="number" :addonAfter="$t('network.text_76')" />
        </a-form-item>
        <a-collapse :bordered="false">
         <a-collapse-panel :header="$t('network.text_94')" key="1" forceRender>
            <a-form-item :label="$t('network.text_95')" :extra="$t('network.text_96')">
              <a-input v-decorator="decorators.vrrp_pass" />
            </a-form-item>
            <a-form-item v-if="!lbAgentId" :label="$t('network.text_75')">
              <a-input v-decorator="decorators.hb_timeout" type="Number" :addonAfter="$t('network.text_76')" />
            </a-form-item>
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
        <a-button type="primary" size="large" :loading="submiting" @click="handleSubmit">{{ $t('common.create') }}</a-button>
        <a-button class="ml-2" size="large" @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </page-footer>
  </a-spin>
</template>
<script>
import workflowMixin from '@/mixins/workflow'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AgentCreate',
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
        cluster_id: [
          'cluster_id',
          {
            rules: [
              { required: true, message: this.$t('network.text_79') },
            ],
          },
        ],
        hb_timeout: [
          'hb_timeout',
          {
            normalize: v => Number(v),
            initialValue: 3600,
            rules: [
              { type: 'integer', min: 600, max: 3600, message: this.$t('network.text_77'), trigger: 'blur' },
            ],
          },
        ],
        vrrp_priority: [
          'vrrp.priority',
          {
            initialValue: 1,
            rules: [
              { required: true, message: this.$t('network.text_117') },
            ],
          },
        ],
        virtual_router_id: [
          'vrrp.virtual_router_id',
          {
            initialValue: 1,
            rules: [
              { required: true, message: this.$t('network.text_118') },
            ],
          },
        ],
        vrrp_interface: [
          'vrrp.interface',
          {
            rules: [
              { required: true, message: this.$t('network.text_119') },
            ],
          },
        ],
        vrrp_preempt: [
          'vrrp.preempt',
          {
            valuePropName: 'checked',
            initialValue: false,
            rules: [
              { required: true, message: this.$t('network.text_120') },
            ],
          },
        ],
        vrrp_advert_int: [
          'vrrp.advert_int',
          {
            normalize: v => Number(v),
            initialValue: 1,
            rules: [
              { required: true, message: this.$t('network.text_121') },
              { type: 'integer', min: 1, max: 255, message: this.$t('network.text_122'), trigger: 'blur' },
            ],
          },
        ],
        vrrp_pass: [
          'vrrp.pass',
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
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    lbAgentId () {
      return this.$route.query.id
    },
    title () {
      return this.lbAgentId ? this.$t('network.text_722') : this.$t('network.text_78')
    },
  },
  created () {
    this.manager = new this.$Manager('loadbalanceragents')
    if (this.lbAgentId) {
      this.getFetchLbAgent()
    } else {
      this.getFetchDefaultParams()
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
        cluster_id: data.cluster_id,
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
      const { name, cluster_id, ...params } = values
      if (this.lbAgentId) {
        return {
          name,
          cluster_id,
          ...params,
        }
      }
      return {
        name,
        cluster_id,
        params,
      }
    },
    doCreate (values) {
      return this.manager.create({
        data: this.formatValues(values),
      })
    },
    doUpdate (values) {
      return this.manager.performAction({
        action: 'params-patch',
        id: this.lbAgentId,
        data: this.formatValues(values),
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
        } else {
          await this.doCreate(values)
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
