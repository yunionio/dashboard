<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extraInfo="extraInfo"
    :hiddenKeys="['project_domain', 'tenant', 'status']"
    :show-desc="false"
    :is-edit-name="false" />
</template>

<script>
import {
  getConfigTypeTableColumn,
  getAttirubuteTableColumn,
} from '../utils/columns'
import {
  getEnabledTableColumn,
  // getSwitchTableColumn
} from '@/utils/common/tableColumn'

export default {
  name: 'NotifyConfigDetail',
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
    return {
      baseInfo: [
        getConfigTypeTableColumn(),
        getAttirubuteTableColumn(),
      ],
      configInfo: {
        email: [
          {
            title: this.$t('system.text_255'),
            items: [
              {
                field: 'hostname',
                title: this.$t('system.text_269'),
                formatter: ({ row }) => {
                  return row.content?.hostname || '-'
                },
              },
              {
                field: 'hostport',
                title: this.$t('system.text_270'),
                formatter: ({ row }) => {
                  return row.content?.hostport || '-'
                },
              },
              {
                field: 'username',
                title: this.$t('system.text_126'),
                formatter: ({ row }) => {
                  return row.content?.username || '-'
                },
              },
              getEnabledTableColumn({ title: 'SSL', field: 'content.ssl_global' }),
              // getSwitchTableColumn({
              //   field: 'content.ssl_global',
              //   title: 'SSL',
              //   change: val => {
              //     this.onManager('update', {
              //       id: this.data.id,
              //       managerArgs: {
              //         data: { content: { ...this.data.content, ssl_global: val } },
              //       },
              //     })
              //   },
              // }),
            ],
          },
        ],
        mobile: [
          {
            title: this.$t('system.text_255'),
            items: [
              {
                field: 'access_key_id',
                title: 'Access Key ID',
                formatter: ({ row }) => {
                  return row.content?.access_key_id || '-'
                },
              },
              {
                field: 'signature',
                title: this.$t('system.text_288'),
                formatter: ({ row }) => {
                  return row.content?.signature || '-'
                },
              },
            ],
          },
          {
            title: this.$t('system.mobile_cn_tpl'),
            items: [
              {
                field: 'verifiyCode',
                title: this.$t('system.text_295'),
                formatter: ({ row }) => {
                  return this.smsTplInfo?.verifiyCode || '-'
                },
              },
              {
                field: 'alertsCode',
                title: this.$t('system.alert_tpl'),
                formatter: ({ row }) => {
                  return this.smsTplInfo?.alertsCode || '-'
                },
              },
              {
                field: 'errorCode',
                title: this.$t('system.error_login_tpl'),
                formatter: ({ row }) => {
                  return this.smsTplInfo?.errorCode || '-'
                },
              },
            ],
          },
          {
            title: this.$t('system.mobile_en_tpl'),
            items: [
              {
                field: 'verifiyCodeUn',
                title: this.$t('system.text_295'),
                formatter: ({ row }) => {
                  return this.smsTplInfo?.verifiyCodeUn || '-'
                },
              },
              {
                field: 'alertsCode',
                title: this.$t('system.alert_tpl'),
                formatter: ({ row }) => {
                  return this.smsTplInfo?.alertsCodeUn || '-'
                },
              },
              {
                field: 'errorCode',
                title: this.$t('system.error_login_tpl'),
                formatter: ({ row }) => {
                  return this.smsTplInfo?.errorCodeUn || '-'
                },
              },
            ],
          },
        ],
        feishu: [
          {
            title: this.$t('system.text_255'),
            items: [
              {
                field: 'app_id',
                title: 'AppID',
                formatter: ({ row }) => {
                  return row.content?.app_id || '-'
                },
              },
            ],
          },
        ],
        dingtalk: [
          {
            title: this.$t('system.text_255'),
            items: [
              {
                field: 'agent_id',
                title: 'AgentId',
                formatter: ({ row }) => {
                  return row.content?.agent_id || '-'
                },
              },
              {
                field: 'app_key',
                title: 'AppKey',
                formatter: ({ row }) => {
                  return row.content?.app_key || '-'
                },
              },
            ],
          },
        ],
        workwx: [
          {
            title: this.$t('system.text_255'),
            items: [
              {
                field: 'corp_id',
                title: this.$t('system.wecom.corp_id'),
                formatter: ({ row }) => {
                  return row.content?.corp_id || '-'
                },
              },
              {
                field: 'agent_id',
                title: 'AgentId',
                formatter: ({ row }) => {
                  return row.content?.agent_id || '-'
                },
              },
            ],
          },
        ],
      },
      smsTplInfo: {},
    }
  },
  computed: {
    extraInfo () {
      return this.configInfo[this.data.type] || []
    },
  },
  created () {
    this.notifytemplatesManager = new this.$Manager('notifytemplates', 'v1')
    this.fetchNotifyTpl()
  },
  destroyed () {
    this.notifytemplatesManager = null
  },
  methods: {
    fetchNotifyTpl () {
      this.notifytemplatesManager.list({ params: { contact_type: 'mobile' } })
        .then(res => {
          const { data: { data } } = res
          data.forEach(v => {
            if (v.lang === 'cn') {
              switch (v.topic) {
                case 'VERIFY':
                  this.$set(this.smsTplInfo, 'verifiyCode', v.content)
                  break
                case 'MONITOR':
                  this.$set(this.smsTplInfo, 'alertsCode', v.content)
                  break
                case 'USER_LOGIN_EXCEPTION':
                  this.$set(this.smsTplInfo, 'errorCode', v.content)
                  break
              }
            }
            if (v.lang === 'en') {
              switch (v.topic) {
                case 'VERIFY':
                  this.$set(this.smsTplInfo, 'verifiyCodeUn', v.content)
                  break
                case 'MONITOR':
                  this.$set(this.smsTplInfo, 'alertsCodeUn', v.content)
                  break
                case 'USER_LOGIN_EXCEPTION':
                  this.$set(this.smsTplInfo, 'errorCodeUn', v.content)
                  break
              }
            }
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
  },
}
</script>
