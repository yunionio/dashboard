<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { DBINSTANCE_CATEGORY } from '../constants/index.js'
import { sizestr } from '@/utils/utils'
import { Manager } from '@/utils/manager'
import { getNameFilter, getFilter, getTenantFilter } from '@/utils/common/tableFilter'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getNameDescriptionTableColumn, getBrandTableColumn } from '@/utils/common/tableColumn'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'dbinstances',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.rds).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getFilter({
            title: '状态',
            field: 'status',
            multiple: true,
            items: [
              { label: '运行中', key: 'running' },
              { label: '关机', key: 'ready' },
              { label: '未知', key: 'unknown' },
              { label: '调度失败', key: 'sched_fail' },
            ],
          }),
          brand: {
            label: '平台',
            dropdown: true,
            multiple: true,
            items: [
              { label: '阿里云', key: 'Aliyun' },
              { label: '华为云', key: 'Huawei' },
            ],
          },
          // account: getAccountFilter(),
          tennat: getTenantFilter(),
          billing_type: getFilter({
            field: 'billing_type',
            title: '计费方式',
            items: [
              { label: '按量付费', key: 'postpaid' },
              { label: '包年包月', key: 'prepaid' },
            ],
          }),
          engine: getFilter({
            field: 'engine',
            title: '数据库引擎',
            items: [
              { label: 'MySQL', key: 'MySQL' },
              { label: 'PostgreSQL', key: 'PostgreSQL' },
              { label: 'SQLServer', key: 'SQLServer' },
            ],
          }),
          internal_connection_str: getFilter({
            field: 'internal_connection_str',
            title: '链接地址-内网',
          }),
          connection_str: getFilter({
            field: 'connection_str',
            title: '链接地址-外网',
          }),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          addLock: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.sidePageTriggerHandle(row.id, 'RDSSidePage')}>{row.name}</side-page-trigger>
            )
          },
        }),
        {
          field: 'category',
          title: '类型',
          width: 70,
          slots: {
            default: ({ row }) => {
              return DBINSTANCE_CATEGORY[row.category]
            },
          },
        },
        {
          field: 'vcpu_count',
          title: '配置',
          width: 90,
          slots: {
            default: ({ row }) => {
              return `${row.vcpu_count}核 ${sizestr(row.vmem_size_mb, 'M', 1024)}`
            },
          },
        },
        {
          field: 'engine',
          title: '数据库引擎',
          width: 100,
          slots: {
            default: ({ row }) => {
              return `${row.engine} ${row.engine_version}`
            },
          },
        },
        // {
        //   field: 'password',
        //   title: '密码',
        //   slots: {
        //     default: ({ row }) => {
        //       return [<PasswordFetcher serverId={row.id} resourceType='elasticcaches' />]
        //     },
        //   },
        // },
        {
          field: 'internal_connection_str',
          title: '链接地址',
          minWidth: 200,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              const pri = row.internal_connection_str
              const pub = row.connection_str
              if (!pri && !pub) {
                return '-'
              }
              const connection = (title, value) => {
                if (!value) {
                  return null
                }
                return (
                  <div class="d-flex align-items-center">
                    <span class="text-truncate">
                      {title}：{value}
                    </span>
                    <copy message={value} />
                  </div>
                )
              }
              return [
                connection('内网', pri),
                connection('外网', pub),
              ]
            },
          },
        },
        {
          title: '数据库端口号',
          field: 'port',
          width: 100,
          slots: {
            default: ({ row }) => row.port || '-',
          },
        },
        {
          field: 'account',
          minWidth: 100,
          title: '云账号',
        },
        {
          field: 'billing_type',
          title: '计费方式',
          width: 100,
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.billing_type === 'postpaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>按量付费</div>)
              } else if (row.billing_type === 'prepaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>包年包月</div>)
              }
              if (row.expired_at) {
                let dateArr = this.$moment(row.expired_at).fromNow().split(' ')
                let date = dateArr.join('')
                let seconds = this.$moment(row.expired_at).diff(new Date()) / 1000
                let textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
                let text = seconds < 0 ? '已过期' : `${date.substring(0, date.length - 1)}后到期`
                ret.push(<div style={{ color: textColor }}>{text}</div>)
              }
              return ret
            },
          },
        },
        getStatusTableColumn({ statusModule: 'rds' }),
        getProjectTableColumn(),
        getBrandTableColumn(),
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'rds_dbinstances_create',
          action: () => {
            this.$router.push('/rds/create')
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          permission: 'rds_dbinstances_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            let validate = true
            let tooltip = ''
            if (this.list.selectedItems.length === 0) {
              validate = false
              tooltip = '请选择需要操作的实例'
            }
            if (this.list.selectedItems.length > 0) {
              for (let i = 0; i < this.list.selectedItems.length; i++) {
                let obj = this.list.selectedItems[i]
                if (obj['disable_delete']) {
                  tooltip = '删除保护，如需解除，请点击【设置删除保护】'
                  validate = false
                  break
                }
                let seconds = this.$moment(obj.expired_at).diff(new Date()) / 1000
                if (obj.billing_type === 'prepaid' && seconds > 0) {
                  tooltip = '实例未到期不允许删除'
                  validate = false
                  break
                }
              }
            }
            return {
              validate,
              tooltip,
            }
          },
        },
        {
          label: '更多',
          actions: (obj) => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? '请选择需要操作的实例' : ''
            return [
              {
                label: '同步状态',
                action: (obj) => {
                  this.list.batchPerformAction('sync-status', null)
                },
                meta: () => {
                  return {
                    validate: selectedLength,
                    tooltip: notSelectedTooltip,
                  }
                },
              },
              disableDeleteAction(this),
              // {
              //   label: '修改属性',
              //   action: () => {
              //     this.createDialog('RDSEditAttrDialog')
              //   },
              //   meta: () => {
              //     return {
              //       validate: selectedLength,
              //       tooltip: notSelectedTooltip,
              //     }
              //   },
              // },
              {
                label: '重启',
                action: () => {
                  this.createDialog('RDSRestartdialog', {
                    title: '重启',
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  return {
                    validate: selectedLength,
                    tooltip: notSelectedTooltip,
                  }
                },
              },
            ]
          },
        },
      ],
      singleActions: [
        {
          label: '同步状态',
          action: (obj) => {
            this.list.onManager('performAction', {
              steadyStatus: 'running',
              id: obj.id,
              managerArgs: {
                action: 'sync-status',
              },
            }).then(ret => {
              if (ret.status === 200) {
                this.$message.success('操作成功')
              }
            })
          },
        },
        {
          label: '更多',
          actions: (obj) => {
            const isRunning = obj.status.toLowerCase() === 'running'
            const notRunninTip = !isRunning ? '仅运行中的实例支持此操作' : null
            return [
              // {
              //   label: '修改属性',
              //   action: () => {
              //     this.createDialog('RDSEditAttrDialog', {
              //       title: '修改属性',
              //       data: [obj],
              //       columns: this.columns,
              //       list: this.list,
              //     })
              //   },
              // },
              {
                label: '更改项目',
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    title: '更改项目',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  return {
                    // validate: selectedLength,
                    // tooltip: notSelectedTooltip,
                  }
                },
              },
              {
                label: '重启',
                action: () => {
                  this.createDialog('RDSRestartdialog', {
                    title: '重启',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                  // this.list.onManager('performAction', {
                  //   steadyStatus: 'running',
                  //   id: obj.id,
                  //   managerArgs: {
                  //     action: 'restart',
                  //   },
                  // })
                },
                meta: () => {
                  return {
                    validate: isRunning,
                    tooltip: notRunninTip,
                  }
                },
              },
              {
                label: '续费',
                action: () => {
                  this.createDialog('RedisRenewDialog', {
                    title: '续费',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  const isPrepaid = obj.billing_type === 'prepaid'
                  const validate = (isRunning && isPrepaid)
                  return {
                    validate: validate,
                    tooltip: notRunninTip || (!isPrepaid ? '仅包年包月的实例支持此操作' : null),
                  }
                },
              },
              {
                label: '调整配置',
                action: () => {
                  this.createDialog('RSDSetConfig', {
                    title: '调整配置',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  return {
                    validate: isRunning,
                    tooltip: notRunninTip,
                  }
                },
              },
              disableDeleteAction(this),
              {
                label: '删除',
                permission: 'rds_dbinstances_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    title: '删除',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  let tooltip = ''
                  let seconds = this.$moment(obj.expired_at).diff(new Date()) / 1000
                  if (obj.disable_delete) {
                    tooltip = '请点击修改属性禁用删除保护后重试'
                  } else if (obj.billing_type === 'prepaid' && seconds > 0) {
                    tooltip = '实例未到期不允许删除'
                  }
                  return {
                    validate: !tooltip,
                    tooltip: tooltip,
                  }
                },
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.webconsoleManager = new Manager('webconsole', 'v1')
    this.list.fetchData()
    this.initSidePageTab('detail')
  },
}
</script>
<style lang="scss">
.td-ellipsis {
  width: 150px;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
