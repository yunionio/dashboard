<template>
  <div>
    <mode-select :decorators="decorators" />
    <template v-if="isSingle">
      <a-form-item :label="$t('compute.text_385')" :extra="$t('compute.text_783')">
        <a-input v-decorator="decorators.mac" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_772')" :extra="$t('compute.text_773')">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item :label="$t('common.description')">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_774')" :extra="$t('compute.text_784')">
        <a-input v-decorator="decorators.ipmi_ip_addr" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_776')" :extra="$t('compute.text_785')">
        <a-input v-decorator="decorators.ipmi_username" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_777')" :extra="$t('compute.text_782', [ ipmiPassword ])">
        <a-input-password v-decorator="decorators.ipmi_password" />
      </a-form-item>
      <a-form-item :label="$t('common.text00012')" class="mb-0">
        <tag
          v-decorator="decorators.__meta__" />
      </a-form-item>
    </template>
    <template v-if="isBatch">
      <a-form-item :wrapper-col="offsetWrapperCol">
        <a-alert type="warning">
          <template v-slot:message>
            <div>{{$t('compute.text_786')}}</div>
            <div>{{$t('compute.text_787')}}</div>
            <div>{{$t('compute.text_788')}}</div>
            <div>{{$t('compute.text_789')}}</div>
            <div>{{$t('compute.text_790')}}</div>
            <div>{{$t('compute.text_793')}}</div>
            <div>{{$t('compute.text_794')}}</div>
            <div>{{$t('compute.text_795')}}</div>
            <div>{{$t('compute.text_796', [ ipmiPassword ])}}</div>
          </template>
        </a-alert>
      </a-form-item>
      <a-form-item :wrapper-col="offsetWrapperCol">
        <a-textarea v-decorator="decorators.content" :placeholder="$t('compute.text_797')" :autosize="{ minRows: 5, maxRows: 10 }" />
        <div class="text-right">
          <span class="text-color-help">{{$t('compute.text_798', [ total ])}}</span> | <a-button class="pl-0 pr-0" type="link" @click="handleClearContent">{{$t('compute.text_799')}}</a-button>
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
import Tag from '@/sections/Tag'

export default {
  name: 'PhysicalmachinePreAdd',
  components: {
    ModeSelect,
    FileSelect,
    Tag,
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
