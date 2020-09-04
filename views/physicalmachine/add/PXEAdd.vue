<template>
  <div>
    <mode-select :decorators="decorators" ignore-mode="batch" />
    <template v-if="isSingle">
      <a-form-item label="物理机名称" extra="该物理机在系统中显示的名字">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item label="IPMI地址" extra="请输入已配置好的BMC的信息">
        <a-input v-decorator="decorators.ipmi_ip_addr" />
      </a-form-item>
      <a-form-item label="IPMI用户名" extra="请输入已配置好的BMC的信息">
        <a-input v-decorator="decorators.ipmi_username" />
      </a-form-item>
      <a-form-item label="IPMI密码" extra="请输入已配置好的BMC的信息">
        <a-input-password v-decorator="decorators.ipmi_password" />
      </a-form-item>
      <a-form-item label="管理口MAC地址" extra="支持Redfish的服务器无需填写，其它可根据实际情况填写">
        <a-input v-decorator="decorators.access_mac" />
      </a-form-item>
      <a-form-item label="管理口IP" extra="会根据输入的IP子网或者IP地址设置物理机的管理口IP，留空则使用DHCP自动分配的IP作为管理口IP">
        <net-select v-decorator="decorators.net" :project-domain="fd.project_domain" />
      </a-form-item>
    </template>
    <template v-if="isFile">
      <file-select
        :offset-wrapper-col="offsetWrapperCol"
        :decorators="decorators"
        download-url="/v1/downloads/BatchHostPXERegister" />
    </template>
    <a-form-item :wrapper-col="offsetWrapperCol">
      <a-checkbox v-decorator="decorators.no_prepare">只注册不引导</a-checkbox>
    </a-form-item>
  </div>
</template>

<script>
import ModeSelect from '../components/ModeSelect'
import FileSelect from '../components/FileSelect'
import NetSelect from '../components/NetSelect'

export default {
  name: 'PhysicalmachinePXEAdd',
  components: {
    ModeSelect,
    FileSelect,
    NetSelect,
  },
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
  computed: {
    isSingle () {
      return this.fd.mode === 'single'
    },
    isFile () {
      return this.fd.mode === 'file'
    },
  },
}
</script>
