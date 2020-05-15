<template>
  <div>
    <mode-select :decorators="decorators" />
    <template v-if="isSingle">
      <a-form-item label="MAC地址" extra="请输入物理机管理口的MAC地址，一般为eth0">
        <a-input v-decorator="decorators.mac" />
      </a-form-item>
      <a-form-item label="物理机名称" extra="该物理机在系统中显示的名字">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item label="IPMI地址" extra="为空时，系统默认自动分配IP；不为空时，则使用用户输入信息。新机器建议留空，老机器建议输入旧IP">
        <a-input v-decorator="decorators.ipmi_ip_addr" />
      </a-form-item>
      <a-form-item label="IPMI用户名" extra="为空时，系统默认使用 root ；不为空时，则使用用户输入信息。新机器建议留空，老机器建议输入旧用户名">
        <a-input v-decorator="decorators.ipmi_username" />
      </a-form-item>
      <a-form-item label="IPMI密码" :extra="`为空时，系统默认使用 ${ ipmiPassword }；不为空时，则使用用户输入信息。新机器建议留空，老机器建议输入旧密码`">
        <a-input-password v-decorator="decorators.ipmi_password" />
      </a-form-item>
    </template>
    <template v-if="isBatch">
      <a-form-item :wrapper-col="offsetWrapperCol">
        <a-alert type="warning">
          <template v-slot:message>
            <div>通过本功能可以提前设置预上架物理机的信息（物理机MAC地址为唯一标识），包括物理机的名称、IPMI地址等，录入的信息</div>
            <div>格式规范如下：</div>
            <div>一行一条物理机记录，一次最多支持100条</div>
            <div>格式为：MAC地址,名称,IPMI地址,IPMI用户名,IPMI密码</div>
            <div>中间以英文状态的逗号（","）分隔，若密码中含有英文状态的逗号（","），请将该记录摘除并使用【单条录入】功能进行注册</div>
            <div>例如：ee:b3:f4:48:1c:f5,gpuhost01,192.168.1.1,root,admin123</div>
            <div>其中，MAC地址、名称为必填选项，其他为选填，选填字段值可直接省略</div>
            <div>例如：ee:b3:f4:48:1c:f5,gpuhost01,,, --省略了IPMI地址、IPMI用户名和IPMI密码</div>
            <div>选填字段为空时，依次表示默认自动分配IP、默认使用用户名root、默认使用密码{{ ipmiPassword }}；不为空时，则使用用户输入的信息</div>
          </template>
        </a-alert>
      </a-form-item>
      <a-form-item :wrapper-col="offsetWrapperCol">
        <a-textarea v-decorator="decorators.content" placeholder="请输入内容" :autosize="{ minRows: 5, maxRows: 10 }" />
        <div class="text-right">
          <span class="text-color-help">{{ total }}条</span> | <a-button class="pl-0 pr-0" type="link" @click="handleClearContent">清空记录</a-button>
        </div>
      </a-form-item>
    </template>
    <template v-if="isFile">
      <file-select
        :offset-wrapper-col="offsetWrapperCol"
        :decorators="decorators"
        download-url="/v1/downloads/BatchHostRegister" />
    </template>
  </div>
</template>

<script>
import ModeSelect from '../components/ModeSelect'
import FileSelect from '../components/FileSelect'

export default {
  name: 'PhysicalmachinePreAdd',
  components: {
    ModeSelect,
    FileSelect,
  },
  inject: ['form'],
  props: {
    offsetWrapperCol: {
      type: Object,
      required: true,
    },
    decorators: {
      type: Object,
      required: true,
    },
    fd: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      ipmiPassword: '-',
    }
  },
  computed: {
    isSingle () {
      return this.fd.mode === 'single'
    },
    isBatch () {
      return this.fd.mode === 'batch'
    },
    isFile () {
      return this.fd.mode === 'file'
    },
    total () {
      const lines = (this.fd.content && this.fd.content.split(/\r*\n/).filter((item) => item.length > 0)) || []
      return lines.length || 0
    },
  },
  created () {
    this.fetchDefaultIpmiPassword()
  },
  methods: {
    handleClearContent () {
      this.form.fc.setFieldsValue({
        content: undefined,
      })
    },
    async fetchDefaultIpmiPassword () {
      let manager = new this.$Manager('services', 'v1')
      try {
        const listResponse = await manager.list({
          params: {
            type: ['baremetal'],
          },
        })
        const data = (listResponse.data.data || [])[0]
        const serviceId = data && data.id
        if (!serviceId) return
        const configResponse = await manager.getSpecific({
          id: serviceId,
          spec: 'config',
        })
        const config = (configResponse.data.config && configResponse.data.config.default) || {}
        this.ipmiPassword = config.default_ipmi_password
      } catch (error) {
        throw error
      } finally {
        manager = null
      }
    },
  },
}
</script>
