<template>
  <div>
    <page-header :title="$t('compute.text_804')" />
    <page-body needMarginBottom>
      <a-alert class="mb-3" :message="$t('compute.physicalmachine_add')" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_805')" :extra="desc">
          <a-radio-group v-decorator="decorators.type" @change="handleTypeChange">
            <template v-for="(item, key) of types">
              <a-radio-button :value="key" :key="key">{{ item.label }}</a-radio-button>
            </template>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.text_297', [$t('dictionary.domain')])" v-if="isAdminMode && !isScriptAdd">
          <domain-select v-decorator="decorators.project_domain" />
        </a-form-item>
        <component
          :is="form.fd.type"
          :decorators="decorators"
          :fd="form.fd"
          :offset-wrapper-col="offsetWrapperCol"
          :fc="form.fc" />
      </a-form>
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" :loading="adding" @click="handleAdd" v-if="!isScriptAdd">{{$t('compute.text_162')}}</a-button>
        <a-button class="ml-2" @click="handleBack">{{$t('compute.text_135')}}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { resolveValueChangeField } from '@/utils/common/ant'
import validateForm, { isWithinRange, validate } from '@/utils/validate'
import DomainSelect from '@/sections/DomainSelect'
import ScriptAdd from './ScriptAdd'
import PreAdd from './PreAdd'
import ISOAdd from './ISOAdd'
import PXEAdd from './PXEAdd'

export default {
  name: 'PhysicalmachineAdd',
  components: {
    ScriptAdd,
    PreAdd,
    IsoAdd: ISOAdd,
    PxeAdd: PXEAdd,
    DomainSelect,
  },
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    const typeInitialValue = 'pxeAdd'
    const modeInitialValue = 'single'
    const projectDomainInitialValue = this.$store.getters.userInfo.projectDomainId
    return {
      adding: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            this.$nextTick(() => {
              const newField = resolveValueChangeField(values)
              R.forEachObjIndexed((item, key) => {
                this.$set(this.form.fd, key, item)
              }, newField)
            })
          },
        }),
        fd: {
          type: typeInitialValue,
          mode: modeInitialValue,
          project_domain: projectDomainInitialValue,
        },
      },
      types: this.$t('physicalmachineAddTypes'),
      typeInitialValue,
      modeInitialValue,
      projectDomainInitialValue,
      ipmi_ip_addr_required: false,
      ipmi_username_required: false,
      ipmi_password_required: false,
      net_required: false,
      formItemLayout: {
        wrapperCol: {
          md: { span: 16 },
          xl: { span: 18 },
          xxl: { span: 20 },
        },
        labelCol: {
          md: { span: 8 },
          xl: { span: 6 },
          xxl: { span: 4 },
        },
      },
      offsetWrapperCol: {
        md: { span: 16, offset: 8 },
        xl: { span: 18, offset: 6 },
        xxl: { span: 20, offset: 4 },
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    decorators () {
      return {
        type: [
          'type',
          {
            initialValue: this.typeInitialValue,
          },
        ],
        project_domain: [
          'project_domain',
          {
            initialValue: this.projectDomainInitialValue,
          },
        ],
        mode: [
          'mode',
          {
            initialValue: this.modeInitialValue,
          },
        ],
        mac: [
          'mac',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_806') },
              { validator: validateForm('mac') },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_807') },
              { validator: validateForm('serverName') },
            ],
          },
        ],
        description: ['description'],
        ipmi_ip_addr: [
          'ipmi_ip_addr',
          {
            validateFirst: true,
            rules: [
              { required: this.ipmi_ip_addr_required, message: this.$t('compute.text_808') },
              { validator: this.validateIpAddr, trigger: 'change' },
              { validator: this.checkIpInNetwork, trigger: 'change' },
            ],
          },
        ],
        ipmi_username: [
          'ipmi_username',
          {
            rules: [
              { required: this.ipmi_username_required, message: this.$t('compute.text_809') },
            ],
          },
        ],
        ipmi_password: [
          'ipmi_password',
          {
            rules: [
              { required: this.ipmi_password_required, message: this.$t('compute.text_810') },
            ],
          },
        ],
        net: [
          'net',
          {
            validateFirst: true,
            rules: [
              { required: this.net_required, message: this.$t('compute.text_811') },
              { validator: this.validateNet },
            ],
          },
        ],
        content: [
          'content',
          {
            rules: [
              { required: true, message: this.$t('compute.text_797') },
            ],
          },
        ],
        file: [
          'file',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_812') },
              { validator: this.validateFile },
            ],
          },
        ],
        no_prepare: [
          'no_prepare',
          {
            valuePropName: 'checked',
          },
        ],
        no_bmc: [
          'no_bmc',
          {
            valuePropName: 'checked',
          },
        ],
        access_mac: [
          'access_mac',
          {
            rules: [
              { validator: validateForm('mac', false) },
            ],
          },
        ],
        __meta__: [
          '__meta__',
          {
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
      }
    },
    desc () {
      return this.types[this.form.fd.type].desc
    },
    isScriptAdd () {
      return this.form.fd.type === 'scriptAdd'
    },
    isPreSingleAdd () {
      return this.form.fd.type === 'preAdd' && this.form.fd.mode === 'single'
    },
    isPreBatchAdd () {
      return this.form.fd.type === 'preAdd' && this.form.fd.mode === 'batch'
    },
    isPreFilehAdd () {
      return this.form.fd.type === 'preAdd' && this.form.fd.mode === 'file'
    },
    isIsoSingleAdd () {
      return this.form.fd.type === 'isoAdd' && this.form.fd.mode === 'single'
    },
    isIsoFileAdd () {
      return this.form.fd.type === 'isoAdd' && this.form.fd.mode === 'file'
    },
    isPxeSingleAdd () {
      return this.form.fd.type === 'pxeAdd' && this.form.fd.mode === 'single'
    },
    isPxeFileAdd () {
      return this.form.fd.type === 'pxeAdd' && this.form.fd.mode === 'file'
    },
  },
  watch: {
    'form.fd.type': {
      handler (val) {
        if (val === 'isoAdd') {
          this.ipmi_ip_addr_required = true
          this.ipmi_username_required = true
          this.ipmi_password_required = true
          this.net_required = true
        } else if (val === 'pxeAdd') {
          this.ipmi_ip_addr_required = true
          this.ipmi_username_required = true
          this.ipmi_password_required = true
          this.net_required = false
        } else {
          this.ipmi_ip_addr_required = false
          this.ipmi_username_required = false
          this.ipmi_password_required = false
          this.net_required = false
        }
      },
      immediate: true,
    },
  },
  destroyed () {
    this.hm = null
    this.um = null
  },
  created () {
    this.hm = new this.$Manager('hosts')
    this.hvm = new this.$Manager('hosts/validate-ipmi', 'v1')
    this.um = new this.$Manager('uploads', 'v1')
  },
  methods: {
    // 预注册单条录入
    doPreSingleAdd () {
      const data = {
        mac: this.form.fd.mac,
        access_mac: this.form.fd.mac,
        name: this.form.fd.name,
        description: this.form.fd.description,
        ipmi_ip_addr: this.form.fd.ipmi_ip_addr,
        ipmi_username: this.form.fd.ipmi_username,
        ipmi_password: this.form.fd.ipmi_password,
        __meta__: this.form.fd.__meta__,
        no_probe: true,
        no_bmc: this.form.fd.no_bmc,
      }
      if (this.form.fd.project_domain && this.isAdminMode) {
        data.project_domain = this.form.fd.project_domain
      }
      if (this.form.fd.net) {
        if (this.form.fd.net.access_net && !this.form.fd.net.access_ip) {
          data.access_net = this.form.fd.net.access_net.id
        }
        if (this.form.fd.net.access_net && this.form.fd.net.access_ip) {
          data.access_ip = this.form.fd.net.access_ip
        }
      }
      return this.hm.create({
        data,
      })
    },
    // 预注册批量录入
    doPreBatchAdd () {
      const params = {
        hosts: this.form.fd.content,
        no_probe: true,
      }
      if (this.form.fd.project_domain && this.isAdminMode) {
        params.project_domain = this.form.fd.project_domain
      }
      return this.hm.rpc({
        methodname: 'DoBatchRegister',
        params,
      })
    },
    // 预注册文件录入
    doPreFileAdd () {
      const fd = new FormData()
      fd.append('action', 'BatchHostRegister')
      fd.append('hosts', new Blob([this.form.fd.file.file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
      fd.append('no_probe', true)
      if (this.form.fd.project_domain && this.isAdminMode) {
        fd.append('project_domain', this.form.fd.project_domain)
      }
      return this.um.create({
        data: fd,
      }).catch(error => {
        this.$bus.$emit('PhysicalmachineAddFileSelectClear')
        throw error
      })
    },
    // ISO单条录入
    doIsoSingleAdd () {
      const data = {
        name: this.form.fd.name,
        description: this.form.fd.description,
        ipmi_ip_addr: this.form.fd.ipmi_ip_addr,
        ipmi_username: this.form.fd.ipmi_username,
        ipmi_password: this.form.fd.ipmi_password,
        enable_pxe_boot: false,
        no_prepare: this.form.fd.no_prepare || false,
        __meta__: this.form.fd.__meta__,
      }
      if (this.form.fd.project_domain && this.isAdminMode) {
        data.project_domain = this.form.fd.project_domain
      }
      if (this.form.fd.net) {
        if (this.form.fd.net.access_net && !this.form.fd.net.access_ip) {
          data.access_net = this.form.fd.net.access_net.id
        }
        if (this.form.fd.net.access_net && this.form.fd.net.access_ip) {
          data.access_ip = this.form.fd.net.access_ip
        }
      }
      return this.hm.create({
        data,
      })
    },
    // ISO文件录入
    doIsoFileAdd () {
      const fd = new FormData()
      fd.append('action', 'BatchHostRegister')
      fd.append('hosts', new Blob([this.form.fd.file.file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
      fd.append('no_prepare', this.form.fd.no_prepare || false)
      if (this.form.fd.project_domain && this.isAdminMode) {
        fd.append('project_domain', this.form.fd.project_domain)
      }
      return this.um.create({
        data: fd,
      }).catch(error => {
        this.$bus.$emit('PhysicalmachineAddFileSelectClear')
        throw error
      })
    },
    // PXE单条录入
    doPxeSingleAdd () {
      const data = {
        name: this.form.fd.name,
        description: this.form.fd.description,
        ipmi_ip_addr: this.form.fd.ipmi_ip_addr,
        ipmi_username: this.form.fd.ipmi_username,
        ipmi_password: this.form.fd.ipmi_password,
        enable_pxe_boot: true,
        no_prepare: this.form.fd.no_prepare || false,
        access_mac: this.form.fd.access_mac,
        __meta__: this.form.fd.__meta__,
      }
      if (this.form.fd.project_domain && this.isAdminMode) {
        data.project_domain = this.form.fd.project_domain
      }
      if (this.form.fd.net) {
        if (this.form.fd.net.access_net && !this.form.fd.net.access_ip) {
          data.access_net = this.form.fd.net.access_net.id
        }
        if (this.form.fd.net.access_net && this.form.fd.net.access_ip) {
          data.access_ip = this.form.fd.net.access_ip
        }
      }
      return this.hm.create({
        data,
      })
    },
    // PXE文件录入
    doPxeFileAdd () {
      const fd = new FormData()
      fd.append('action', 'BatchHostRegister')
      fd.append('hosts', new Blob([this.form.fd.file.file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
      fd.append('no_prepare', this.form.fd.no_prepare || false)
      if (this.form.fd.project_domain && this.isAdminMode) {
        fd.append('project_domain', this.form.fd.project_domain)
      }
      return this.um.create({
        data: fd,
      }).catch(error => {
        this.$bus.$emit('PhysicalmachineAddFileSelectClear')
        throw error
      })
    },
    async checkMac (values) {
      const res = await this.hvm.create({
        data: {
          ip: values.ipmi_ip_addr,
          username: values.ipmi_username,
          password: values.ipmi_password,
        },
      })
      if (res.data?.is_redfish_supported || (!res.data?.is_redfish_supported && values.access_mac)) {
        return Promise.resolve()
      } else {
        this.$message.error(this.$t('compute.access_mac_required'))
        return Promise.reject(new Error('mac'))
      }
    },
    handleBack () {
      this.$router.push('/physicalmachine')
    },
    async handleAdd () {
      try {
        const values = await this.form.fc.validateFields()
        this.adding = true
        if (this.isPreSingleAdd) {
          await this.doPreSingleAdd()
        }
        if (this.isPreBatchAdd) {
          await this.doPreBatchAdd()
        }
        if (this.isPreFilehAdd) {
          await this.doPreFileAdd()
        }
        if (this.isIsoSingleAdd) {
          await this.doIsoSingleAdd()
        }
        if (this.isIsoFileAdd) {
          await this.doIsoFileAdd()
        }
        if (this.isPxeSingleAdd) {
          await this.checkMac(values)
          await this.doPxeSingleAdd()
        }
        if (this.isPxeFileAdd) {
          await this.doPxeFileAdd()
        }
        this.$router.push('/physicalmachine')
      } catch (error) {
        throw error
      } finally {
        this.adding = false
      }
    },
    validateIpAddr (rule, value, callback) {
      if (value) {
        const ret = validate(value, 'IPv4')
        if (ret !== true) {
          return callback(new Error(ret.msg))
        }
      }
      return callback()
    },
    checkIpInNetwork (rule, value, callback) {
      if (value) {
        return this.getIpAddr(value).then((res) => {
          const data = res.data.data || []
          if (data.length === 0) {
            return callback(new Error(this.$t('compute.text_1333')))
          }
        })
      }
      return callback()
    },
    validateNet (rule, value, callback) {
      if (value && value.access_ip) {
        if (!isWithinRange(value.access_ip, value.access_net.guest_ip_start, value.access_net.guest_ip_end)) {
          return callback(new Error(this.$t('compute.text_205')))
        }
      }
      return callback()
    },
    validateFile (rule, value, callback) {
      if (value) {
        if (value.file && !value.file.name.endsWith('.xlsx')) {
          return callback(new Error(this.$t('compute.text_813')))
        }
      }
      return callback()
    },
    handleTypeChange (e) {
      const project_domain = this.form.fc.getFieldValue('project_domain')
      this.form.fc.resetFields()
      this.$nextTick(() => {
        this.form.fc.getFieldDecorator('mode', { preserve: true })
        this.form.fc.getFieldDecorator('project_domain', { preserve: true })
        this.form.fc.setFieldsValue({
          type: e.target.value,
          mode: 'single',
          project_domain,
        })
      })
    },
    getIpAddr (val) {
      return new this.$Manager('networks')
        .list({
          params: {
            server_type: 'ipmi',
            ip: val,
            scope: this.$store.getters.scope,
          },
        })
    },
  },
}
</script>
