<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'UserDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    const driverOptions = Object.keys(this.$t('idpDrivers')).reduce((prev, current) => {
      prev[current.toLowerCase()] = current
      return prev
    }, {})
    return {
      configData: {},
      baseInfo: [
        {
          field: 'displayname',
          title: this.$t('scope.text_245'),
          slots: {
            default: ({ row }) => {
              return [<list-body-cell-wrap copy row={ row } field='displayname' title={ row.displayname || '-' } />]
            },
          },
        },
        getEnabledTableColumn(),
        getEnabledTableColumn({
          field: 'allow_web_console',
          title: this.$t('system.text_512'),
        }),
        getEnabledTableColumn({
          field: 'enable_mfa',
          title: 'MFA',
        }),
        {
          field: 'group_count',
          title: this.$t('system.text_514'),
          slots: {
            default: ({ row }) => {
              if (!row.group_count) return '0'
              return [<a onClick={ () => this.$emit('tab-change', 'Group') }>{row.group_count}</a>]
            },
          },
        },
        {
          field: 'project_count',
          title: this.$t('system.text_560'),
          slots: {
            default: ({ row }) => {
              if (!row.project_count) return '0'
              return [<a onClick={ () => this.$emit('tab-change', 'projects') }>{row.project_count}</a>]
            },
          },
        },
        {
          field: 'idps',
          title: this.$t('system.text_165'),
          slots: {
            default: ({ row }) => {
              if (row.idps && row.idps.length) {
                return row.idps.map(item => {
                  return item.idp
                }).join('、')
              }
              return '-'
            },
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('system.text_515'),
          items: [
            {
              field: 'last_login_ip',
              title: this.$t('system.text_516'),
            },
            {
              field: 'last_login_source',
              title: this.$t('system.text_517'),
            },
            {
              field: 'last_active_at',
              title: this.$t('system.text_518'),
              slots: {
                default: ({ row }) => {
                  return row.last_active_at ? this.$moment(row.last_active_at).format() : '-'
                },
              },
            },
            {
              field: 'password_expires_at',
              title: this.$t('system.text_519'),
              slots: {
                default: ({ row }) => {
                  const expiresAt = row.password_expires_at
                  if (expiresAt) {
                    const days = this.$moment(expiresAt).diff(new Date(), 'days')
                    const hours = this.$moment(expiresAt).diff(new Date(), 'hours', true)
                    if (days > 7) {
                      return this.$moment(expiresAt).format()
                    }
                    if (days <= 7 && days >= 0 && hours > 0) {
                      if (days === 0) {
                        return <div style="color:red">{ this.$t('system.text_520', [hours >= 1 ? parseInt(hours) : 1]) }</div>
                      }
                      return <div style="color:orange">{ this.$t('system.text_557', [days]) }</div>
                    }
                    return <div style="color:red">{ this.$t('system.text_558', [days]) }</div>
                  }
                  return '-'
                },
              },
            },
          ],
        },
        {
          field: 'idps',
          title: this.$t('common_460', [this.$t('dictionary.identity_provider')]),
          slots: {
            default: ({ row }) => {
              return [
                <vxe-grid
                  data={row.idps}
                  columns={[
                    { title: this.$t('common_704'), field: 'idp' },
                    {
                      title: this.$t('system.text_204'),
                      field: 'idp_driver',
                      formatter: ({ cellValue }) => driverOptions[cellValue] || cellValue,
                    },
                    {
                      title: this.$t('common_550'),
                      field: 'template',
                      formatter: ({ row }) => this.$t('idpTmplTitles')[row.template] ? this.$t(`idpTmplTitles.${row.template}`) : row.template || '-',
                    },
                    { title: this.$t('common_705'), field: 'idp_entity_id' },
                  ]} />,
              ]
            },
          },
          hidden: () => !this.data.idps || this.data.idps.length === 0,
        },
      ],
    }
  },
}
</script>
