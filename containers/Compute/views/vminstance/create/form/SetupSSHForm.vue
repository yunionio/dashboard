<template>
  <a-form :form="form" v-bind="formItemLayout">
    <a-form-item :label="$t('network.ssh-proxy.port')">
      <a-input-number v-decorator="decorators.port" />
    </a-form-item>
    <a-form-item :label="$t('compute.vminstance.setup_ssh_authentication.method')">
      <a-radio-group v-model="method">
        <a-radio-button v-for="m in METHODS" :value="m.value" :key="m.key">{{ m.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="method !== 'scripts'">
     <span slot="label">
        {{ $t('compute.text_163') }}
        <a-tooltip :title="$t('compute.vminstance.setup_ssh_authentication.create.username.tips')">
          <a-icon type="question-circle-o" />
        </a-tooltip>
      </span>
      <a-input v-decorator="decorators.user" />
    </a-form-item>
    <a-form-item :label="$t('compute.text_108')" v-if="method === 'keypair'">
      <a-textarea :placeholder="$t('compute.text_797')" v-decorator="decorators.private_key" />
    </a-form-item>
    <a-form-item :label="$t('compute.text_340')" v-if="method === 'password'">
      <a-input-password :placeholder="$t('compute.text_204')" v-decorator="decorators.password" />
    </a-form-item>
    <a-form-item :label="$t('compute.vminstance.setup_ssh_authentication.method.script')" v-if="method === 'scripts'">
      <a-alert :message="$t('compute.vminstance.setup_ssh_authentication.method.script.tips')" banner />
      <code-mirror :value="scripts" :options="cmOptions" />
      <div class="text-right">
        <a-button
            type="link"
            icon="copy"
            class="pl-0 pr-0"
            @click="handleCopy">{{$t('compute.text_801')}}</a-button>
      </div>
    </a-form-item>
  </a-form>
</template>

<script>
import 'codemirror/mode/shell/shell'

export default {
  name: 'SetupSshForm',
  props: {
    servers: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      method: 'keypair',
      METHODS: [
        { key: 'keypair', value: 'keypair', label: this.$t('compute.text_108') },
        { key: 'password', value: 'password', label: this.$t('compute.text_340') },
        { key: 'scripts', value: 'scripts', label: this.$t('compute.vminstance.setup_ssh_authentication.method.script') },
      ],
      scripts: '',
      cmOptions: {
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        line: true,
        readOnly: true,
        theme: 'material',
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      form: this.$form.createForm(this),
      decorators: {
        port: [
          'port',
          {
            initialValue: 22,
            rules: [
              { required: true, message: this.$t('network.text_176') },
              { type: 'number', min: 1, max: 65535, message: this.$t('network.text_347') },
            ],
          },
        ],
        method: [
          'method',
          {
            initialValue: 'keypair',
          },
        ],
        user: [
          'user',
          {
            initialValue: '',
            validateTrigger: 'blur',
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_210') },
            ],
          },
        ],
        password: [
          'password',
          {
            rules: [
              { required: true, message: this.$t('compute.text_204') },
            ],
          },
        ],
        private_key: [
          'private_key',
          {
            rules: [
              { required: true, message: this.$t('compute.vminstance.setup_ssh_authentication.keypair.tips') },
            ],
          },
        ],
      },
    }
  },
  watch: {
    method (val) {
      if (val === 'scripts') {
        this.fetchScripts()
      }
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    handleSubmitResult (ret) {
      const tasks = {}
      for (const item of ret) {
        if (item.data && item.data.ansible_playbook_id) {
          tasks[item.id] = item.data.ansible_playbook_id
        } else {
          console.log('make-sshable', item)
        }
      }
      this.$emit('tasks', tasks)
    },
    async submit () {
      try {
        if (!this.servers) {
          console.log('no servers to submit make-sshable')
          return
        }
        const values = await this.validateForm()
        if (this.method === 'scripts') {
          await new this.$Manager('servers').batchUpdate({ ids: this.servers, data: { ssh_port: values.port } })
          this.$emit('tasks', {})
          return
        }
        const ret = await new this.$Manager('servers').batchPerformAction({
          action: 'make-sshable',
          ids: this.servers,
          data: values,
        })
        if (!ret.data || !ret.data.data) {
          console.log('make-sshable empty result', ret)
          return
        }
        this.handleSubmitResult(ret.data.data)
      } catch (error) {
        throw error
      }
    },
    async fetchScripts () {
      if (!this.servers) {
        console.log('no servers to fetch make-sshable-cmd')
        return
      }
      try {
        this.scripts = this.$t('scope.text_184')
        const ret = await new this.$Manager('servers').getSpecific({ id: this.servers[0], spec: 'make-sshable-cmd' })
        this.scripts = ret.data.shell_cmd
      } catch (error) {
        if (error.response.status === 404) {
          this.scripts = error.response.data.class
        } else {
          this.scripts = this.$t('common_340')
        }
        throw error
      }
    },
    handleCopy () {
      this.$copyText(this.scripts).then(() => {
        this.$message.success(this.$t('compute.text_802'))
      }).catch(() => {
        this.$message.error(this.$t('compute.text_803'))
      })
    },
  },
}
</script>

<style scoped>
</style>
