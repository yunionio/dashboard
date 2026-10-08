<template>
  <detail
    :showDesc="false"
    :showName="false"
    :hiddenKeys="['project_domain', 'tenant', 'created_at', 'updated_at']"
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import { k8sStatusColumn } from '@K8S/utils/tableColumns'

export default {
  name: 'K8SVCJobDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    onOpen: {
      type: Function,
      default: () => {},
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'name',
          title: this.$t('k8s.text_41'),
          slots: {
            default: ({ row }) => {
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy row={ this.data } onManager={ this.onManager } field='name' title={ row.name } />
                </div>,
              ]
            },
          },
        },
        k8sStatusColumn({ statusModule: 'k8s_resource_vcjob' }),
        {
          field: 'cluster',
          title: this.$t('k8s.text_19'),
        },
        {
          field: 'namespace',
          title: this.$t('k8s.text_23'),
        },
        this.relatedField({
          field: 'queue',
          title: this.$t('k8s.vc_queue_field'),
          sidePage: 'K8SVCQueueSidePage',
          resource: 'vcqueues',
        }),
        this.relatedField({
          field: 'podGroupName',
          title: this.$t('k8s.vc_podgroup'),
          sidePage: 'K8SVCPodGroupSidePage',
          resource: 'vcpodgroups',
          withNamespace: true,
        }),
        {
          field: 'minAvailable',
          title: this.$t('k8s.vc_min_available'),
        },
        {
          field: 'priorityClassName',
          title: this.$t('k8s.vc_priority_class'),
          formatter: ({ row }) => row.priorityClassName || '-',
        },
        {
          field: 'networkTopologyMode',
          title: this.$t('k8s.vc_network_topology'),
          formatter: ({ row }) => {
            if (!row.networkTopologyMode) return '-'
            return `${row.networkTopologyMode} / ${row.highestTierAllowed}`
          },
        },
        {
          field: 'running',
          title: this.$t('k8s.vc_running'),
        },
        {
          field: 'pending',
          title: this.$t('k8s.vc_pending'),
        },
        {
          field: 'creationTimestamp',
          title: this.$t('k8s.text_74'),
          formatter: ({ row }) => {
            return (row.creationTimestamp && this.$moment(row.creationTimestamp).format()) || '-'
          },
        },
      ],
    }
  },
  methods: {
    relatedField ({ field, title, sidePage, resource, withNamespace }) {
      return {
        field,
        title,
        slots: {
          default: ({ row }) => {
            const value = row[field]
            if (!value) return '-'
            return [
              <side-page-trigger onTrigger={() => this.onOpen({
                sidePage,
                resource,
                name: value,
                namespace: withNamespace ? row.namespace : undefined,
              })}>{ value }</side-page-trigger>,
            ]
          },
        },
      }
    },
  },
}
</script>
