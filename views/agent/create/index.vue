<template>
  <a-spin :spinning="loading">
    <page-header title="新建节点" />
    <page-body>
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="名称">
          <a-input v-decorator="decorators.name" placeholder="字母开头，数字和字母大小写组合，长度为2-128个字符，不含'.','_','@'" />
        </a-form-item>
        <a-form-item label="集群" v-bind="formItemLayout">
          <base-select
            @change="handleClusterChange"
            v-decorator="decorators.cluster_id"
            resource="loadbalancerclusters"
            remote
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            showSync
            :select-props="{ placeholder: '请选择集群' }" />
          <p slot="extra">
            没有我想要的，立即 <a-button type="link" size="small" @click="createCluster">新建</a-button>
          </p>
        </a-form-item>
        <a-form-item label="优先级" extra="指定VRRP实例优先级，优先级大的为主">
          <a-tooltip title="优先级">
            <a-input-number v-decorator="decorators.priority" :max="255" :min="1" />
          </a-tooltip>
        </a-form-item>
        <a-form-item label="抢占模式" extra="高优先级VRRP SLAVE实例见到低优先级的VRRP MASTER实例时，是否抢占完成MASTER角色切换">
          <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.preempt" />
        </a-form-item>
        <a-form-item label="VRRP路由ID" extra="主备组的ID值必须相同。同一个二层网络中，不同集群的VRRP路由ID必须不同">
          <a-input-number v-decorator="decorators.virtual_router_id" :max="255" :min="1" />
        </a-form-item>
        <a-form-item label="VRRP网口" extra="VRRP实例广播通告用的网卡名">
          <a-input v-decorator="decorators.interface" placeholder="请输入网卡名称，例如：eth0" />
        </a-form-item>
        <a-form-item label="VRRP通告间隔" extra="VRRP广播通告间隔，关系到故障时自动切换的灵敏度">
          <a-input v-decorator="decorators.advert_int" type="number" addonAfter="秒" />
        </a-form-item>
        <a-collapse :bordered="false">
         <a-collapse-panel header="高级配置" key="1" forceRender>
            <a-form-item label="VRRP密码" extra="主备组的VRRP密码必须相同，为空则密码默认为YunionLB">
              <a-input v-decorator="decorators.vrrp_pass" />
            </a-form-item>
            <a-form-item label="转发实例心跳超时时间">
              <a-input v-decorator="decorators.hb_timeout" type="Number" addonAfter="秒" />
            </a-form-item>
            <a-collapse @change="handleCollapseChange">
              <a-collapse-panel key="telegraf" header="配置Telegraf参数" forceRender>
                <a-form-item label="InfluxDB地址" extra="请输入InfluxDB的IP地址，例如： https://192.168.222.171:30086 ，用于收集负载均衡的监控数据。选填，为空系统则会根据后端服务自动获取">
                  <a-row :gutter="8">
                    <a-col :span="12">
                      <a-input v-decorator="decorators.telegraf_influx_db_output_url" placeholder="例如：https://192.168.222.171:30086" />
                    </a-col>
                    <a-col :span="12">
                      <a-checkbox class="ml-4" v-decorator="decorators.telegraf_influx_db_output_unsafe_ssl">忽略https证书校验</a-checkbox>
                    </a-col>
                  </a-row>
                </a-form-item>
                <a-form-item label="InfluxDB数据库名称" extra="主备组的VRRP密码必须相同，为空则密码默认为YunionLB">
                  <a-input v-decorator="decorators.telegraf_influx_db_output_name" />
                </a-form-item>
                <a-form-item label="监控数据采集间隔">
                  <a-input v-decorator="decorators.haproxy_input_interval" type="Number" addonAfter="秒" />
                </a-form-item>
                <a-form-item label="配置模版">
                  <code-mirror v-decorator="decorators.telegraf_conf_tmpl" :options="cmOptions" />
                </a-form-item>
              </a-collapse-panel>
              <a-collapse-panel key="haproxy" header="配置HAProxy参数" forceRender>
                <a-form-item label="HAProxy线程数">
                  <a-input v-decorator="decorators.haproxy_global_nbthread" type="Number" />
                </a-form-item>
                <a-form-item label="日志输出设置">
                  <a-input v-decorator="decorators.haproxy_global_log" placeholder="请输入日志输出位置" extra="例如：/dev/log（转发节点本地系统日志）、IP（远端的syslog服务器）、IP:Port（默认为UDP 514）；为空则表示不记录日志" />
                </a-form-item>
                <a-form-item label="记录HTTP日志">
                  <a-switch v-decorator="decorators.haproxy_log_http" />
                </a-form-item>
                <a-form-item label="记录TCP日志">
                  <a-switch v-decorator="decorators.haproxy_log_tcp" />
                </a-form-item>
                 <a-form-item label="记录Normal日志">
                  <a-switch v-decorator="decorators.haproxy_log_normal" />
                </a-form-item>
                <a-form-item label="请求中最大http头数量">
                  <a-input v-decorator="decorators.haproxy_tune_http_maxhdr" extra="为空则表示为默认值101" type="Number" />
                </a-form-item>
                <a-form-item label="配置模版">
                  <code-mirror v-decorator="decorators.haproxy_conf_tmpl" :options="cmOptions" />
                </a-form-item>
              </a-collapse-panel>
              <a-collapse-panel key="keepalived" header="配置Keepalived参数" forceRender>
                <a-form-item label="配置模版">
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
        <a-button type="primary" size="large" :loading="submiting" @click="handleSubmit">{{ $t('dialog.ok') }}</a-button>
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
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        cluster_id: [
          'cluster_id',
          {
            rules: [
              { required: true, message: '请选择集群' },
            ],
          },
        ],
        priority: [
          'vrrp.priority',
          {
            initialValue: 1,
            rules: [
              { required: true, message: '请输入优先级' },
            ],
          },
        ],
        virtual_router_id: [
          'vrrp.virtual_router_id',
          {
            initialValue: 1,
            rules: [
              { required: true, message: '请输入VRRP路由ID' },
            ],
          },
        ],
        interface: [
          'vrrp.interface',
          {
            rules: [
              { required: true, message: '请输入网卡名称' },
            ],
          },
        ],
        preempt: [
          'vrrp.preempt',
          {
            initialValue: false,
            rules: [
              { required: true, message: '请选择抢占模式' },
            ],
          },
        ],
        advert_int: [
          'vrrp.advert_int',
          {
            normalize: v => Number(v),
            initialValue: 1,
            rules: [
              { required: true, message: '请输入VRRP通告间隔' },
              { type: 'integer', min: 1, max: 255, message: `请输入范围在 1-255 之间`, trigger: 'blur' },
            ],
          },
        ],
        vrrp_pass: [
          'vrrp.pass',
        ],
        hb_timeout: [
          'hb_timeout',
          {
            normalize: v => Number(v),
            initialValue: 3600,
            rules: [
              { type: 'integer', min: 600, max: 3600, message: `请输入范围在 600-3600 之间`, trigger: 'blur' },
            ],
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
        haproxy_input_interval: [
          'haproxy_input_interval',
          {
            normalize: v => Number(v),
            rules: [
              { type: 'integer', min: 1, max: 600, message: `请输入范围在 1-600 之间`, trigger: 'blur' },
            ],
          },
        ],
        haproxy_global_nbthread: [
          'haproxy.global_nbthread',
          {
            normalize: v => Number(v),
            rules: [
              { type: 'integer', min: 1, max: 64, message: `请输入范围在 1-64 之间`, trigger: 'blur' },
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
            initialValue: 1,
            normalize: v => Number(v),
            rules: [
              { type: 'integer', min: 1, max: 32767, message: `请输入范围在 1-32767 之间`, trigger: 'blur' },
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
  created () {
    this.manager = new this.$Manager('loadbalanceragents')
    this.getFetchDefaultParams()
  },
  methods: {
    createCluster () {
      this.createDialog('LoadbalancerclusterCreateDialog', {
        title: '新建',
      })
    },
    handleClusterChange (id) {
      this.getFetchDefaultParams(id)
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
    doCreate (values) {
      const templKeys = ['telegraf_conf_tmpl', 'haproxy_conf_tmpl', 'keepalived_conf_tmpl']
      templKeys.forEach(k => {
        if (values[k]) {
          values[k] = window.btoa(values[k])
        } else {
          values[k] = this.defaultParams[k]
        }
      })
      if (values.haproxy.global_log_path) {
        const logConfs = this.defaultParams['haproxy']['global_log'].split(' ')
        logConfs[1] = values.haproxy.global_log_path
        values['haproxy']['global_log'] = logConfs.join(' ')
        delete values.global_log_path
      }
      const { name, cluster_id, ...params } = values
      return this.manager.create({
        data: {
          name,
          cluster_id,
          params,
        },
      })
    },
    async handleSubmit () {
      this.submiting = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.handleCancel()
      } catch (error) {
        throw error
      } finally {
        this.submiting = false
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
          const defaultParams = data.params
          this.defaultParams = defaultParams
          if (defaultParams.haproxy && defaultParams.haproxy.global_log) {
            defaultParams.haproxy['global_log_path'] = defaultParams.haproxy.global_log.split(' ')[1]
          }
          this.form.fc.setFieldsValue({
            haproxy_input_interval: defaultParams.telegraf.haproxy_input_interval,
            telegraf: defaultParams.telegraf,
            haproxy: defaultParams.haproxy,
          })
        }
      } catch (err) {
        throw err
      }
    },
    handleCancel () {
      this.$router.push('/lbagent')
    },
  },
}
</script>
