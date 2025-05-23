<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'CloudproviderregionList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
    cloudproviderId: {
      type: String,
      required: true,
    },
  },
  data () {
    // const ownerDomain = list => this.$store.getters.isAdminMode || this.list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
    return {
      list: this.$list.createList(this, {
        resource: 'cloudproviderregions',
        getParams: this.getParams,
        steadyStatus: {
          sync_status: Object.values(expectStatus.cloudaccountSyncStatus).flat(),
        },
        idKey: 'cloudregion_id',
        filterOptions: {
          cloudregion: {
            label: this.$t('cloudenv.text_10'),
            dropdown: true,
            multiple: true,
            items: [],
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `cloudregions.id(cloudregion_id).id.in(${val.join(',')})`
            },
          },
        },
        params: { scope: this.$store.getters.scope },
        batchItemGetParamsFormatter: (params) => {
          if (params.id) {
            const p = { ...params, joint_filter: `cloudregions.id(cloudregion_id).id.in(${params.id.join(',')})` }
            delete p.id
            return p
          }
          return params
        },
      }),
      groupActions: [
        {
          label: this.$t('cloudenv.text_363'),
          action: () => {
            this.createDialog('cloudproviderregionsSetAutoSyncDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              refresh: this.refresh,
              cloudproviderId: this.cloudproviderId,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        },
      ],
    }
  },
  watch: {
    cloudproviderId (Val, oldVal) {
      if (oldVal !== Val && Val) {
        this.fetchRegionList()
      }
    },
  },
  created () {
    this.fetchRegionList()
    this.list.fetchData()
  },
  methods: {
    refresh () {
      this.list.refresh()
    },
    fetchRegionList () {
      const params = {
        manager: this.cloudproviderId,
        scope: this.$store.getters.scope,
      }
      const self = this
      try {
        const m = new this.$Manager('cloudregions')
        m.list({ params }).then((ret) => {
          self.list.filterOptions.cloudregion.items = ret.data.data.map((item) => {
            return {
              label: item._i18n ? item._i18n.name : item.name,
              key: item.id,
            }
          })
        })
      } catch (e) {
        this.regionItems = []
        throw e
      }
    },
  },
}
</script>
