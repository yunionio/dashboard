<template>
  <a-form-item label="代理" v-if="isPermission">
    <a-select showSearch :loading="loading" :filterOption="filterOption" v-decorator="decorator">
      <a-select-option v-for="item of proxyOpts" :key="item.id" :value="item.id">
        {{item.name}} {{item.id === 'DIRECT' ? '（直连）' :  null}}
      </a-select-option>
    </a-select>
    <div slot="extra">
      某些云厂商需要设置代理才可以正常访问，例如谷歌云”改为“某些云厂商需要设置代理才可以正常访问，例如谷歌云。为空则表示直连。
    </div>
  </a-form-item>
</template>

<script>
import { hasPermission } from '@/utils/auth'

export default {
  name: 'ProxySetting',
  props: {
    account: {
      type: Object,
    },
    fc: {
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
    decorator () {
      return [
        'proxy_setting',
      ]
    },
    isPermission () {
      return hasPermission({ key: 'proxysettings_list' })
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
        project_domain: this.account ? this.account.domain_id : this.fc.getFieldValue('domain').key,
      }
      this.loading = true
      try {
        const { data } = await manager.list({ params })
        this.proxyOpts = data.data
        if (this.proxyOpts && this.proxyOpts.length > 0) {
          this.fc.setFieldsValue({
            proxy_setting: this.account ? this.account.proxy_setting_id : this.proxyOpts[0].id,
          })
        } else {
          this.fc.setFieldsValue({
            proxy_setting: undefined,
          })
        }
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
