<template>
  <a-form-item label="代理" v-if="isPermission">
    <a-select showSearch :loading="loading" :filterOption="filterOption" v-decorator="decorator">
      <a-select-option v-for="item of proxyOpts" :key="item.id" :value="item.id">
        {{item.name}} {{item.id === 'DIRECT' ? '（直连）' :  null}}
      </a-select-option>
    </a-select>
    <div slot="extra">
      某些云厂商需要设置代理才可以正常访问，例如谷歌云。
      <div>没有想要的？可以前往 <span class="link-color oc-pointer" @click="createProxySetting">新建</span></div>
    </div>
  </a-form-item>
</template>

<script>
import { mapGetters } from 'vuex'
import { hasPermission } from '@/utils/auth'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ProxySetting',
  mixins: [WindowsMixin],
  props: {
    account: {
      type: Object,
    },
    fc: {
      type: Object,
    },
    fd: {
      type: Object,
    },
  },
  data () {
    return {
      proxyOpts: [],
      loading: false,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo', 'l3PermissionEnable']),
    decorator () {
      return [
        'proxy_setting',
      ]
    },
    isPermission () {
      return hasPermission({ key: 'proxysettings_list' })
    },
  },
  watch: {
    proxyOpts (val) {
      if (val && val.length > 0) {
        this.fc.setFieldsValue({ proxy_setting: val[0].id })
      }
    },
  },
  created () {
    if (this.account && this.isPermission) {
      this.fetchQueryProxy()
    }
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    async fetchQueryProxy () {
      const manager = new this.$Manager('proxysettings')
      const params = {
        limit: 0,
      }
      if (this.account) {
        params.project_domain = this.account.domain_id
      } else if (this.l3PermissionEnable && this.isAdminMode) {
        params.project_domain = this.fc.getFieldValue('domain').key
      } else {
        params.project_domain = this.userInfo.projectDomainId
      }
      this.loading = true
      try {
        const { data } = await manager.list({ params })
        this.proxyOpts = data.data
        if (this.proxyOpts && this.proxyOpts.length > 0 && this.account) {
          this.fc.setFieldsValue({
            proxy_setting: this.account.proxy_setting_id,
          })
        } else {
          this.fc.setFieldsValue({
            proxy_setting: 'DIRECT',
          })
        }
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    createProxySetting () {
      this.createDialog('ProxysettingCreateDialog', {
        domain: this.fd.domain || {},
        success: () => {
          this.fetchQueryProxy()
        },
      })
    },
  },
}
</script>
