<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import ListMixin from '@/mixins/list'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { checkReadOnly } from '../utils'

export default {
  name: 'SNatList',
  mixins: [DialogMixin, WindowsMixin, ListMixin],
  props: {
    resId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    const validate = (this.data.status === 'available')
    return {
      list: this.$list.createList(this, {
        id: 'SNatListForNatSidePage',
        resource: 'natsentries',
        getParams: {
          natgateway: this.resId,
        },
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
        steadyStatus: Object.values(expectStatus.nat).flat(),
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'name',
          title: this.$t('network.text_564'),
        }),
        {
          field: 'ip',
          title: this.$t('network.text_539'),
        },
        {
          field: 'network',
          title: this.$t('network.snat.cidr'),
          formatter: ({ row }) => {
            if (row.network) {
              return this.$t('network.text_566', [row.network.name, row.network.guest_ip_start, row.network.guest_ip_end])
            }
            if (row.source_cidr) {
              return row.source_cidr
            }
            return '-'
          },
        },
        getStatusTableColumn({ statusModule: 'nat' }),
      ],
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'natsentry_create',
          action: () => {
            this.createDialog('SNatCreateDialog', {
              title: this.$t('network.text_567'),
              data: this.data,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = checkReadOnly(this.data, this.$t('network.text_26'))
            if (!ret.validate) return ret
            return {
              buttonType: 'primary',
              validate,
              tooltip: validate ? '' : this.$t('network.nat.status.unavailable.tooltip'),
            }
          },
        },
        {
          label: this.$t('network.text_131'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('network.text_568'),
              onManager: this.onManager,
              name: this.$t('network.text_569'),
              alert: this.$t('network.text_563'),
            })
          },
          meta: () => {
            const ret = checkReadOnly(this.data, this.$t('network.text_131'))
            if (!ret.validate) return ret
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('network.text_131'),
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              title: this.$t('network.text_568'),
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
              name: this.$t('network.text_569'),
              alert: this.$t('network.text_563'),
            })
          },
          meta: (obj) => {
            return checkReadOnly(this.data, this.$t('network.text_131'))
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
