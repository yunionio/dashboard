<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :defaultSearchKey="defaultSearchKey"
    :group-actions="groupActions" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getStatusTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'
import regexp from '@/utils/regexp'
import expectStatus from '@/constants/expectStatus'
import SingleActionsMixin from '../mixins/singleActions'

const PROTOCOL = {
  any: 'ANY',
  tcp: 'TCP',
  udp: 'UDP',
  icmp: 'ICMP',
}

const ACTIONS = {
  allow: i18n.t('compute.text_976'),
  deny: i18n.t('compute.text_977'),
}

export default {
  name: 'DirectionList',
  mixins: [WindowsMixin, ListMixin, SingleActionsMixin],
  props: {
    type: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    listId: {
      type: String,
    },
    data: Object,
  },
  data () {
    const title = this.type === 'out' ? this.$t('compute.text_978') : this.$t('compute.text_979')
    const getParams = {
      direction: this.type,
      order: 'desc',
      order_by: 'priority',
      secgroup: this.id,
    }
    return {
      getParams,
      list: this.$list.createList(this, {
        id: this.listId,
        resource: 'secgrouprules',
        steadyStatus: Object.values(expectStatus.common).flat(),
        getParams,
        filterOptions: {
          cidr: {
            label: title,
            filter: true,
            formatter: val => {
              return `cidr.contains("${val}")`
            },
          },
          ports: {
            label: this.$t('compute.text_349'),
            filter: true,
            formatter: val => {
              // if ((val && val.toLowerCase(val)) === 'all') {
              //   return 'ports.isnullorempty()'
              // }
              return `ports.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          field: 'cidr',
          edit: false,
          showDesc: false,
          hideField: true,
          slotCallback: row => {
            const name = row.cidr ? `${row.cidr} (IP)` : '-'
            return (
              <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'protocol',
          title: this.$t('compute.text_980'),
          formatter: ({ cellValue, row }) => {
            return PROTOCOL[cellValue] || row.protocol
          },
        },
        {
          field: 'ports',
          title: this.$t('compute.text_349'),
          formatter: ({ cellValue, row }) => {
            return cellValue === 'any' ? 'ALL' : !row.ports ? 'ALL' : row.ports
          },
        },
        getStatusTableColumn({ statusModule: 'common' }),
        {
          field: 'action',
          title: this.$t('compute.text_694'),
          formatter: ({ cellValue, row }) => {
            return ACTIONS[cellValue] || row.action
          },
        },
        {
          field: 'priority',
          title: this.$t('compute.text_981'),
          formatter: ({ row }) => {
            if (this.data.brand === 'Aws') {
              return '-'
            }
            return row.priority
          },
        },
        {
          field: 'description',
          title: this.$t('compute.text_312'),
          slots: {
            default: ({ row }, h) => {
              const ret = []
              ret.push(h('list-body-cell-wrap', {
                props: {
                  edit: true,
                  copy: true,
                  field: 'description',
                  row,
                  onManager: this.onManager,
                  formRules: [],
                },
              }))
              return ret
            },
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
          permission: 'secgrouprules_create',
          action: () => {
            this.createDialog('EditRulesDialog', {
              title: 'create',
              data: [{}],
              onManager: this.onManager,
              refresh: this.refresh,
              type: this.type,
              secgroup: this.id,
              brand: this.data.brand,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: !this.isRead,
              tooltip: this.isRead ? i18n.t('compute.secgroup.shared') : '',
            }
          },
        },
        {
          label: this.$t('compute.perform_delete'),
          permission: 'secgrouprules_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
              name: this.$t('compute.text_984'),
              onManager: this.onManager,
            })
          },
          meta: (obj) => {
            if (this.isRead) {
              return {
                validate: !this.isRead,
                tooltip: this.isRead ? i18n.t('compute.secgroup.shared') : '',
              }
            }
            return this.$getDeleteResult(this.list.selectedItems)
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    defaultSearchKey (search) {
      if (regexp.isPrefixStr(search)) {
        return 'cidr'
      }
      if (regexp.isNumber(search)) {
        return 'ports'
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SecgroupRuleSidePage', {
        id: row.id,
        resource: 'secgrouprules',
        getParams: this.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
