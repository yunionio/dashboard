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
        <a-form-item label="InfluxDB地址" extra="请输入InfluxDB的IP地址，例如： https://192.168.222.171:30086 ，用于收集负载均衡的监控数据。选填，为空系统则会根据后端服务自动获取">
          <a-row :gutter="8">
            <a-col :span="12">
              <a-input v-decorator="decorators.influx_db_output_url" placeholder="例如：https://192.168.222.171:30086" />
            </a-col>
            <a-col :span="12">
              <a-checkbox class="ml-4" :checked="form.fc.getFieldValue('influx_db_output_unsafe_ssl')" v-decorator="decorators.influx_db_output_unsafe_ssl">忽略https证书校验</a-checkbox>
            </a-col>
          </a-row>
        </a-form-item>
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
      form: {
        fc: this.$form.createForm(this),
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
          'priority',
          {
            initialValue: 1,
            rules: [
              { required: true, message: '请输入优先级' },
            ],
          },
        ],
        preempt: [
          'preempt',
          {
            initialValue: false,
            rules: [
              { required: true, message: '请选择抢占模式' },
            ],
          },
        ],
        virtual_router_id: [
          'virtual_router_id',
          {
            initialValue: 1,
            rules: [
              { required: true, message: '请输入VRRP路由ID' },
            ],
          },
        ],
        interface: [
          'interface',
          {
            rules: [
              { required: true, message: '请输入网卡名称' },
            ],
          },
        ],
        advert_int: [
          'advert_int',
          {
            initialValue: 1,
            rules: [
              { required: true, message: '请输入VRRP通告间隔' },
            ],
          },
        ],
        influx_db_output_url: [
          'influx_db_output_url',
        ],
        influx_db_output_unsafe_ssl: [
          'influx_db_output_unsafe_ssl',
          {
            initialValue: true,
          },
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
  mounted () {
    this.form.fc.setFieldsValue({
      influx_db_output_unsafe_ssl: true,
    })
  },
  methods: {
    createCluster () {
      this.createDialog('LoadbalancerclusterCreateDialog', {
        title: '新建',
      })
    },
    doCreate (data) {
      const params = {
        cluster: data.cluster_id,
        name: data.name,
        params: {
          telegraf: {
            influx_db_output_unsafe_ssl: data.influx_db_output_unsafe_ssl,
            influx_db_output_url: data.influx_db_output_url,
          },
          vrrp: {
            advert_int: data.advert_int,
            interface: data.interface,
            preempt: data.preempt,
            priority: data.priority,
            virtual_router_id: data.virtual_router_id,
          },
        },
      }
      return new this.$Manager('loadbalanceragents').create({ data: params })
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
    handleCancel () {
      this.$router.push('/lbagent')
    },
  },
}
</script>
