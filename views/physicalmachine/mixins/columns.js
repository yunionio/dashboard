import { getMaintenanceTableColumn } from '../utils/columns'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { getRegionTableColumn, getStatusTableColumn, getEnabledTableColumn, getNameDescriptionTableColumn, getCopyWithContentTableColumn, getTagTableColumn, getPublicScopeTableColumn, getProjectDomainTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: i18n.t('compute.text_210') },
          { validator: this.$validate('serverCreateName') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger name='PhysicalmachineSidePage' id={row.id} list={this.list} vm={this}>{ row.name }</side-page-trigger>
          )
        },
        cellWrapSlots: row => {
          return {
            append: () => row.is_import ? (<a-tooltip title={i18n.t('compute.text_846')}><icon class='ml-2' type='res-physicalmachine' style={{ color: '#1890ff' }} /></a-tooltip>) : null,
          }
        },
      }),
      getStatusTableColumn({ statusModule: 'host' }),
      getEnabledTableColumn(),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'host', columns: () => this.columns }),
      {
        field: 'custom_ip',
        title: 'IP',
        width: 200,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }) => {
            const cellWrap = []
            if (row.access_ip) {
              cellWrap.push(
                <div class="d-flex">
                  <list-body-cell-wrap row={row} field="access_ip" copy><span class="text-color-help">{ this.$t('compute.text_1319') }</span></list-body-cell-wrap>
                </div>,
              )
            }
            if (row.ipmi_ip) {
              cellWrap.push(
                <div class="d-flex">
                  <list-body-cell-wrap row={row} field="ipmi_ip" copy><span class="text-color-help">{ this.$t('compute.text_1320') }</span></list-body-cell-wrap>
                </div>,
              )
            }
            return cellWrap
          },
        },
      },
      {
        field: 'ipmi',
        title: 'IPMI',
        width: 70,
        slots: {
          default: ({ row }) => {
            return [<PasswordFetcher serverId={ row.id } resourceType='baremetals' />]
          },
        },
      },
      {
        field: 'login_ssh',
        title: i18n.t('compute.text_566'),
        width: 70,
        slots: {
          default: ({ row }) => {
            return [<PasswordFetcher serverId={ row.server_id ? row.server_id : row.id } resourceType={row.server_id ? 'servers' : 'baremetal_ssh' } disabled={ row.is_import } promptText={row.is_import ? i18n.t('compute.text_848') : '' } />]
          },
        },
      },
      {
        field: 'spec',
        title: i18n.t('compute.text_178'),
        width: 120,
        showOverflow: 'ellipsis',
        formatter: ({ row }) => {
          if (!row.spec) return '-'
          const g = function (sz, prefix) {
            if (!prefix || prefix.length === 0) {
              prefix = ''
            }
            if (sz && sz > 0) {
              return `${prefix}${sizestr(sz, 'M', 1024)}`
            } else {
              return ''
            }
          }
          const spec = row.spec
          let cpu = ''
          if (spec.cpu && spec.cpu > 0) {
            cpu = `${spec.cpu}C`
          }
          const mem = g(spec.mem)
          let ssd = ''
          let hdd = ''
          if (spec.disk) {
            if (spec.disk.SSD) {
              ssd = 'SSD'
              for (const key in spec.disk.SSD) {
                ssd += `${g(spec.disk.SSD[key])}x${spec.disk.SSD[key]}`
              }
            }
            if (spec.disk.HDD) {
              hdd = 'HDD'
              for (const key in spec.disk.HDD) {
                hdd += `${g(key)}x${spec.disk.HDD[key]}`
              }
            }
          }
          let driver = ''
          if (spec && spec.driver && spec.driver !== 'Linux') {
            driver = 'RAID'
          }
          return `${cpu}${mem}${hdd}${ssd}${driver}`
        },
      },
      getMaintenanceTableColumn(),
      {
        field: 'manufacture',
        title: i18n.t('compute.text_847'),
        width: 70,
        slots: {
          default: ({ row }) => {
            if (row.sys_info && row.sys_info.oem_name) {
              const icons = {
                dell: { height: '25px' },
                hp: { height: '25px' },
                hpe: { height: '30px' },
                inspur: { height: '50px' },
                lenovo: { height: '10px' },
                supermicro: { height: '30px' },
                huawei: { height: '30px' },
              }
              const arr = Object.keys(icons)
              if (!arr.includes(row.sys_info.oem_name)) {
                return row.sys_info.oem_name
              }
              const imgSrc = require(`../assets/${row.sys_info.oem_name}.svg`)
              return [
                <img src={ imgSrc } style={ icons[row.sys_info.oem_name] } />,
              ]
            }
          },
        },
      },
      getCopyWithContentTableColumn({
        field: 'server',
        title: i18n.t('compute.text_602'),
        hideField: true,
        slotCallback: row => {
          if (!row.server) return '-'
          return [
            <span>{ row.server }</span>,
          ]
        },
      }),
      {
        field: 'access_mac',
        title: 'MAC',
        width: 130,
      },
      getCopyWithContentTableColumn({ field: 'sn', title: 'SN' }),
      getPublicScopeTableColumn({ vm: this, resource: 'hosts' }),
      getProjectDomainTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
