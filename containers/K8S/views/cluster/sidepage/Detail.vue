<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :extra-info="extraInfo"
    :base-info="baseInfo"
    :name-rules="[{ required: true, message: $t('compute.text_210') }]"
    :columns="serverColumns"
    auto-hidden-columns-key="server_hidden_columns"
    status-module="server"
    resource="servers" />
</template>

<script>
import 'codemirror/theme/material.css'
import WindowsMixin from '@/mixins/windows'
import {
  getUserTagColumn,
} from '@/utils/common/detailColumn'
import {
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import {
  getK8sClusterProviderColumn,
  getK8sClusterDistribution,
  getK8sClusterModeColumn,
  getK8sClusterResourceType,
} from '../utils/columns'

export default {
  name: 'KubeClusterDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    serverColumns: Array,
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'project_domain',
          hiddenField: 'tenant',
          title: this.$t('dictionary.domain'),
          formatter: ({ row }) => {
            if (!row.domain_id) return '-'
            return <side-page-trigger permission="domains_get" name="DomainSidePage" id={row.domain_id} vm={this}>{ row.project_domain }</side-page-trigger>
          },
        },
        getUserTagColumn({
          onManager: this.onManager,
          resource: 'server',
          columns: () => this.serverColumns,
          tipName: this.$t('dictionary.server'),
          editCheck: (row) => row.hypervisor !== 'bingocloud',
        }),
        getK8sClusterProviderColumn(),
        getK8sClusterDistribution(),
        getK8sClusterModeColumn(),
        getK8sClusterResourceType(),
        {
          field: 'machines',
          title: this.$t('k8s.text_191'),
        },
      ],
    }
  },
  computed: {
    extraInfo () {
      return [
        {
          title: this.$t('compute.text_368'),
          items: [
            getCopyWithContentTableColumn({
              title: 'api_server',
              field: 'api_server',
            }),
            getCopyWithContentTableColumn({
              title: 'pod_cidr',
              field: 'pod_cidr',
            }),
            getCopyWithContentTableColumn({
              title: 'service_cidr',
              field: 'service_cidr',
            }),
          ],
        },
      ]
    },
  },
  watch: {
  },
  created () {
  },
  methods: {
  },
}
</script>
