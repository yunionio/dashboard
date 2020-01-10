<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { ENGINE_ARCH } from '../constants/index.js'
import { sizestr } from '@/utils/utils'
import { getNameFilter, getStatusFilter, getTenantFilter, getFilter } from '@/utils/common/tableFilter'
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
        resource: 'elasticcaches',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.redis).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('redis'),
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
          tenant: getTenantFilter(),
          billing_type: getFilter({
            field: 'billing_type',
            title: '计费方式',
            items: [
              { label: '按量付费', key: 'postpaid' },
              { label: '包年包月', key: 'prepaid' },
            ],
          }),
          engine_version: {
            label: '版本',
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'engine_version',
            },
          },
          arch_type: {
            label: '实例类型',
            dropdown: true,
            multiple: true,
            items: Object.keys(ENGINE_ARCH).map(key => {
              return { label: ENGINE_ARCH[key], key }
            }),
          },
          private_dns: getFilter({
            field: 'private_dns',
            title: '链接地址-内网',
          }),
          public_dns: getFilter({
            field: 'public_dns',
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
              <side-page-trigger onTrigger={() => this.sidePageTriggerHandle(row.id, 'RedisSidePage')}>{row.name}</side-page-trigger>
            )
          },
        }),
        {
          field: 'arch_type',
          title: '实例类型',
          width: 70,
          slots: {
            default: ({ row }) => {
              const type = row.local_category || row.arch_type
              return ENGINE_ARCH[type] || type
            },
          },
        },
        {
          field: 'instance_type',
          title: '配置',
          width: 50,
          slots: {
            default: ({ row }) => {
              return sizestr(row.capacity_mb, 'M', 1024)
            },
          },
        },
        {
          field: 'engine',
          title: '类型版本',
          width: 70,
          slots: {
            default: ({ row }) => {
              return `${row.engine} ${row.engine_version}`
            },
          },
        },
        {
          field: 'password',
          title: '密码',
          width: 50,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={row.id} resourceType='elasticcaches' />]
            },
          },
        },
        {
          title: '链接地址',
          minWidth: 200,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              const pri = row.private_dns || row.private_ip_addr
              const pub = row.public_dns || row.public_ip_addr
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
          title: '端口',
          width: 100,
          slots: {
            default: ({ row }) => {
              if (!row.private_connect_port && !row.public_connect_port) {
                return '-'
              }
              const ports = []
              if (row.private_connect_port && (row.private_dns || row.private_ip_addr)) {
                ports.push(<div> 内网：{row.private_connect_port}</div>)
              }
              if (row.public_connect_port && (row.public_dns || row.public_ip_addr)) {
                ports.push(<div>外网：{row.public_connect_port}</div>,)
              }
              return ports
            },
          },
        },
        {
          field: 'account',
          title: '云账号',
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              return row.account
            },
          },
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
        getStatusTableColumn({ statusModule: 'redis' }),
        getProjectTableColumn(),
        getBrandTableColumn(),
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'redis_elasticcaches_create',
          action: () => {
            this.createServer()
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
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
          label: '批量操作',
          actions: (obj) => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? '请选择需要操作的实例' : ''
            return [
              {
                label: '同步状态',
                action: (obj) => {
                  this.list.batchPerformAction('Sync', null)
                },
                meta: () => {
                  return {
                    validate: selectedLength,
                    tooltip: notSelectedTooltip,
                  }
                },
              },
              {
                label: '修改属性',
                action: () => {
                  this.createDialog('RedisEditAttrDialog', {
                    title: '修改属性',
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
              {
                label: '清空数据',
                action: () => {
                  this.createDialog('RedisClearDataDialog', {
                    title: '清空数据',
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
              {
                label: '重启',
                action: () => {
                  this.createDialog('RedisRestartdialog', {
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
              disableDeleteAction(this),
            ]
          },
        },
      ],
      singleActions: [
        {
          label: '同步状态',
          action: (obj) => {
            this.list.onManager('performAction', {
              id: obj.id,
              steadyStatus: 'running',
              managerArgs: {
                action: 'Sync',
              },
            })
          },
        },
        {
          label: '更多',
          actions: (obj) => {
            const { provider, status } = obj
            const isRunning = status.toLowerCase() === 'running'
            const notRunninTip = !isRunning ? '仅运行中的实例支持此操作' : null
            const isAuthModeOn = obj.auth_mode === 'on'
            const setAuthMode = () => {
              if (!isAuthModeOn && obj.brand !== 'Huawei') {
                return {
                  label: '关闭免密访问',
                  action: () => {
                    this.createDialog('RedisUpdateAuthModeDialog', {
                      title: '关闭免密访问',
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
                }
              }
              return {
                label: '开启免密访问',
                action: () => {
                  this.createDialog('RedisUpdateAuthModeDialog', {
                    title: '开启免密访问',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  return {
                    validate: isRunning && obj.brand !== 'Huawei',
                    tooltip: notRunninTip || (obj.brand === 'Huawei' && '华为云暂不支持此操作'),
                  }
                },
              }
            }
            return [
              // {
              //   label: '修改属性',
              //   action: () => {
              //     this.createDialog('RedisEditAttrDialog', {
              //       title: '修改属性',
              //       data: [obj],
              //       columns: this.columns,
              //       list: this.list,
              //     })
              //   },
              // },
              {
                label: `更改${this.$t('dictionary.project')}`,
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    title: `更改${this.$t('dictionary.project')}`,
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
                  this.createDialog('RedisRestartdialog', {
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
              // {
              //   label: '续费',
              //   action: () => {
              //     this.createDialog('RedisRenewDialog', {
              //       title: '续费',
              //       data: [obj],
              //       columns: this.columns,
              //       list: this.list,
              //     })
              //   },
              //   meta: () => {
              //     const isPrepaid = obj.billing_type === 'prepaid'
              //     const validate = (isRunning && isPrepaid)
              //     return {
              //       validate: validate,
              //       tooltip: notRunninTip || (!isPrepaid ? '仅包年包月的实例支持此操作' : null),
              //     }
              //   },
              // },
              {
                label: '调整配置',
                action: () => {
                  this.createDialog('RedisSetConfigDialog', {
                    title: '调整配置',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                // meta: () => {
                //   const isPrepaid = obj.billing_type === 'prepaid'
                //   return {
                //     validate: isRunning && !isPrepaid,
                //     tooltip: notRunninTip || (isPrepaid ? '仅包年包月的实例，暂不支持此操作' : ''),
                //   }
                // },
              },
              {
                label: '清空数据',
                action: () => {
                  this.createDialog('RedisClearDataDialog', {
                    title: '清空数据',
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
              {
                label: provider === 'Huawei' ? '修改密码' : '重置密码',
                action: () => {
                  this.createDialog('RedisResetPassworddialog', {
                    title: provider === 'Huawei' ? '修改密码' : '重置密码',
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
              setAuthMode(),
              disableDeleteAction(this),
              {
                label: '删除',
                permission: 'redis_elasticcaches_delete',
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
                    tooltip = '删除保护，如需解除，请点击【设置删除保护】'
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
    this.list.fetchData()
    this.initSidePageTab('redis-detail')
  },
  methods: {
    createServer () {
      this.$router.push('/redis/create')
    },
    getSeachStatus () {
      const selectedStatus = ['running', 'unknown', 'sync_failed']
      const status = []
      for (let key in this.$t('status.redis')) {
        if (selectedStatus.indexOf(key) > -1) {
          status.push({
            key,
            label: this.$t('status.redis')[key],
          })
        }
      }
      return status
    },
  },
}
</script>
<style lang="scss">
 .td-ellipsis{
    width: 150px;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
 }
</style>
