<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import {
  getStatusFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
  getAccountFilter,
  getProjectFilter,
  getCloudProviderFilter,
} from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'SslCertificateList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    const filterOptions = {
      id: {
        label: this.$t('table.title.id'),
      },
      name: {
        label: this.$t('network.text_21'),
        filter: true,
        formatter: val => {
          return `name.contains("${val}")`
        },
      },
      description: getDescriptionFilter(),
      status: getStatusFilter('sslCertificate'),
      issuer: {
        label: this.$t('network.ssl_certificate.issuer'),
        dropdown: true,
        items: [
          {
            label: "Let's Encrypt",
            key: "Let's Encrypt",
          },
          {
            label: 'ZeroSSL',
            key: 'ZeroSSL',
          },
        ],
        filter: true,
        formatter: val => {
          const list = val.map(item => `"${item}"`).join(',')
          return `issuer.in(${list})`
        },
      },
      sans: {
        label: this.$t('network.ssl_certificate.sans'),
        filter: true,
        formatter: val => {
          return `sans.contains("${val}")`
        },
      },
      account: getAccountFilter(),
      project: getProjectFilter(),
      manager: getCloudProviderFilter(),
      created_at: getCreatedAtFilter(),
    }
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'sslcertificates',
        getParams: this.getParam,
        filterOptions,
        responseData: this.responseData,
        steadyStatus: {
          status: Object.values(expectStatus.sslCertificate).flat(),
        },
      }),
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'sslcertificates_create',
          action: () => {
            this.createDialog('SslCertificateCreateDialog', {
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('network.ssl_certificate'),
        items: this.columns,
      }
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'SslCertificateSidePage', {
        id: row.id,
        resource: 'sslcertificates',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
