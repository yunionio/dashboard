<template>
  <div>
    <mode-select :decorators="decorators" ignore-mode="batch" />
    <template v-if="isSingle">
      <a-form-item :label="$t('compute.text_772')" :extra="$t('compute.text_773')">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_774')" :extra="$t('compute.text_775')">
        <a-input v-decorator="decorators.ipmi_ip_addr" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_776')" :extra="$t('compute.text_775')">
        <a-input v-decorator="decorators.ipmi_username" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_777')" :extra="$t('compute.text_775')">
        <a-input-password v-decorator="decorators.ipmi_password" />
      </a-form-item>
      <a-form-item :label="$t('common_658')" :extra="$t('common_659')">
        <a-input v-decorator="decorators.access_mac" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_778')" :extra="$t('compute.text_781')">
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
      <a-checkbox v-decorator="decorators.no_prepare">{{$t('compute.text_780')}}</a-checkbox>
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
