<template>
  <a-form-item :label="$t('cloudenv.text_14')" v-if="isPermission">
    <a-switch
      :checkedChildren="$t('cloudenv.text_84')"
      :unCheckedChildren="$t('cloudenv.text_85')"
      v-model="isOpenProxy" />
    <div v-if="isOpenProxy" class="d-flex align-items-center w-50">
      <a-select class="base-select" :loading="loading" showSearch :filterOption="filterOption" v-decorator="decorator">
        <a-select-option v-for="item of proxyOpts" :key="item.id" :value="item.id">
          {{item.name}} {{item.id === 'DIRECT' ? $t('cloudenv.text_110') :  null}}
        </a-select-option>
      </a-select>
      <a @click="fetchQueryProxy"><a-icon :spin="loading" type="sync" class="ml-2" /></a>
    </div>
    <div slot="extra">
      <div v-if="!isOpenProxy">{{$t('cloudenv.text_111')}}</div>
      <div v-else>{{$t('cloudenv.text_112')}}<span class="link-color oc-pointer" @click="createProxySetting">{{$t('cloudenv.text_104')}}</span></div>
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
    cloneData: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    const { proxy_setting_id } = this.cloneData
    return {
      proxyOpts: [],
      loading: false,
      isOpenProxy: proxy_setting_id && proxy_setting_id !== 'DIRECT',
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo', 'l3PermissionEnable']),
    decorator () {
      const { proxy_setting_id } = this.cloneData
      return [
        'proxy_setting',
        {
          initialValue: (!proxy_setting_id || proxy_setting_id === 'DIRECT') ? '' : proxy_setting_id,
          rules: [{ required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_14')]) }],
        },
      ]
    },
    isPermission () {
      return hasPermission({ key: 'proxysettings_list' })
    },
  },
  created () {
    if (this.isPermission) {
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
      if (this.loading) {
        return false
      }
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
        domain: this.account ? this.account.domain_id : this.fd.domain || {},
        success: async () => {
          await this.fetchQueryProxy()
          if (this.proxyOpts && this.proxyOpts.length > 0) {
            this.fc.setFieldsValue({ proxy_setting: this.proxyOpts[0].id })
          }
        },
      })
    },
  },
}
</script>
