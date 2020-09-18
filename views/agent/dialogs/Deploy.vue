<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.loadbalanceragent')" :count="params.data.length" :action="$t('network.text_41')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 2)" />
      <a-divider orientation="left">{{$t('network.text_42')}}</a-divider>
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('network.text_43')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.proj" disabled :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <template slot="label">
            <span>{{$t('network.text_45')}}<a-tooltip placement="topLeft">
                <template slot="title">
                  <div>{{$t('network.text_46')}}<br />climc user-create lbagent --password XXX --system-account
                  <br />climc project-add-user system lbagent admin</div>
                </template>
                <a-icon type="info-circle" />
              </a-tooltip>
            </span>
          </template>
          <base-select
            v-decorator="decorators.user"
            resource="users"
            version="v1"
            :params="userParams"
            :mapper="userMapper"
            :label-format="labelFormat"
            idKey="name"
            :select-props="{ placeholder: $t('network.text_47') }"
            style="width: 320px" />
        </a-form-item>
        <a-form-item :label="$t('network.text_48')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.pass" type="password" :placeholder="$t('network.text_49')" />
        </a-form-item>
        <a-divider orientation="left">{{$t('network.text_50')}}</a-divider>
        <a-form-item v-bind="formItemLayout">
          <template slot="label">
            <span>{{$t('network.text_51')}}<a-tooltip placement="topLeft" :overlayStyle="{'max-width': '400px'}">
                 <div slot="title" style="width: 400px">{{$t('network.text_52')}}<br />{{$t('network.text_53')}}<br />{{$t('network.text_54')}}<br />{{$t('network.text_55')}}<div class="pl-2">{{$t('network.text_56')}}</div>
                    <div class="pl-2">{{$t('network.text_57')}}</div>
                    <div class="pl-2">{{$t('network.text_58')}}</div>
                  </div>
                <a-icon type="info-circle" />
              </a-tooltip>
            </span>
          </template>
          <a-radio-group v-decorator="decorators.hostName" @change="hostChange">
            <a-radio-button v-for="(item, index) in nameServers" :value="item.value" :key="index">{{item.label}}</a-radio-button>
          </a-radio-group>
          <a-form-item v-if="this.hostName === ''">
            <a-input v-decorator="decorators.ip" :placeholder="$t('network.text_59')" />
          </a-form-item>
          <a-form-item class="mb-0" v-if="this.hostName === 'server'">
            <base-select
              filterable
              v-decorator="decorators.server"
              resource="servers"
              style="width: 320px"
              :mapper="serverMapper"
              :params="serversParams"
              :label-format="labelFormat"
              :select-props="{ placeholder: $t('network.text_60') }"
              @change="handleServerChange"
              @update:resList="serversSuccess" />
              <a-alert v-if="isOut" :message="$t('network.text_61')" banner />
          </a-form-item>
          <a-form-item v-if="this.hostName === 'host'">
            <base-select
              filterable
              v-decorator="decorators.host"
              resource="hosts"
              :params="hostsParams"
              :label-format="labelFormat"
              :select-props="{ placeholder: $t('network.text_62') }"
              style="width: 320px" />
          </a-form-item>
        </a-form-item>
        <a-form-item :label="$t('network.text_63')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.repo_base_url" :placeholder="$t('network.text_64')" />
        </a-form-item>
        <a-form-item v-bind="tailFormItemLayout">
          <a-checkbox v-decorator="decorators.repo_sslverify">{{$t('network.text_65')}}</a-checkbox>
        </a-form-item>
      </a-form>
      <a-alert v-if="isRunning">
        <div slot="message">{{$t('network.text_66')}}<a @click="openAsbook(ansiblePlaybookId)">{{$t('network.text_67')}}</a>
        </div>
      </a-alert>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading" :disabled="isRunning">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import Ansible from '../controls/ansible'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'AgentDeployDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      isRunning: false,
      isDeleteServer: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        proj: [
          'proj',
          {
            validateTrigger: ['blur', 'change'],
            initialValue: 'system',
            rules: [
              { required: true, message: this.$t('network.text_68') },
            ],
          },
        ],
        user: [
          'user',
          {
            validateTrigger: ['blur', 'change'],
            rules: [
              { required: true, message: this.$t('network.text_69') },
            ],
          },
        ],
        pass: [
          'pass',
          {
            validateTrigger: ['blur', 'change'],
            rules: [
              { required: true, message: this.$t('network.text_49') },
            ],
          },
        ],
        hostName: [
          'hostName',
          {
            initialValue: 'server',
          },
        ],
        ip: [
          'ip',
          {
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('network.text_59') },
            ],
          },
        ],
        host: [
          'host',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_62') },
            ],
          },
        ],
        server: [
          'server',
          {
            validateFirst: true,
            validateTrigger: ['blur', 'change'],
            rules: [
              { required: true, message: this.$t('network.text_60') },
              { validator: this.serverOldCheck },
            ],
          },
        ],
        deploy_method: [
          'deploy_method',
        ],
        repo_base_url: [
          'repo_base_url',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            // initialValue: `${location.protocol}//${location.host}/yumrepo`,
            rules: [
              { required: true, message: this.$t('network.text_64') },
              { validator: this.$validate('url') },
            ],
          },
        ],
        repo_sslverify: [
          'repo_sslverify',
          {
            valuePropName: 'checked',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
      tailFormItemLayout: {
        wrapperCol: {
          sm: {
            span: 18,
            offset: 6,
          },
        },
      },
      userParams: {
        system: true,
        tenant: 'system',
      },
      nameServers: [
        { label: this.$t('dictionary.server'), value: 'server' },
        { label: this.$t('network.text_70'), value: 'host' },
        { label: this.$t('network.text_71'), value: '' },
      ],
      hostName: 'server',
      deploymentHost: '',
      deployMethod: '',
      ansiblePlaybookId: '',
      userData: [],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    isOut () {
      const item = this.params.data && this.params.data.length && this.params.data[0]
      if (item && item.hb_last_seen) {
        const s = this.$moment().diff(item.hb_last_seen, 'seconds')
        if (s < 60) {
          return true
        }
      }
      return false
    },
    serversParams () {
      return {
        scope: this.$store.getters.scope,
        status: 'running',
        cloud_env: 'private_or_onpremise',
      }
    },
    hostsParams () {
      return {
        scope: this.$store.getters.scope,
        status: 'running',
      }
    },
  },
  created () {
    this.backfill()
    this.form.fc.getFieldDecorator('deploy_method', { preserve: true, initialValue: 'yum' })
  },
  methods: {
    getUpdateInfo () {
      new this.$Manager('updates', 'v1').list({
        params: {
          status: true,
        },
      }).then(res => {
        if (res.data.data && res.data.data.length) {
          const updateInfo = res.data.data[0]
          if (updateInfo && updateInfo.current_version) {
            const v = updateInfo.current_version.slice(1, 4)
            this.form.fc.setFieldsValue({
              repo_base_url: `https://yunioniso.oss-cn-beijing.aliyuncs.com/iso/${v}/rpms`,
            })
          }
        }
      })
    },
    serversSuccess (list = []) {
      const { deployment } = this.params.data[0] || {}
      const { getFieldValue, validateFields } = this.form.fc
      if (getFieldValue('hostName') === 'server' && deployment && deployment.host) {
        const [, id] = deployment.host.split(':')
        this.isDeleteServer = !list.find(item => {
          return item.id === id || item.name === id
        })
        validateFields(['server'])
      }
    },
    handleServerChange () {
      this.isDeleteServer = false
      this.form.fc.validateFields(['server'])
    },
    serverMapper (retList) {
      return retList.filter(item => findPlatform(item.brand) !== 'public')
    },
    userMapper (data) {
      data = data.filter(item => item.is_system_account)
      this.userData = data
      return data
    },
    labelFormat (item) {
      if (item.ips) {
        return `${item.name}(${item.ips})`
      }
      return item.name
    },
    hostChange (e) {
      this.hostName = e.target.value
    },
    deployMethodChange (e) {
      this.deployMethod = e.target.value
    },
    // 更改云主机时与旧的云主机校验
    serverOldCheck (rule, value, callback) {
      if (this.isDeleteServer) {
        return callback(new Error(this.$t('network.text_72')))
      }
      return callback()
    },
    backfill () {
      const { deployment } = this.params.data[0] || {}
      if (deployment && deployment.ansible_playbook) {
        this.ansiblePlaybookId = deployment.ansible_playbook
        new Ansible(deployment.ansible_playbook)
          .get()
          .then(({ data }) => {
            if (data && data.playbook && data.playbook.inventory && data.playbook.inventory.hosts && data.playbook.inventory.hosts.length > 0) {
              const { vars } = data.playbook.inventory.hosts[0] || {}
              if (vars) {
                this.form.fc.setFieldsValue({
                  user: vars.user,
                  pass: vars.pass,
                  deploy_method: vars.repo_base_url ? 'yum' : 'copy',
                })
                this.form.fc.getFieldDecorator('repo_base_url', {
                  preserve: true,
                  initialValue: vars.repo_base_url,
                })
                this.deployMethod = vars.repo_base_url ? 'yum' : 'copy'
                this.$nextTick(() => {
                  this.form.fc.setFieldsValue({ repo_sslverify: !!parseInt(vars.repo_sslverify) })
                })
              }
            }
            // 是否为部署中
            this.isRunning = data.status === 'running'
          })

        /* 处理云主机start */
        const arrHost = deployment.host.split(':') || []
        if (arrHost && arrHost.length === 2) {
          const obj = {
            hostName: arrHost[0],
          }
          obj[arrHost[0]] = arrHost[1]
          this.$nextTick(() => {
            this.form.fc.setFieldsValue(obj)
          })
          this.deploymentHost = {
            hostName: arrHost[0],
          }
          this.deploymentHost[arrHost[0]] = arrHost[1]
          this.hostName = arrHost[0]
        } else {
          // 外部主机
          this.$nextTick(() => {
            this.form.fc.setFieldsValue({
              hostName: '',
              ip: arrHost[0],
            })
          })
          this.deploymentHost = {
            hostName: '',
            ip: arrHost[0],
          }
          this.hostName = ''
        }
        /* 处理云主机end */
      } else {
        this.getUpdateInfo()
      }
    },
    doCreate (data) {
      const { id } = this.params.data[0]
      return new this.$Manager('loadbalanceragents').performAction({
        id,
        action: 'deploy',
        data,
      })
    },
    openAsbook (ansiblePlaybookId) {
      this.createDialog('AnsibleplaybookDialog', {
        title: this.$t('network.text_73'),
        ansiblePlaybookId,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        values.repo_sslverify = values.repo_sslverify ? 1 : 0
        const { hostName, ip, host, proj, pass, server, user } = values
        let name = ''
        if (hostName && hostName === 'host') {
          name = `${hostName}:${host}`
        } else if (hostName && hostName === 'server') {
          name = `${hostName}:${server}`
        } else {
          name = ip
        }
        const params = {
          host: {
            name,
            vars: {
              host: host,
              pass,
              proj,
              repo_base_url: values.repo_base_url,
              repo_sslverify: values.repo_sslverify,
              server,
              user,
            },
          },
          deploy_method: values.deploy_method,
        }
        const { data } = await this.doCreate(params)
        this.loading = false
        this.cancelDialog()
        if (data) {
          this.openAsbook(data.deployment.ansible_playbook || this.ansiblePlaybookId)
        }
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
