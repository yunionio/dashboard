<template>
  <div class="wrap">
    <a-popover v-model="visible" trigger="click" @visibleChange="handlePopoverVisibleChange">
      <template v-slot:content>
        <a-icon type="sync" spin v-if="loading" />
        <template v-else>
          <template v-if="error">
            <template v-if="error.response && error.response.status === 404">
              <a-icon type="exclamation-circle" theme="twoTone" twoToneColor="#faad14" />
              <span class="ml-2" style="color: #faad14;">无密钥信息</span>
            </template>
            <template v-else>
              <a-icon type="close-circle" theme="twoTone" twoToneColor="#f5222d" />
              <span class="ml-2" style="color: #f5222d;">获取失败</span>
            </template>
          </template>
          <template v-else>
            <div class="mv-2">
              <div class="d-flex" v-if="loginInfos.ip.value">
                <div><span v-html="loginInfos.ip.label" /></div>
                <div><span>{{ loginInfos.ip.value }}</span><copy class="ml-1" :message="loginInfos.ip.value" /></div>
              </div>
            </div>
            <div class="mv-2">
              <div class="d-flex">
                <div><span v-html="loginInfos.username.label" /></div>
                <div><span>{{ loginInfos.username.value }}</span><copy class="ml-1" :message="loginInfos.username.value" /></div>
              </div>
            </div>
            <div class="mv-2">
              <div class="d-flex">
                <div><span v-html="loginInfos.password.label" /></div>
                <template v-if="loginInfos.password.value">
                  <div><span>{{ loginInfos.password.value }}</span><copy class="ml-1" :message="loginInfos.password.value" /></div>
                </template>
                <template v-if="!loginInfos.password.value && loginInfos.password.keypair && loginInfos.password.loginKey">
                  <div><a @click="handleDecryptSecret">输入私钥获取密码</a></div>
                </template>
              </div>
            </div>
          </template>
        </template>
      </template>
      <span @click.stop="fetchLoginInfo" v-if="!disabled">
        <icon class="keypair-icon" type="keypairs" fill="#555" />
      </span>
    </a-popover>
    <a-tooltip placement="top" v-if="promptText && disabled">
      <template slot="title">
        <span>{{promptText}}</span>
      </template>
      <span>
        <icon class="keypair-icon-disabled" type="keypairs" />
      </span>
    </a-tooltip>
    <span v-if="!promptText && disabled">
      <icon class="keypair-icon-disabled" type="keypairs" />
    </span>
    <a-modal
      :visible="dialog.visible"
      :closable="false"
      title="获取密码"
      @cancel="handleDialogCacel">
      <div>
        <div class="mb-2">
          <a-alert type="warning" message="仅支持 OpenSSL's PEM 格式" />
        </div>
        <a-row :gutter="20" class="mb-2">
          <a-col :span="5" class="text-right">密钥名称：</a-col>
          <a-col :span="19">{{ loginInfos.password.keypair }}</a-col>
        </a-row>
        <a-row :gutter="20" class="mb-2">
          <a-col :span="5" class="text-right">密钥：</a-col>
          <a-col :span="19">
            <a-textarea v-model="dialog.value" :rows="7" />
          </a-col>
        </a-row>
        <template v-if="dialog.password">
          <a-row :gutter="20">
            <a-col :span="5" class="text-right">密码：</a-col>
            <a-col :span="19">
              <span>{{ dialog.password }}</span><copy class="ml-1" :message="dialog.password" />
            </a-col>
          </a-row>
        </template>
      </div>
      <template #footer>
        <a-button type="primary" @click="handleDialogConfirm">确定</a-button>
        <a-button @click="handleDialogCacel">取消</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import * as R from 'ramda'
import { Manager } from '@/utils/manager'
import { passwordDecrypt } from '@/utils/common/secret'

export default {
  name: 'PasswordFetcher',
  props: {
    serverId: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
      validator: val => ['servers', 'baremetals', 'baremetal_ssh', 'elasticcaches', 'dbinstanceaccounts', 'elasticcacheaccounts', 'cloudusers'].includes(val),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    promptText: {
      type: String,
    },
  },
  data () {
    return {
      loading: false,
      error: null,
      visible: false,
      requestConfigs: {
        servers: {
          resource: 'servers',
          methodname: 'GetLoginInfo',
        },
        baremetals: {
          resource: 'hosts',
          methodname: 'GetIpmiInfo',
        },
        baremetal_ssh: {
          resource: 'hosts',
          methodname: 'GetLoginInfo',
        },
        elasticcaches: {
          resource: 'elasticcaches',
          methodname: 'GetLoginInfo',
        },
        dbinstanceaccounts: {
          resource: 'dbinstanceaccounts',
          methodname: 'GetLoginInfo',
        },
        elasticcacheaccounts: {
          resource: 'elasticcacheaccounts',
          methodname: 'GetLoginInfo',
        },
        cloudusers: {
          resource: 'cloudusers',
          methodname: 'GetLoginInfo',
          apiVersion: 'v1',
        },
      },
      loginInfos: {
        ip: {
          label: 'IP：',
          value: '',
        },
        username: {
          label: '用户名：',
          value: '',
        },
        password: {
          label: '密&emsp;码：',
          value: '',
          keypair: '',
          loginKey: '',
        },
      },
      dialog: {
        visible: false,
        value: '',
        password: '',
      },
    }
  },
  methods: {
    fetchLoginInfo () {
      this.$nextTick(async () => {
        if (this.visible === false) return
        const config = this.requestConfigs[this.resourceType]
        const manager = new Manager(config.resource, config.apiVersion || 'v2')
        this.loading = true
        try {
          const { data: { password, username, account, keypair, login_key: loginKey, ip } } = await manager.objectRpc({
            methodname: config.methodname,
            objId: this.serverId,
          })
          this.loginInfos.username.value = username || account
          if (this.resourceType === 'baremetals') {
            this.loginInfos.ip.value = ip
          }
          if (keypair) {
            this.loginInfos.password.keypair = keypair
            this.loginInfos.password.loginKey = loginKey
          } else {
            this.loginInfos.password.value = password
          }
          this.error = null
        } catch (error) {
          this.error = error
        } finally {
          this.loading = false
        }
      })
    },
    handleDecryptSecret () {
      this.visible = false
      this.dialog.visible = true
      this.login_key = this.loginInfos.password.loginKey
    },
    handleDialogConfirm () {
      if (R.isNil(this.dialog.value) || R.isEmpty(this.dialog.value)) return
      try {
        this.dialog.password = passwordDecrypt(this.login_key, this.dialog.value) || '暂无'
      } catch (error) {
        this.$message.error('获取密码失败')
        throw error
      }
    },
    handleDialogCacel () {
      this.dialog.visible = false
      this.dialog.value = ''
      this.dialog.password = ''
    },
    handlePopoverVisibleChange (val) {
      if (!val) {
        // 清空信息
        this.error = null
        this.loginInfos.ip.value = ''
        this.loginInfos.username.value = ''
        this.loginInfos.password.value = ''
        this.loginInfos.password.keypair = ''
        this.loginInfos.password.loginKey = ''
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import "../../../../src/styles/less/theme";

.wrap {
  .keypair-icon {
    cursor: pointer;
    font-size: 18px;
    svg {
      &:hover {
        fill: @primary-color;
      }
    }
  }
  .keypair-icon-disabled {
    font-size: 18px;
    svg {
      fill: @disabled-color;
    }
  }
}
</style>
