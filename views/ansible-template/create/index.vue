<template>
  <div>
    <page-header :title="id ? $t('compute.text_247') : $t('compute.text_248')" />
    <a-form class="mt-3" :form="form" v-bind="formItemLayout">
      <a-form-item :label="$t('compute.text_228')">
        <a-input :disabled="!!id" v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_90')">
        <code-mirror v-decorator="decorators.hosts" @input="(v) => handleCodeInput('hosts', v)" :options="cmOptions" style="line-height: 25px" view-height="120px" :is-scroll="true" />
      </a-form-item>
      <!-- 文件上传 -->
      <upload :defaultFiles="defaultFiles" />
      <a-form-item label="playbook" required>
        <code-mirror v-decorator="decorators.playbook" @input="(v) => handleCodeInput('playbook', v)" :options="cmOptions" style="line-height: 25px"  view-height="300px" :is-scroll="true" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_249')" required>
        <a-switch :defaultChecked="decorators.start[1].initialValue" v-decorator="decorators.start" :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" />
        <span slot="extra">{{$t('compute.text_250')}}</span>
      </a-form-item>
      <a-form-item :label="$t('compute.text_242')" required>
        <a-input-number v-decorator="decorators.hour" :min="1" @blur="handleNumBlur" />
        <span slot="extra">{{$t('compute.text_251')}}</span>
      </a-form-item>
    </a-form>
    <page-footer>
      <a-button type="primary" @click="handleConfirm" :loading="loading" class="ml-3">{{$t('compute.text_162')}}</a-button>
      <a-button type="primary" @click="handleCancel" :loading="loading" class="ml-3">{{$t('compute.text_135')}}</a-button>
    </page-footer>
  </div>
</template>
<script>
// import * as R from 'ramda'
import Upload from './components/Upload'
import { CreateServerForm } from '@Compute/constants'
export default {
  name: 'AnsibleTemplateCreate',
  components: {
    Upload,
  },
  data () {
    return {
      id: undefined,
      loading: false,
      retData: {},
      form: this.$form.createForm(this, { onFieldsChange: this.onFieldsChange }),
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        theme: 'material',
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      modNames: ['yum', 'package', 'group', 'user', 'get_url', 'file', 'unarchive', 'template', 'service'],
    }
  },
  computed: {
    defaultFiles () {
      const { playbook = {} } = this.retData
      return playbook.files || []
    },
    decorators () {
      const { name, playbook = {}, start, hour } = this.retData
      const { inventory, modules } = playbook
      let hostStr = ''
      if (inventory && inventory.hosts && inventory.hosts.length > 0) {
        const _arr = []
        const { name, vars } = playbook.inventory.hosts[0]
        _arr.push(name)
        if (vars) {
          Object.keys(vars).forEach(k => {
            _arr.push(`${k}=${vars[k]}`)
          })
        }
        hostStr = _arr.join(' ')
      }
      let moduleStr = ''
      if (modules && modules.length > 0) {
        playbook.modules.forEach((item, i) => {
          item.args = item.args || []
          const { name, args } = item
          moduleStr += `${i ? '\r' : ''}${name} ${args.join(' ')}`
        })
      }
      return {
        name: [
          'name',
          {
            initialValue: name,
            validateTrigger: 'blur',
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_210') },
              { validator: this.$validate('serverName') },
            ],
          },
        ],
        hosts: [
          'hosts',
          {
            initialValue: hostStr,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_252') },
              {
                validator: (rule, value, _callback) => {
                  const arr = value.split(' ')
                  if (arr && arr.length > 0) {
                    if (arr[0] !== 'HOSTNAME') {
                      return _callback(this.$t('compute.text_253'))
                    }
                    for (let i = 1; i < arr.length; i++) {
                      const _itemArr = arr[i].split('=')
                      if (_itemArr.length !== 2) {
                        return _callback(this.$t('compute.text_253'))
                      }
                    }
                  }
                  return _callback()
                },
              },
            ],
          },
        ],
        playbook: [
          'playbook',
          {
            validateFirst: true,
            initialValue: moduleStr,
            rules: [
              { required: true, message: this.$t('compute.text_254') },
              {
                validator: (rule, value, _callback) => {
                  const modeItems = value.replace(/[\r\n]/g, '<br/>').split('<br/>')
                  if (modeItems && modeItems.length > 0) {
                    for (let i = 0; i < modeItems.length; i++) {
                      const items = modeItems[i].split(' ')
                      const [name, ...values] = items
                      if (this.modNames.indexOf(name) === -1) {
                        return _callback(this.$t('compute.text_255'))
                      }
                      if (!values || values.length === 0) {
                        return _callback(this.$t('compute.text_255'))
                      }
                      for (let j = 0; j < values.length; j++) {
                        const arr = values[j].split('=')
                        if (arr.length !== 2) {
                          return _callback(this.$t('compute.text_255'))
                        }
                      }
                    }
                  }
                  return _callback()
                },
              },
            ],
          },
        ],
        start: [
          'start',
          {
            initialValue: start === undefined ? true : start,
          },
        ],
        hour: [
          'hour',
          {
            initialValue: hour || 24,
          },
        ],
      }
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  created () {
    this.manager = new this.$Manager('devtool_templates')
    const { id } = this.$route.query
    this.id = this.$route.query.id
    if (id) {
      this.queryInfo(id)
    }
  },
  methods: {
    handleCodeInput (key, value) {
      this.form.setFieldsValue({
        [key]: value,
      }, () => {
        this.form.validateFields([key])
      })
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          if (err || document.querySelector('.ant-form .error-color')) {
            reject(err)
            return false
          }
          const { name, hour, start, hosts, files } = values
          const params = { name, hour, start, enabled: true }
          const playbook = {
            files,
            inventory: {
              hosts: [],
            },
            modules: [],
          }
          const hostItem = {
            vars: {},
          }
          hosts.split(' ').forEach(item => {
            item = item.replace("'", '')
            if (!item || item === '--host' || item === '\\') return false
            const arr = item.split('=')
            if (arr.length === 2) {
              const [key, value] = arr
              hostItem.vars[key] = value
            } else {
              hostItem.name = item
            }
          })
          playbook.inventory.hosts.push(hostItem)
          if (values.playbook) {
            const modules = []
            const modeItems = values.playbook.replace(/[\r\n]/g, '<br/>').split('<br/>')
            modeItems.forEach(item => {
              const _arr = []
              const moduleItem = {}
              item.split(' ').forEach(subItem => {
                subItem = subItem.replace("'", '')
                if (subItem && subItem !== '\\') {
                  _arr.push(subItem)
                }
              })
              if (_arr && _arr.length > 0) {
                moduleItem.name = _arr.shift()
                moduleItem.args = _arr
                modules.push(moduleItem)
              }
            })
            playbook.modules = modules
          }
          params.playbook = playbook
          resolve(params)
        })
      })
    },
    handleNumBlur ({ target }) {
      this.form.setFieldsValue({
        hour: target.value || 1,
      })
    },
    handleCancel () {
      this.form.resetFields()
      this.$router.push('/ansibletemplate')
    },
    async handleConfirm () {
      try {
        const values = await this.validateForm()
        this.loading = true
        if (this.id) {
          await this.manager.update({
            id: this.id,
            data: values,
          })
        } else {
          await this.manager.create({
            data: values,
          })
        }
        this.$router.push('/ansibletemplate')
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    async queryInfo (id) {
      try {
        const { data } = await this.manager.get({ id })
        this.retData = data
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
