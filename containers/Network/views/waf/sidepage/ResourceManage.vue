<template>
    <div>
      <page-list
      :list="list"
      :columns="columns" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'WafResourcesForWafInstancesSidePage',
  components: {
  },
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    data: Object,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: this.fetchResource,
        getParams: { details: true },
        filterOptions: {
          id: {
            label: this.$t('network.waf.resource_name'),
            filter: true,
            formatter: val => {
              return `id.in(${val})`
            },
          },
          type: {
            label: this.$t('network.waf.type'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'type',
            },
          },
        },
      }),
      columns: [
        {
          field: 'id',
          title: this.$t('network.waf.resource_id'),
        },
        {
          field: 'type',
          title: this.$t('network.waf.type'),
        },
        {
          field: 'port',
          title: this.$t('network.text_165'),
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  },
  created () {
    this.initSidePageTab('waf-resource-list')
    this.list.fetchData()
  },
  methods: {
    async fetchResource (params) {
      try {
        const managerArgs = {
          id: this.data.id,
          spec: 'cloud-resources',
          params: {
            details: true,
            ...params,
          },
        }
        const res = await new this.$Manager('waf_instances', 'v2').getSpecific(managerArgs)
        return res
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
<style lang="less" scoped>
.tag-list {
  min-height: 65px;
  border: 1px solid #ddd;
  padding: 8px;
}
.tag {
  max-width: 100%;
  line-height: 20px;
  margin-right: 10px;
  padding: 0 6px 0 4px;
  font-size: 12px;
  border-style: solid;
  border-width: 1px;
}
</style>
