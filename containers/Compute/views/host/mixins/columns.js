import _ from 'lodash'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import {
  getRegionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getEnabledTableColumn,
  getNameDescriptionTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getTagTableColumn,
  getAccountTableColumn,
  getOsArch,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
import { getHostSpecInfo } from '../utils/index'

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
          // { validator: this.$validate('serverCreateName') },
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
                ret.push(<a-tooltip title={i18n.t('compute.text_113')}><icon class='ml-2' type='passthrough' /></a-tooltip>)
              }
              if (row.page_size_kb > 4) {
                ret.push(<a-tooltip title={i18n.t('compute.large_page_memory_tips')}><icon class='ml-2' type='large-page-memory' /></a-tooltip>)
              }
              return ret
            },
          }
        },
      }),
      getStatusTableColumn({
        statusModule: 'host',
        minWidth: 100,
        vm: this,
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
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'hosts',
        columns: () => this.columns,
        editCheck: (row) => (row.provider || '').toLowerCase() !== 'bingocloud',
      }),
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
        formatter: ({ row }) => {
          const list = []
          if (row.access_ip) {
            list.push(`${row.access_ip}${this.$t('compute.text_1319')}`)
          }
          if (row.ipmi_ip) {
            list.push(`${row.ipmi_ip}${this.$t('compute.text_1320')}`)
          }
          return list.length ? list.join(',') : '-'
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
        formatter: ({ row }) => {
          return row.nonsystem_guests || '-'
        },
      },
      getOsArch({ field: 'cpu_architecture' }),
      {
        field: 'cpu_usage',
        title: this.$t('compute.text_563'),
        minWidth: 100,
        sortable: true,
        // sortBy: 'order_by_cpu_commit',
        slots: {
          default: ({ row }) => {
            const { cpu_count = 0, cpu_used = 0 } = getHostSpecInfo(row)
            const title = `${this.$t('common_407')}: ${Math.round(cpu_used)}\n${this.$t('common_234')}: ${Math.round(cpu_count)}`
            return [<UsedPercent used={cpu_used} total={cpu_count} title={title} usedFormatter={(val) => val > 0 ? (Math.max(Math.round(val), 1)) : Math.round(val)} totalFormatter={(val) => val > 0 ? (Math.max(Math.round(val), 1)) : Math.round(val)} />]
          },
          header: ({ column }) => {
            return [
              <span>
                <span>{column.title}</span>
                <a-tooltip class="ml-1" title={this.$t('compute.order_by_used_percent')}><a-icon type="question-circle" style="color: #aaa;" /></a-tooltip>
              </span>,
            ]
          },
        },
        formatter: ({ row }) => {
          const { cpu_count = 0, cpu_used = 0 } = getHostSpecInfo(row)
          const title = `${this.$t('common_407')}: ${Math.round(cpu_used)}, ${this.$t('common_234')}: ${Math.round(cpu_count)}`
          return title
        },
      },
      {
        field: 'virtual_cpu_usage',
        title: this.$t('compute.text_563_1'),
        minWidth: 100,
        sortable: true,
        // sortBy: 'order_by_cpu_commit',
        slots: {
          default: ({ row }) => {
            const { cpu_commit = 0, cpu_count = 0, cpu_count_virtual = 0, cpu_commit_bound } = getHostSpecInfo(row)
            const title = `${this.$t('common_233')}: ${Math.round(cpu_commit)}\n` +
              `${this.$t('common_234')}: ${Math.round(cpu_count_virtual)}\n` +
              `${this.$t('compute.text_594')}: ${(cpu_commit / cpu_count).toFixed(2)}\n` +
              `${this.$t('compute.cpu_commit_bound')}: ${cpu_commit_bound}`
            return [<UsedPercent used={cpu_commit} total={cpu_count_virtual} usedLabel={this.$t('common_233')} title={title} text={`${Math.round(cpu_commit)}/${Math.round(cpu_count_virtual)}`} />]
          },
          header: ({ column }) => {
            return [
              <span>
                <span>{column.title}</span>
                <a-tooltip class="ml-1" title={this.$t('compute.order_by_commit_percent')}><a-icon type="question-circle" style="color: #aaa;" /></a-tooltip>
              </span>,
            ]
          },
        },
        formatter: ({ row }) => {
          const { cpu_commit = 0, cpu_count_virtual = 0 } = getHostSpecInfo(row)
          const title = `${this.$t('common_233')}: ${Math.round(cpu_commit)}, ${this.$t('common_234')}: ${Math.round(cpu_count_virtual)}`
          return title
        },
      },
      {
        field: 'mem_usage',
        title: this.$t('compute.text_564'),
        minWidth: 100,
        sortable: true,
        // sortBy: 'order_by_mem_commit',
        slots: {
          default: ({ row }) => {
            const { mem_size, mem_used } = getHostSpecInfo(row)
            const title = `${this.$t('common_407')}: ${sizestr(mem_used, 'M', 1024)}\n${this.$t('common_234')}: ${sizestr(mem_size, 'M', 1024)}`
            return [<UsedPercent title={title} used={mem_used} total={mem_size} usedFormatter={(val) => sizestr(val, 'M', 1024)} totalFormatter={(val) => sizestr(val, 'M', 1024)} />]
          },
          header: ({ column }) => {
            return [
              <span>
                <span>{column.title}</span>
                <a-tooltip class="ml-1" title={this.$t('compute.order_by_used_percent')}><a-icon type="question-circle" style="color: #aaa;" /></a-tooltip>
              </span>,
            ]
          },
        },
        formatter: ({ row }) => {
          const { mem_size, mem_used } = getHostSpecInfo(row)
          const title = `${this.$t('common_407')}: ${sizestr(mem_used, 'M', 1024)}, ${this.$t('common_234')}: ${sizestr(mem_size, 'M', 1024)}`
          return title
        },
      },
      {
        field: 'virtual_mem_usage',
        title: this.$t('compute.text_564_1'),
        minWidth: 100,
        sortable: true,
        // sortBy: 'order_by_mem_commit',
        slots: {
          default: ({ row }) => {
            const { mem_size_virtual, mem_commit, mem_size, mem_commit_bound } = getHostSpecInfo(row)
            const title = `${this.$t('common_233')}: ${sizestr(mem_commit, 'M', 1024)}\n` +
              `${this.$t('common_234')}: ${sizestr(mem_size_virtual, 'M', 1024)}\n` +
              `${this.$t('compute.text_594')}: ${(mem_commit / mem_size).toFixed(2)}\n` +
              `${this.$t('compute.memory_commit_bound')}: ${mem_commit_bound}`
            return [<UsedPercent title={title} used={mem_commit} total={mem_size_virtual} usedLabel={this.$t('common_233')} usedFormatter={(val) => sizestr(val, 'M', 1024)} totalFormatter={(val) => sizestr(val, 'M', 1024)} />]
          },
          header: ({ column }) => {
            return [
              <span>
                <span>{column.title}</span>
                <a-tooltip class="ml-1" title={this.$t('compute.order_by_commit_percent')}><a-icon type="question-circle" style="color: #aaa;" /></a-tooltip>
              </span>,
            ]
          },
        },
        formatter: ({ row }) => {
          const { mem_size_virtual, mem_commit } = getHostSpecInfo(row)
          const title = `${this.$t('common_233')}: ${sizestr(mem_commit, 'M', 1024)}, ${this.$t('common_234')}: ${sizestr(mem_size_virtual, 'M', 1024)}`
          return title
        },
      },
      {
        field: 'storage_usage',
        title: this.$t('compute.text_565'),
        minWidth: 100,
        sortable: true,
        // sortBy: 'order_by_mem_commit',
        slots: {
          default: ({ row }) => {
            const { storage_size, actual_storage_used } = getHostSpecInfo(row)
            const title = `${this.$t('common_407')}: ${sizestr(actual_storage_used, 'M', 1024)}\n${this.$t('common_234')}: ${sizestr(storage_size, 'M', 1024)}`
            return [<UsedPercent title={title} used={actual_storage_used} total={storage_size} usedFormatter={(val) => sizestr(val, 'M', 1024)} totalFormatter={(val) => sizestr(val, 'M', 1024)} />]
          },
          header: ({ column }) => {
            return [
              <span>
                <span>{column.title}</span>
                <a-tooltip class="ml-1" title={this.$t('compute.order_by_used_percent')}><a-icon type="question-circle" style="color: #aaa;" /></a-tooltip>
              </span>,
            ]
          },
        },
        formatter: ({ row }) => {
          const { storage_size, actual_storage_used } = getHostSpecInfo(row)
          const title = `${this.$t('common_407')}: ${sizestr(actual_storage_used, 'M', 1024)}, ${this.$t('common_234')}: ${sizestr(storage_size, 'M', 1024)}`
          return title
        },
      },
      {
        field: 'virtual_storage_usage',
        title: this.$t('compute.text_565_1'),
        minWidth: 100,
        sortable: true,
        // sortBy: 'order_by_storage_virtual',
        slots: {
          default: ({ row }) => {
            const { storage_size_virtual, storage_commit, storage_size } = getHostSpecInfo(row)
            const title = `${this.$t('common_233')}: ${sizestr(storage_commit, 'M', 1024)}\n` +
              `${this.$t('common_234')}: ${sizestr(storage_size_virtual, 'M', 1024)}\n` +
              `${this.$t('compute.text_594')}: ${(storage_commit / storage_size).toFixed(2)}\n` +
              `${this.$t('compute.storage_commit_bound')}: ${(storage_size_virtual / storage_size).toFixed(2)}`
            return [<UsedPercent title={title} used={storage_commit} total={storage_size_virtual} usedLabel={this.$t('common_233')} usedFormatter={(val) => sizestr(val, 'M', 1024)} totalFormatter={(val) => sizestr(val, 'M', 1024)} />]
          },
          header: ({ column }) => {
            return [
              <span>
                <span>{column.title}</span>
                <a-tooltip class="ml-1" title={this.$t('compute.order_by_commit_percent')}><a-icon type="question-circle" style="color: #aaa;" /></a-tooltip>
              </span>,
            ]
          },
        },
        formatter: ({ row }) => {
          const { storage_size_virtual, storage_commit } = getHostSpecInfo(row)
          const title = `${this.$t('common_233')}: ${sizestr(storage_commit, 'M', 1024)}, ${this.$t('common_234')}: ${sizestr(storage_size_virtual, 'M', 1024)}`
          return title
        },
      },
      {
        field: 'manufacture',
        title: i18n.t('compute.text_847'),
        width: 70,
        slots: {
          default: ({ row }) => {
            if (row.sys_info && row.sys_info.oem_name) {
              const oem_name = row.sys_info.oem_name.replaceAll(' ', '_')
              const icons = {
                dell: { height: '25px' },
                hp: { height: '25px' },
                hpe: { height: '30px' },
                inspur: { height: '50px' },
                lenovo: { height: '10px' },
                supermicro: { height: '30px' },
                huawei: { height: '30px' },
                red_hat: { height: '30px' },
                ieit_systems: { height: '30px' },
              }
              const arr = Object.keys(icons)
              if (!arr.includes(oem_name)) {
                return row.sys_info.oem_name
              }
              const imgSrc = require(`../../physicalmachine/assets/${oem_name}.svg`)
              return [
                <a-tooltip title={ row.sys_info.oem_name }>
                  <img src={ imgSrc } style={ icons[oem_name] } />
                </a-tooltip>,
              ]
            }
          },
        },
        formatter: ({ row }) => {
          if (row.sys_info && row.sys_info.oem_name) {
            return row.sys_info.oem_name
          }
          return '-'
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
        field: 'schedtags',
        title: i18n.t('compute.text_541'),
        width: 120,
        type: 'expand',
        slots: {
          default: ({ row }) => {
            if (row.schedtags && row.schedtags.length > 0) {
              return this.$t('common_323', [row.schedtags.length])
            }
            return [
              <div class='text-color-help'>{this.$t('compute.text_1322')}</div>,
            ]
          },
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
        formatter: ({ row }) => {
          const tags = _.sortBy(row.schedtags, ['default', 'name'])
          if (tags.length > 0) {
            return tags.map(tag => tag.name)
          }
          return this.$t('compute.text_1322')
        },
      },
      getBrandTableColumn(),
      getAccountTableColumn({ vm: this }),
      getPublicScopeTableColumn({ vm: this, resource: 'hosts' }),
      getProjectDomainTableColumn({ vm: this }),
      getRegionTableColumn({ vm: this }),
      getTimeTableColumn(),
    ]
  },
}
