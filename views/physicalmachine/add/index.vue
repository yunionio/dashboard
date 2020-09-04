<template>
  <div>
    <page-header title="添加物理机" />
    <page-body>
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="添加方式" :extra="desc">
          <a-radio-group v-decorator="decorators.type" @change="handleTypeChange">
            <template v-for="(item, key) of types">
              <a-radio-button :value="key" :key="key">{{ item.label }}</a-radio-button>
            </template>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="`指定${$t('dictionary.domain')}`" v-if="isAdminMode && !isScriptAdd">
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
        <a-button type="primary" size="large" :loading="adding" @click="handleAdd" v-if="!isScriptAdd">确定</a-button>
        <a-button class="ml-2" size="large" @click="handleBack">取消</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ScriptAdd from './ScriptAdd'
import PreAdd from './PreAdd'
import ISOAdd from './ISOAdd'
import PXEAdd from './PXEAdd'
import { resolveValueChangeField } from '@/utils/common/ant'
import validateForm, { isWithinRange, validate } from '@/utils/validate'
import DomainSelect from '@/sections/DomainSelect'

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
    const typeInitialValue = 'scriptAdd'
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
          span: 21,
          xxl: {
            span: 22,
          },
        },
        labelCol: {
          span: 3,
          xxl: {
            span: 2,
          },
        },
      },
      offsetWrapperCol: {
        span: 21,
        offset: 3,
        xxl: {
          span: 22,
          offset: 2,
        },
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
              { required: true, message: '请填写MAC地址' },
              { validator: validateForm('mac') },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入物理机名称' },
              { validator: validateForm('serverName') },
            ],
          },
        ],
        ipmi_ip_addr: [
          'ipmi_ip_addr',
          {
            validateFirst: true,
            rules: [
              { required: this.ipmi_ip_addr_required, message: '请输入IPMI地址' },
              { validator: this.validateIpAddr },
              { validator: this.checkIpInNetwork },
            ],
          },
        ],
        ipmi_username: [
          'ipmi_username',
          {
            rules: [
              { required: this.ipmi_username_required, message: '请输入IPMI用户名' },
            ],
          },
        ],
        ipmi_password: [
          'ipmi_password',
          {
            rules: [
              { required: this.ipmi_password_required, message: '请输入IPMI密码' },
            ],
          },
        ],
        net: [
          'net',
          {
            validateFirst: true,
            rules: [
              { required: this.net_required, message: '请选择管理口IP' },
              { validator: this.validateNet },
            ],
          },
        ],
        content: [
          'content',
          {
            rules: [
              { required: true, message: '请输入内容' },
            ],
          },
        ],
        file: [
          'file',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请选择文件' },
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
        access_mac: [
          'access_mac',
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
    'form.fd.type' (val) {
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
  },
  destroyed () {
    this.hm = null
    this.um = null
  },
  created () {
    this.hm = new this.$Manager('hosts')
    this.um = new this.$Manager('uploads', 'v1')
  },
  methods: {
    // 预注册单条录入
    doPreSingleAdd () {
      const data = [
        this.form.fd.mac,
        this.form.fd.name,
        this.form.fd.ipmi_ip_addr,
        this.form.fd.ipmi_username,
        this.form.fd.ipmi_password,
      ]
      const params = {
        hosts: data.join(','),
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
      fd.append('hosts', this.form.fd.file.file)
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
        ipmi_ip_addr: this.form.fd.ipmi_ip_addr,
        ipmi_username: this.form.fd.ipmi_username,
        ipmi_password: this.form.fd.ipmi_password,
        enable_pxe_boot: false,
        no_prepare: this.form.fd.no_prepare || false,
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
      fd.append('hosts', this.form.fd.file.file)
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
        ipmi_ip_addr: this.form.fd.ipmi_ip_addr,
        ipmi_username: this.form.fd.ipmi_username,
        ipmi_password: this.form.fd.ipmi_password,
        enable_pxe_boot: true,
        no_prepare: this.form.fd.no_prepare || false,
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
      fd.append('hosts', this.form.fd.file.file)
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
    handleBack () {
      this.$router.push('/physicalmachine')
    },
    async handleAdd () {
      this.adding = true
      try {
        await this.form.fc.validateFields()
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
          await this.doPxeSingleAdd()
        }
        if (this.isPxeFileAdd) {
          await this.doPxeFileAdd()
        }
        this.$router.push('/physicalmachine')
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
            return callback(new Error('输入的IP没有创建'))
          }
        })
      }
      return callback()
    },
    validateNet (rule, value, callback) {
      if (value && value.access_ip) {
        if (!isWithinRange(value.access_ip, value.access_net.guest_ip_start, value.access_net.guest_ip_end)) {
          return callback(new Error('输入的IP不在选择子网网段中'))
        }
      }
      return callback()
    },
    validateFile (rule, value, callback) {
      if (value) {
        if (value.file && !value.file.name.endsWith('.xlsx')) {
          return callback(new Error('上传模板文件只能是 xlsx 格式'))
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
          },
        })
    },
  },
}
</script>
