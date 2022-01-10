<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ReservedIPList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    data: Object,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'reservedips',
        getParams: this.getParam,
        filterOptions: {
          ip_addr: {
            label: this.$t('network.text_213'),
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_565'), key: 'network' },
          { label: this.$t('network.text_213'), key: 'ip_addr' },
          { label: this.$t('network.text_668'), key: 'notes' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'reservedips_create',
          action: () => {
            this.createDialog('ReservedIpCreateDialog', {
              title: this.$t('network.text_26'),
              onManager: this.onManager,
              refresh: this.refresh,
              network: this.data,
            })
          },
          meta: () => {
            let validate = true
            if (!R.isNil(this.data) && !R.isEmpty(this.data)) {
              validate = this.isOwner(this.data)
            }
            return {
              validate,
              tooltip: !validate ? this.$t('network.text_627') : null,
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('network.text_666'),
          permission: 'reservedips_delete',
          action: () => {
            this.createDialog('ReservedIPFreedDialog', {
              title: this.$t('network.text_666'),
              onManager: this.onManager,
              refresh: this.refresh,
              columns: this.columns,
              data: this.list.selectedItems,
              name: this.$t('network.text_651'),
              query: this.getParams,
            })
          },
          meta: () => {
            let { validate, tooltip } = this.$getDeleteResult(this.list.selectedItems)
            if (validate) {
              if (!R.isNil(this.data) && !R.isEmpty(this.data)) {
                validate = this.isOwner(this.data)
              }
            }
            return {
              validate,
              tooltip,
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        ...this.getParams,
      }
      return ret
    },
    isOwner (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
</script>
