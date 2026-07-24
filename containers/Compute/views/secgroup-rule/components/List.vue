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
// import { getStatusTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'
import regexp from '@/utils/regexp'
import expectStatus from '@/constants/expectStatus'
import SingleActionsMixin from '../mixins/singleActions'

const PROTOCOL = {
  any: i18n.t('compute.any_protocol.text'),
  tcp: 'TCP',
  udp: 'UDP',
  icmp: 'ICMP',
}

const ACTIONS = {
  allow: i18n.t('compute.text_976'),
  deny: i18n.t('compute.text_977'),
}

const TARGET_TYPE = {
  ip_set: i18n.t('compute.title.ipset'),
  ip_set_group: i18n.t('compute.title.ipsetGroup'),
  cidr: 'CIDR',
  security_group: i18n.t('dictionary.secgroup'),
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
        {
          field: 'cidr',
          title: this.type === 'out' ? this.$t('compute.text_978') : this.$t('compute.text_979'),
          formatter: ({ cellValue, row }) => {
            if (row.target_type === 'cidr') {
              if (row.CIDR) {
                return row.CIDIR
              } else {
                return 'ALL'
              }
            } else if (row.target_type === 'ip_set') {
              if (row.target_ip_set) {
                return row.target_ip_set
              } else {
                return '-'
              }
            } else if (row.target_type === 'ip_set_group') {
              if (row.target_ip_set_group) {
                return row.target_ip_set_group
              } else {
                return '-'
              }
            } else if (row.target_type === 'security_group') {
              if (row.target_security_group) {
                return row.target_security_group
              } else {
                return '-'
              }
            } else {
              return '-'
            }
          },
          slots: {
            default: ({ row }, h) => {
              const ret = []
              if (row.target_type === 'cidr') {
                if (!row.cidr) {
                  ret.push(
                    <span>{this.$t('compute.any_cidr.text')}</span>,
                  )
                } else {
                  const cidrList = row.cidr.split(',')
                  cidrList.forEach(item => {
                    ret.push(
                      <list-body-cell-wrap copy hideField={true} field='cidr' row={row} message={item}>
                        {item}
                      </list-body-cell-wrap>,
                    )
                  })
                }
              } else if (row.target_type === 'ip_set') {
                ret.push(
                  <side-page-trigger permission='ipsets_get' name='IpSetSidePage' id={row.cidr} vm={this}>{row.target_ip_set}</side-page-trigger>,
                )
              }
              return ret
            },
          },
          slots: {
            default: ({ row }, h) => {
              const ret = []
              if (row.target_type === 'cidr') {
                if (!row.cidr) {
                  ret.push(
                    <span>{this.$t('compute.any_cidr.text')}</span>,
                  )
                } else {
                  const cidrList = row.cidr.split(',')
                  cidrList.forEach(item => {
                    ret.push(
                      <list-body-cell-wrap copy hideField={true} field='cidr' row={row} message={item}>
                        {item}
                      </list-body-cell-wrap>,
                    )
                  })
                }
              } else if (row.target_type === 'ip_set') {
                ret.push(
                  <side-page-trigger permission='ipsets_get' name='IpSetSidePage' id={row.cidr} vm={this}>{row.target_ip_set}</side-page-trigger>,
                )
              }
              return ret
            },
          },
        },
        {
          field: 'target_type',
          title: (this.type === 'out' ? this.$t('compute.text_978') : this.$t('compute.text_979')) + this.$t('compute.text_175'),
          formatter: ({ cellValue, row }) => {
            return TARGET_TYPE[cellValue] || row.target_type
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
            return cellValue === 'any' ? this.$t('compute.any_port.text') : !row.ports ? this.$t('compute.any_port.text') : row.ports
          },
        },
        // getStatusTableColumn({ statusModule: 'common' }),
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
              cloud_env: this.data.cloud_env,
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
