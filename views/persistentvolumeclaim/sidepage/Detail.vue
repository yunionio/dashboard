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
import { k8sStatusColumn, k8sLabelColumn } from '@K8S/utils/tableColumns'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'K8sPersistentvolumeclaimDetail',
  mixins: [WindowsMixin],
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
        {
          field: 'mountedBy',
          title: this.$t('k8s.text_314'),
          slots: {
            default: ({ row }) => {
              const handleOpenSidepage = (name) => {
                this.sidePageTriggerHandle(this, 'K8SPodSidePage', {
                  id: name,
                  resource: 'pods',
                  getParams: () => {
                    const params = {
                      scope: this.$store.getters.scope,
                      details: true,
                      cluster: row.cluster,
                      namespace: row.namespace,
                    }
                    return params
                  },
                  apiVersion: 'v1',
                  steadyStatus: {
                    status: Object.values(expectStatus.k8s_resource).flat(),
                  },
                }, {
                  list: this.list,
                })
              }
              if (!row.mountedBy || !row.mountedBy.length) return '-'
              return row.mountedBy.map(val => {
                return (<side-page-trigger onTrigger={() => handleOpenSidepage(val)}>{ val }</side-page-trigger>)
              })
            },
          },
        },
        k8sStatusColumn(),
        {
          field: 'cluster',
          title: this.$t('k8s.text_19'),
        },
        {
          field: 'namespace',
          title: this.$t('k8s.text_23'),
        },

        {
          field: 'accessModes',
          title: this.$t('k8s.text_313'),
          formatter: ({ row }) => row.accessModes && (row.accessModes || []).join('，'),
        },
        {
          field: 'volume',
          title: this.$t('k8s.text_311'),
        },
        {
          field: 'storageClass',
          title: this.$t('k8s.text_22'),
        },
        {
          field: 'capacity.storage',
          title: this.$t('k8s.text_312'),
          width: 70,
          formatter: ({ row }) => {
            return row.capacity ? (row.capacity.storage || '0Gi') : '-'
          },
        },
        {
          field: 'unused',
          title: this.$t('k8s.text_301'),
          slots: {
            default: ({ row }, h) => {
              let text = this.$t('k8s.text_303')
              let className = 'success-color'
              if (row.mountedBy && row.mountedBy.length > 0) {
                text = this.$t('k8s.text_302')
                className = 'error-color'
              }
              return [<div class={className}>{text}</div>]
            },
          },
        },
        {
          field: 'creationTimestamp',
          title: this.$t('k8s.text_74'),
          formatter: ({ row }) => {
            return (row.creationTimestamp && this.$moment(row.creationTimestamp).format()) || '-'
          },
        },
        k8sLabelColumn({ field: 'annotations', title: this.$t('k8s.text_142') }),
      ],
    }
  },
}
</script>
