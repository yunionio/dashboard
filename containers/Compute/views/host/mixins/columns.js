import _ from 'lodash'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { getRegionTableColumn, getStatusTableColumn, getBrandTableColumn, getEnabledTableColumn, getNameDescriptionTableColumn, getPublicScopeTableColumn, getProjectDomainTableColumn, getTagTableColumn, getAccountTableColumn, getOsArch } from '@/utils/common/tableColumn'
import { sizestr, percentstr } from '@/utils/utils'
import i18n from '@/locales'

export default {
  created () {
    const getStatusToolTip = (row) => {
      if (row.metadata) {
        const sysWarn = row.metadata.sys_warn
        const sysError = row.metadata.sys_error
        const titleCon = sysWarn || sysError
        if (titleCon) {
          // const aLink = <side-page-trigger vm={this} name='HostSidePage' id={row.id} list={this.list} tab='event-drawer'>查看日志</side-page-trigger>
          const aIcon = <a-icon type="exclamation-circle" class={ { 'ml-1 oc-pointer': true, 'warning-color': sysWarn, 'error-color': sysError } } />
          return <a-tooltip placement="right">
            <template slot="title">
              { titleCon }
            </template>
            { aIcon }
          </a-tooltip>
        }
      }
      return null
    }
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addBackup: true,
        formRules: [
          { required: true, message: i18n.t('compute.text_210') },
          { validator: this.$validate('serverCreateName') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
        cellWrapSlots: row => {
          return {
            append: () => {
              var ret = []
              if (row.is_baremetal) {
                ret.push(<a-tooltip title={i18n.t('compute.text_562')}><icon class='ml-2' type='res-host' style={{ color: '#1890ff' }} /></a-tooltip>)
              }
              if (row.isolated_device_count) {
                ret.push(<a-tooltip title={i18n.t('compute.text_113')}><icon class='ml-2' type='gpu' /></a-tooltip>)
              }
              return ret
            },
          }
        },
      }),
      getStatusTableColumn({
        statusModule: 'host',
        minWidth: 100,
      }),
      getEnabledTableColumn(),
      getStatusTableColumn({
        field: 'host_status',
        title: i18n.t('compute.text_502'),
        statusModule: 'host_status',
        slotCallback: row => {
          return [
            <div class='d-flex align-items-center text-truncate'>
              <status status={ row.host_status } statusModule='host_status' />
              { getStatusToolTip(row) }
            </div>,
          ]
        },
      }),
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
                  <list-body-cell-wrap row={row} field="access_ip" copy><span class="text-color-help">{this.$t('compute.text_1319')}</span></list-body-cell-wrap>
                </div>,
              )
            }
            if (row.ipmi_ip) {
              cellWrap.push(
                <div class="d-flex">
                  <list-body-cell-wrap row={row} field="ipmi_ip" copy><span class="text-color-help">{this.$t('compute.text_1320')}</span></list-body-cell-wrap>
                </div>,
              )
            }
            return cellWrap
          },
        },
      },
      {
        field: 'id',
        title: 'IPMI',
        width: 60,
        slots: {
          default: ({ cellValue, row }) => {
            if (!row.is_baremetal) {
              return '-'
            } else {
              return [<PasswordFetcher serverId={ row.id } resourceType='baremetals' />]
            }
          },
        },
      },
      {
        field: 'server_id',
        title: i18n.t('compute.text_566'),
        width: 70,
        slots: {
          default: ({ cellValue, row }) => {
            if (!row.is_baremetal) {
              return '-'
            } else {
              return [<PasswordFetcher serverId={ row.server_id } resourceType='servers' />]
            }
          },
        },
      },
      {
        field: 'nonsystem_guests',
        sortBy: 'order_by_server_count',
        title: '#VM',
        width: 60,
        sortable: true,
        slots: {
          default: ({ row }, h) => {
            if (this.isPreLoad && row.nonsystem_guests === undefined) return [<data-loading />]
            return `${row.nonsystem_guests}`
          },
        },
      },
      getOsArch({ field: 'cpu_architecture' }),
      {
        field: 'cpu_count',
        title: i18n.t('compute.text_563'),
        minWidth: 100,
        showOverflow: 'title',
        sortable: true,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.cpu_commit_rate) return [<data-loading />]
            return row.cpu_count ? `${row.cpu_count}/${percentstr(row.cpu_commit_rate)}` : 'N/A'
          },
        },
      },
      {
        field: 'mem_size',
        title: i18n.t('compute.text_564'),
        minWidth: 100,
        sortable: true,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.mem_commit_rate) return [<data-loading />]
            return row.mem_size ? `${sizestr(row.mem_size, 'M', 1024)}/${percentstr(row.mem_commit_rate)}` : 'N/A'
          },
        },
      },
      {
        field: 'storage',
        title: i18n.t('compute.text_565'),
        minWidth: 80,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.storage) return [<data-loading />]
            return row.mem_size ? `${sizestr(row.storage, 'M', 1024)}/${percentstr(row.storage_commit_rate)}` : 'N/A'
          },
        },
      },
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
              const imgSrc = require(`../../physicalmachine/assets/${row.sys_info.oem_name}.svg`)
              return [
                <a-tooltip title={ row.sys_info.oem_name }>
                  <img src={ imgSrc } style={ icons[row.sys_info.oem_name] } />
                </a-tooltip>,
              ]
            }
          },
        },
      },
      {
        field: 'model',
        title: this.$t('compute.text_580'),
        formatter: ({ cellValue, row }) => {
          return ((row.sys_info || {}).model) || '-'
        },
      },
      {
        field: 'sn',
        title: 'SN',
        width: 100,
        showOverflow: 'title',
      },
      {
        field: 'schedtag',
        title: i18n.t('compute.text_541'),
        width: 120,
        type: 'expand',
        slots: {
          content: ({ row }) => {
            const tags = _.sortBy(row.schedtags, ['default', 'name'])
            if (tags.length > 0) {
              return tags.map(tag => <a-tag class='mb-2' color='blue'>{tag.name}</a-tag>)
            }
            return [
              <div class='text-color-help'>{ this.$t('compute.text_1322') }</div>,
            ]
          },
        },
      },
      getBrandTableColumn(),
      getAccountTableColumn({ vm: this }),
      getPublicScopeTableColumn({ vm: this, resource: 'hosts' }),
      getProjectDomainTableColumn({ vm: this }),
      getRegionTableColumn({ vm: this }),
    ]
  },
}
