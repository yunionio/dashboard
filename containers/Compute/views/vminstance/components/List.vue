<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import qs from 'qs'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { Manager } from '@/utils/manager'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getBrandTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmInstanceList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'servers',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.server).flat(),
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
          os_type: {
            label: '系统类型',
            dropdown: true,
            multiple: true,
            items: [
              { label: 'Windows', key: 'windows' },
              { label: 'Linux', key: 'linux' },
              { label: 'VMware', key: 'VMWare' },
            ],
            filter: true,
            formatter: val => {
              return `os_type.contains(${val})`
            },
          },
        },
      }),
      columns: [
        {
          width: 100,
          field: 'name',
          title: '名称',
          slots: {
            default: ({ row }) => {
              return [(
                <copy-with-content message={ row.name }>
                  <span>{ row.name }</span>
                  { row.disable_delete ? <a-tooltip title='删除保护，如需解除，请点击【修改属性】'>
                    <a-icon class='ml-1' type='lock' theme='twoTone' twoToneColor='#52c41a' />
                  </a-tooltip> : null }
                </copy-with-content>
              )]
            },
          },
        },
        {
          field: 'ip',
          title: 'IP',
          slots: {
            default: ({ row }) => {
              if (!row.eip && !row.ips) return '-'
              let ret = []
              if (row.eip) {
                ret.push(
                  <copy-with-content message={ row.eip }>{ row.eip }<span class='ml-2 text-weak'>（弹性）</span></copy-with-content>
                )
              }
              if (row.ips) {
                const ips = row.ips.split(',').map(ip => {
                  return <copy-with-content message={ ip }>{ ip }<span class='ml-2 text-weak'>（内网）</span></copy-with-content>
                })
                ret = ret.concat(ips)
              }
              return ret
            },
          },
        },
        {
          field: 'instance_type',
          title: '配置',
          slots: {
            default: ({ row }) => {
              let ret = []
              if (row.instance_type) {
                ret.push(<div style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
              }
              const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
              return ret.concat(<div style={{ color: '#53627C' }}>{ config }</div>)
            },
          },
        },
        {
          field: 'os_type',
          title: '系统',
          slots: {
            default: ({ row }) => {
              let name = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type
              if (name.includes('Windows') || name.includes('windows')) {
                name = 'Windows'
              }
              const version = (row.metadata && row.metadata.os_version) ? `${row.metadata.os_version}` : ''
              const tooltip = version.includes(name) ? version : `${name} ${version}` // 去重
              return [
                <SystemIcon tooltip={ tooltip } name={ name } />,
              ]
            },
          },
        },
        {
          field: 'password',
          title: '密码',
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='servers' />]
            },
          },
        },
        {
          field: 'secgroups',
          title: '安全组',
          formatter: ({ cellValue }) => {
            return cellValue.map(item => item.name).join(',')
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
                ret.push(<div style={{ color: textColor }}>{ text }</div>)
              }
              return ret
            },
          },
        },
        getStatusTableColumn({ statusModule: 'server' }),
        getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC' }),
        getCopyWithContentTableColumn({ field: 'host', title: '宿主机' }),
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
          label: '远程控制',
          actions: obj => {
            let ret = []
            ret.push({
              label: 'VNC 远程终端',
              action: () => {
                const isValidURL = str => {
                  let regex = /(\w+):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!-/]))?/
                  if (!regex.test(str)) {
                    return false
                  } else {
                    return true
                  }
                }
                this.webconsoleManager.performAction({
                  id: 'server',
                  action: obj.id,
                }).then(({ data }) => {
                  if (isValidURL(data.connect_params)) {
                    open(data.connect_params)
                  } else {
                    const connectParams = qs.parse(data.connect_params)
                    const query = {
                      ...connectParams,
                      session: data.session,
                      hypervisor: obj.hypervisor,
                      os_type: obj.os_type,
                    }
                    const href = `https://console.yunion.cn/web-console?${qs.stringify(query)}`
                    open(href)
                  }
                })
              },
              meta: () => {
                return {
                  validate: true,
                }
              },
            })
            const mapIpActions = (ipArr, type) => {
              if (!['IP SSH', 'EIP SSH'].includes(type)) throw Error('ssh 类型必须为 IP SSH,EIP SSH 中的一种')
              const options = []
              ipArr.forEach(v => {
                options.push({
                  label: `SSH ${v}`,
                  action: () => {
                    this.webconsoleManager.performAction({
                      id: 'ssh',
                      action: v,
                    }).then(({ data }) => {
                      const connectParams = qs.parse(data.connect_params)
                      const query = {
                        ...connectParams,
                        session: data.session,
                        hypervisor: obj.hypervisor,
                        os_type: obj.os_type,
                      }
                      const href = `https://console.yunion.cn/web-console?${qs.stringify(query)}`
                      open(href)
                    })
                  },
                  meta: () => {
                    return {
                      tooltip: obj.os_type === 'Windows' ? 'Windows 不支持 SSH 连接' : null,
                      validate: obj.os_type !== 'Windows',
                    }
                  },
                })
              })
              return options
            }
            let eips = (obj.eip || '').split(',').filter(item => !!item)
            let ips = (obj.ips || '').split(',').filter(item => !!item)
            eips = eips.length ? mapIpActions(eips, 'EIP SSH') : []
            ips = ips.length ? mapIpActions(ips, 'IP SSH') : []
            ret = ret.concat(eips).concat(ips)
            return ret
          },
        },
        {
          label: '更多',
          actions: (obj) => {
            return [
              {
                label: '实例状态',
                submenus: [
                  {
                    label: '开机',
                    action: () => {
                      this.list.onManager('performAction', {
                        steadyStatus: 'running',
                        id: obj.id,
                        managerArgs: {
                          action: 'start',
                        },
                      })
                    },
                    meta: () => {
                      return {
                        validate: obj.status !== 'running',
                      }
                    },
                  },
                  {
                    label: '关机',
                    action: () => {
                      this.list.onManager('performAction', {
                        steadyStatus: 'ready',
                        id: obj.id,
                        managerArgs: {
                          action: 'stop',
                        },
                      })
                    },
                    meta: () => {
                      return {
                        validate: obj.status !== 'ready',
                      }
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
                  },
                ],
              },
              {
                label: '实例设置',
                submenus: [
                  {
                    label: '修改属性',
                    action: () => {
                      this.createDialog('VmUpdateDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
                      })
                    },
                  },
                ],
              },
              {
                label: '删除',
                submenus: [
                  {
                    label: '删除',
                    action: () => {
                      this.list.onManager('delete', {
                        id: obj.id,
                      })
                    },
                    meta: () => {
                      return {
                        validate: obj.can_delete,
                        tooltip: obj.disable_delete ? '请点击修改属性禁用删除保护后重试' : null,
                      }
                    },
                  },
                ],
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
  },
  methods: {
    createServer () {
      this.$router.push('/vminstance/create')
    },
    getParams () {
      return {
        details: true,
        with_meta: true,
        filter: 'hypervisor.notin(baremetal,container)',
      }
    },
  },
}
</script>
