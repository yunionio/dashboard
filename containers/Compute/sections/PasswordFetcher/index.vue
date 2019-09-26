<template>
  <div class="wrap">
    <a-popover v-model="visible" trigger="click">
      <template v-slot:content>
        <a-icon type="sync" spin v-if="loading" />
        <template v-else>
          <template v-if="error">
            <a-icon type="close-circle" theme="twoTone" twoToneColor="#f5222d" />
            <span class="ml-2" style="color: #f5222d;">获取失败</span>
          </template>
          <template v-else>
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
      <span @click.stop="fetchLoginInfo">
        <icon name="keypairs" fill="#555" width="18px" height="18px" />
      </span>
    </a-popover>
    <a-modal
      :visible="dialog.visible"
      :closable="false"
      okText="确定"
      cancelText="取消"
      title="获取密码"
      @cancel="handleDialogCacel"
      @ok="handleDialogConfirm">
      <div>
        <a-textarea v-model="dialog.value" :rows="7" />
        <template v-if="dialog.password">
          <div class="mt-2"><span>密码：</span><span>{{ dialog.password }}</span><copy class="ml-1" :message="dialog.password" /></div>
        </template>
      </div>
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
      validator: val => ['servers', 'baremetals'].includes(val),
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
      },
      loginInfos: {
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
        const manager = new Manager(config.resource)
        this.loading = true
        try {
          const { data: { password, username, keypair, login_key: loginKey } } = await manager.objectRpc({
            methodname: config.methodname,
            objId: this.serverId,
          })
          this.loginInfos.username.value = username
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
    },
    handleDialogConfirm () {
      if (R.isNil(this.dialog.value) || R.isEmpty(this.dialog.value)) return
      try {
        this.dialog.password = passwordDecrypt(this.loginInfos.password.loginKey, this.dialog.value)
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
  },
}
</script>

<style lang="scss" scoped>
@import "../../../../src/styles/variables";

.wrap {
  .oc-icon {
    cursor: pointer;
    svg {
      &:hover {
        fill: $primary-color;
      }
    }
  }
}
</style>
