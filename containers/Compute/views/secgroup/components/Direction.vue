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
import i18n from '@/locales'
import regexp from '@/utils/regexp'

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
  mixins: [WindowsMixin, ListMixin],
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
  },
  data () {
    const title = this.type === 'out' ? this.$t('compute.text_978') : this.$t('compute.text_979')
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        resource: 'secgrouprules',
        getParams: {
          direction: this.type,
          order: 'desc',
          order_by: 'priority',
          secgroup: this.id,
        },
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
        {
          field: 'cidr',
          title: title,
          minWidth: 70,
          showOverflow: 'ellipsis',
          formatter: ({ cellValue, row }) => {
            if (row.cidr) {
              return `${row.cidr} (IP)`
            }
            if (row.peer_secgroup) {
              return `${row.peer_secgroup} (${this.$t('dictionary.secgroup')})`
            }
            return '-'
          },
        },
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
      singleActions: [
        {
          label: this.$t('compute.text_982'),
          permission: 'secgrouprules_update',
          action: obj => {
            this.createDialog('EditRulesDialog', {
              data: [obj],
              title: 'edit',
              columns: this.columns,
              onManager: this.onManager,
              refresh: this.refresh,
              type: this.type,
            })
          },
          meta: () => {
            return {
              validate: !this.isRead,
              tooltip: this.isRead ? i18n.t('compute.secgroup.shared') : '',
            }
          },
        },
        {
          label: this.$t('compute.text_983'),
          permission: 'secgrouprules_create',
          action: obj => {
            this.createDialog('EditRulesDialog', {
              data: [obj],
              title: 'clone',
              columns: this.columns,
              onManager: this.onManager,
              refresh: this.refresh,
              type: this.type,
              secgroup: this.id,
            })
          },
          meta: () => {
            return {
              validate: !this.isRead,
              tooltip: this.isRead ? i18n.t('compute.secgroup.shared') : '',
            }
          },
        },
        {
          label: this.$t('compute.perform_delete'),
          permission: 'secgrouprules_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
              name: this.$t('compute.text_984'),
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              validate: !this.isRead,
              tooltip: this.isRead ? i18n.t('compute.secgroup.shared') : '',
            }
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
  },
}
</script>
