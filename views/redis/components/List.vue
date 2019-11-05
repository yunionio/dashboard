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
import { Manager } from '@/utils/manager'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getNameDescriptionTableColumn, getBrandTableColumn } from '@/utils/common/tableColumn'
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
          name: {
            label: '实例名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          status: {
            label: '实例状态',
            dropdown: true,
            multiple: true,
            items: [
              { label: '运行中', key: 'running' },
              { label: '关机', key: 'ready' },
              { label: '未知', key: 'unknown' },
              { label: '调度失败', key: 'sched_fail' },
            ],
            filter: true,
            formatter: val => {
              return `status.in(${val.join(',')})`
            },
          },
          brand: {
            label: '平台',
            dropdown: true,
            multiple: true,
            items: [
              { label: 'OneCloud', key: 'OneCloud' },
              { label: 'OpenStack', key: 'OpenStack' },
            ],
          },
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
          title: '类型',
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
          slots: {
            default: ({ row }) => {
              return sizestr(row.capacity_mb, 'M', 1024)
            },
          },
        },
        {
          field: 'engine',
          title: '类型版本',
          slots: {
            default: ({ row }) => {
              return `${row.engine} ${row.engine_version}`
            },
          },
        },
        {
          field: 'password',
          title: '密码',
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={row.id} resourceType='elasticcaches' />]
            },
          },
        },
        {
          title: '链接地址',
          slots: {
            default: ({ row }) => {
              const pri = row.private_dns || row.private_ip_addr
              const pub = row.public_dns || row.public_ip_addr
              if (!pri && !pub) {
                return '-'
              }
              return [
                <div>{pri}</div>,
                <div>{pub}</div>,
              ]
            },
          },
        },
        {
          title: '端口',
          slots: {
            default: ({ row }) => {
              if (!row.private_connect_port && !row.public_connect_port) {
                return '-'
              }
              return [
                <div>{row.private_connect_port > 0 && row.private_connect_port}</div>,
                <div>{row.public_connect_port > 0 && row.public_connect_port}</div>,
              ]
            },
          },
        },
        {
          field: 'account',
          title: '云账号',
          slots: {
            default: ({ row }) => {
              return row.account
            },
          },
        },
        {
          field: 'billing_type',
          title: '计费方式',
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
          action: () => {
            this.createServer()
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
      singleActions: [
        {
          label: '同步状态',
          action: (obj) => {
            this.list.onManager('performAction', {
              id: obj.id,
              managerArgs: {
                action: 'Sync',
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
            const isRunning = obj.status === 'running'
            const notRunninTip = !isRunning ? '仅运行中的实例支持此操作' : null
            const isAuthModeOn = obj.auth_mode === 'on'
            const setAuthMode = () => {
              if (isAuthModeOn) {
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
                label: '开启密码访问',
                action: () => {
                  this.createDialog('RedisUpdateAuthModeDialog', {
                    title: '开启密码访问',
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
            return [
              {
                label: '修改属性',
                action: () => {
                },
              },
              {
                label: '重启',
                action: () => {
                  this.list.onManager('performAction', {
                    steadyStatus: 'running',
                    id: obj.id,
                    managerArgs: {
                      action: 'restart',
                    },
                  })
                },
                meta: () => {
                  const isRunning = obj.status === 'running'
                  const notRunninTip = !isRunning ? '仅运行中的实例支持此操作' : null
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
                  this.createDialog('RedisSetConfigDialog', {
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
                label: '重置密码',
                action: () => {
                  this.createDialog('RedisResetPassworddialog', {
                    title: '重置密码',
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
              {
                label: '删除',
                action: () => {
                  this.createDialog('RedisDeletedialog', {
                    title: '删除',
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  return {
                    validate: obj.can_delete,
                    tooltip: obj.disable_delete ? '请点击修改属性禁用删除保护后重试' : null,
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
    this.initSidePageTab('redis-detail')
  },
  methods: {
    createServer () {
      this.$router.push('/redis/create')
    },
  },
}
</script>
