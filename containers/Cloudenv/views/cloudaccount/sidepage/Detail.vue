<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :nameRules="[{ required: true, message: this.$t('common.text00042') }]"
    :hiddenKeys="['tenant']"
    status-module="cloudaccount" />
</template>

<script>
import XLSX from 'xlsx'
import { getBrandTableColumn, getEnabledTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import { getUserTagColumn, getExtTagColumn } from '@/utils/common/detailColumn'
import { findPlatform } from '@/utils/common/hypervisor'
import WindowsMixin from '@/mixins/windows'
import { hasMeterService } from '@/utils/auth'
import {
  getAccessUrlTableColumn,
  getBalanceTableColumn,
  getGuestCountTableColumn,
  getHostCountTableColumn,
  getPublicScopeTableColumn,
  getResourceMatchProjectTableColumn,
  getBlockResourceTableColumn,
} from '../utils/columns'

export default {
  name: 'CloudaccountDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      discount: 0,
      discountLoaded: false,
      clearPermissionsLoading: false,
      permissionColumns: [
        {
          field: 'name',
          width: '30%',
          title: this.$t('cloudenv.Service'),
          formatter: ({ row }) => {
            return this.$te(`dictionary.res.${row.name}`) ? this.$t(`dictionary.res.${row.name}`) : row.name
          },
        },
        {
          field: 'permissions',
          title: this.$t('cloudenv.lake_of_permissions'),
          slots: {
            default: ({ row }, h) => {
              const { permissions = [] } = row
              const ret = []
              permissions.map(key => {
                ret.push(<a-tag class="mb-1 mt-1">{key}</a-tag>)
              })
              return ret
            },
          },
        },
      ],
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'cloudaccount', columns: () => this.columns, tipName: this.$t('cloudenv.text_12') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'cloudaccount', columns: () => this.columns, tipName: this.$t('cloudenv.text_12') }),
        getResourceMatchProjectTableColumn({ isEdit: true, editCallback: this.editCallback }),
        getBlockResourceTableColumn(),
        getPublicScopeTableColumn({ vm: this, resource: 'cloudaccounts' }),
        getBrandTableColumn(),
        {
          field: 'account',
          title: this.$t('cloudenv.text_94'),
          slots: {
            default: ({ row }) => {
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy row={ row } field='account' title={ row.account } />
                </div>,
              ]
            },
          },
        },
        {
          field: 'account_id',
          title: this.$t('cloudenv.text_94') + 'ID',
          slots: {
            default: ({ row }) => {
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy row={ row } field='account_id' title={ row.account_id } />
                </div>,
              ]
            },
          },
        },
        {
          field: 'proxy_setting.name',
          title: this.$t('cloudenv.text_14'),
          slots: {
            default: ({ row }) => {
              if (row.proxy_setting) {
                const { id, name } = row.proxy_setting
                return [
                  <div class='text-truncate'>
                    <side-page-trigger name="ProxysettingSidePage" id={id} list={this.list} vm={this}>{name}</side-page-trigger>
                  </div>,
                ]
              }
              return '-'
            },
          },
        },
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'enabled', field: 'saml_auth', title: this.$t('cloudenv.ssh_authentication') }),
        {
          field: 'read_only',
          title: this.$t('cloudenv.read_only'),
          formatter: ({ row }) => {
            return row.read_only ? this.$t('scope.text_251') : this.$t('scope.text_252')
          },
        },
        {
          field: 'last_sync',
          title: this.$t('cloudenv.text_103'),
          formatter: ({ row }) => {
            return this.$moment(row.last_sync).format()
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('cloudenv.text_317'),
          items: [
            getAccessUrlTableColumn(),
            getStatusTableColumn({ statusModule: 'cloudaccountHealthStatus', title: this.$t('cloudenv.text_93'), field: 'health_status' }),
            {
              field: 'discount',
              title: this.$t('cloudaccount.table.title.discount'),
              slots: {
                default: () => {
                  if (!hasMeterService()) return '-'
                  if (!this.discountLoaded) {
                    return [<a-icon type='loading' style='font-size: 12px;' class='primary-color' />]
                  }
                  return [<span>{ (this.discount * 100).toFixed(2) }%</span>]
                },
              },
              hidden: () => findPlatform(this.data.brand.toLowerCase()) !== 'public',
            },
            getBalanceTableColumn(),
            getGuestCountTableColumn(),
            getHostCountTableColumn(),
          ],
        },
        {
          title: this.$t('cloudenv.text_329'),
          hidden: () => !this.lakeOfPermissionsData.length,
          items: [
            {
              title: this.$t('common.action'),
              field: 'action',
              slots: {
                default: ({ row }, h) => {
                  return [<a-button type="link" style="height:21px;padding: 0" disabled={!this.lakeOfPermissionsData.length} loading={this.clearPermissionsLoading} onClick={this.clearPermissions.bind(this)}>{this.$t('cloudenv.clear_lake_of_permissions')}</a-button>,
                    <a-button type="link" class="ml-3" style="height:21px;padding: 0" disabled={!this.lakeOfPermissionsData.length} onClick={this.exportPermissions.bind(this)}>{this.$t('table.action.export')}</a-button>]
                },
              },
            },
            {
              title: this.$t('cloudenv.lake_of_permissions'),
              field: 'lake_of_permissions',
              slots: {
                default: ({ row }, h) => {
                  return [
                    <vxe-grid class="mb-2" data={ this.lakeOfPermissionsData } columns={ this.permissionColumns } />,
                  ]
                },
              },
            },
          ],
        },
      ],
    }
  },
  computed: {
    lakeOfPermissionsData () {
      const { lake_of_permissions } = this.data
      if (!lake_of_permissions) return []
      const ret = []
      for (const key in lake_of_permissions) {
        ret.push({ name: key, permissions: lake_of_permissions[key].permissions })
      }
      return ret
    },
  },
  created () {
    this.fetchDiscount()
  },
  methods: {
    editCallback () {
      this.createDialog('CloudaccountSetPojectmappingDialog', {
        data: [this.data],
        columns: this.columns,
        onManager: this.onManager,
      })
    },
    async clearPermissions () {
      try {
        this.clearPermissionsLoading = true
        await this.onManager('update', {
          id: this.data.id,
          managerArgs: {
            data: { clean_lake_of_permissions: true },
          },
        })
      } finally {
        this.clearPermissionsLoading = false
      }
    },
    exportPermissions () {
      const data = [[this.$t('cloudenv.Service'), this.$t('cloudenv.lake_of_permissions')]]
      this.lakeOfPermissionsData.map(item => {
        data.push([item.name, item.permissions.join(',')])
      })
      const filename = `${this.data.name}${this.$t('cloudenv.lake_of_permissions')}.xlsx`
      const ws_name = 'Sheet1'
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, ws_name)
      XLSX.writeFile(wb, filename)
    },
    async fetchDiscount () {
      if (!hasMeterService()) return
      try {
        const response = await this.$http({
          method: 'GET',
          url: `/v1/prices/discount/${this.data.id}`,
        })
        this.discount = response.data.discount
      } finally {
        this.discountLoaded = true
      }
    },
  },
}
</script>
