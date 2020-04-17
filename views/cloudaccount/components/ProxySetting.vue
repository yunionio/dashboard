<template>
  <a-form-item label="代理">
    <a-select showSearch :loading="loading" :filterOption="filterOption" v-decorator="decorator">
      <a-select-option v-for="item of proxyOpts" :key="item.id" :value="item.id">
        {{item.name}} {{item.id === 'DIRECT' ? '（直连）' :  null}}
      </a-select-option>
    </a-select>
    <div slot="extra">
      某些云厂商需要设置代理才可以正常访问，例如谷歌云
    </div>
  </a-form-item>
</template>

<script>
export default {
  name: 'ProxySetting',
  props: {
    initialValue: {
      type: String,
      default: () => 'DIRECT',
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
        {
          initialValue: this.initialValue,
        },
      ]
    },
  },
  created () {
    this.fetchQueryProxy()
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
        scope: this.$store.getters.scope,
      }
      this.loading = true
      try {
        const { data } = await manager.list({ params })
        this.proxyOpts = data.data
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
