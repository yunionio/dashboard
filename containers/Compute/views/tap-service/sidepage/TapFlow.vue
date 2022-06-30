<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :placeholder="$t('common.default_search_key', [$t('compute.text_228')])" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import {
  getNameDescriptionTableColumn,
  getTimeTableColumn,
  getEnabledTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getDescriptionFilter, getEnabledFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import validateForm from '@/utils/validate'

export default {
  name: 'TapFlowList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
      default: () => ({
        details: true,
      }),
    },
    data: Object,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'tap_flows',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          description: getDescriptionFilter(),
          enabled: getEnabledFilter(),
          // type: {
          //   label: this.$t('compute.text_175'),
          //   dropdown: true,
          //   items: [
          //     { label: this.$t('compute.vswitch'), key: 'vswitch' },
          //     { label: this.$t('compute.vswitch'), key: 'vnic' },
          //   ],
          // },
          // source: getNameFilter({ field: 'source', label: this.$t('compute.source') }),
          // mac_addr: getNameFilter({ field: 'mac_addr', label: this.$t('compute.source_mac') }),
          // direction: {
          //   label: this.$t('compute.tap_direction'),
          //   dropdown: true,
          //   items: [
          //     { label: this.$t('compute.direction_in'), key: 'IN' },
          //     { label: this.$t('compute.direction_out'), key: 'OUT' },
          //     { label: this.$t('compute.direction_both'), key: 'BOTH' },
          //   ],
          // },
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('table.title.enable_status'), key: 'enabled' },
          { label: this.$t('compute.text_175'), key: 'type' },
          { label: this.$t('compute.source'), key: 'source' },
          { label: this.$t('compute.source_ip'), key: 'source_ips' },
          { label: this.$t('compute.source_mac'), key: 'mac_addr' },
          { label: this.$t('compute.vlan_id'), key: 'vlan_id' },
          { label: this.$t('compute.tap_direction'), key: 'direction' },
          { label: this.$t('common.createdAt'), key: 'created_at' },
        ],
      },
      singleActions: [
        ...getEnabledSwitchActions(this),
        {
          label: this.$t('compute.perform_delete'),
          permission: 'tapflows_delete',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
              name: this.$t('dictionary.tap_flow'),
              onManager: this.onManager,
              success: () => {
                this.$bus.$emit('tap-service-refresh')
              },
            })
          },
          meta: () => {
            const ret = {
              validate: true,
            }
            return ret
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('compute.add_tap_flow'),
          permission: 'tapservices_create',
          action: () => {
            this.createDialog('TapFlowCreateDialog', {
              tapService: this.data,
              onManager: this.onManager,
              success: () => {
                this.list.refresh()
              },
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              ...getEnabledSwitchActions(this, undefined, ['tapflows_perform_enable', 'tapflows_perform_disable'], {
                metas: [
                  () => {
                    const isEnable = !!this.list.selectedItems.find(item => item.enabled)
                    return {
                      validate: this.list.selectedItems.length && !isEnable,
                    }
                  },
                  () => {
                    const isDisable = !!this.list.selectedItems.find(item => !item.enabled)
                    return {
                      validate: this.list.selectedItems.length && !isDisable,
                    }
                  },
                ],
                resourceName: this.$t('dictionary.tap_flow'),
              }),
              {
                label: this.$t('cloudenv.text_108'),
                permission: 'tapflows_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('compute.perform_delete'),
                    name: this.$t('dictionary.tap_flow'),
                    onManager: this.onManager,
                    success: () => {
                      this.$bus.$emit('tap-service-refresh')
                    },
                  })
                },
                meta: () => {
                  return {
                    validate: true,
                  }
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length > 0,
            }
          },
        },
      ],
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          formRules: [
            { required: true, message: this.$t('compute.text_210') },
            { validator: validateForm('serverCreateName') },
          ],
          slotCallback: row => {
            return row.name
          },
        }),
        getEnabledTableColumn(),
        // {
        //   title: this.$t('compute.tap'),
        //   field: 'tap',
        // },
        {
          title: this.$t('compute.text_175'),
          field: 'type',
          formatter: ({ row }) => {
            if (row.type === 'vswitch') {
              return this.$t('compute.vswitch')
            }
            if (row.type === 'vnic') {
              return this.$t('compute.vnic')
            }
            return '-'
          },
        },
        {
          title: this.$t('compute.source'),
          field: 'source',
        },
        {
          title: this.$t('compute.source_ip'),
          field: 'source_ips',
          slots: {
            default: ({ row }) => {
              const { source_ips = '' } = row
              const ips = source_ips.split(',')
              return ips.map(ip => {
                return <list-body-cell-wrap copy field='ip' row={{ ip }} title={ip} />
              })
            },
          },
        },
        getCopyWithContentTableColumn({
          field: 'mac_addr',
          title: this.$t('compute.source_mac'),
          hideField: true,
          message: (row) => {
            return row.mac_addr
          },
          slotCallback: (row) => {
            return row.mac_addr
          },
        }),
        {
          title: this.$t('compute.vlan_id'),
          field: 'vlan_id',
          formatter: ({ row }) => {
            return row.vlan_id || '-'
          },
        },
        {
          title: this.$t('compute.tap_direction'),
          field: 'direction',
          formatter: ({ row }) => {
            return this.$te(`compute.direction_${row.direction.toLowerCase()}`) ? this.$t(`compute.direction_${row.direction.toLowerCase()}`) : row.direction
          },
        },
        getTimeTableColumn(),
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'isProjectMode']),
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
  },
}
</script>
