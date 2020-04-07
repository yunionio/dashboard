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
          title: '名称',
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
          title: '所属容器组',
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
                  idKey: 'name',
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
          title: '集群',
        },
        {
          field: 'namespace',
          title: '命名空间',
        },

        {
          field: 'accessModes',
          title: '访问模式',
          formatter: ({ row }) => row.accessModes && row.accessModes.join('，'),
        },
        {
          field: 'volume',
          title: '存储卷',
        },
        {
          field: 'storageClass',
          title: '存储类',
        },
        {
          field: 'capacity.storage',
          title: '存储总量',
          width: 70,
          formatter: ({ row }) => {
            return row.capacity ? (row.capacity.storage || '0Gi') : '-'
          },
        },
        {
          field: 'unused',
          title: '使用情况',
          slots: {
            default: ({ row }, h) => {
              let text = '未被使用'
              let className = 'success-color'
              if (row.mountedBy && row.mountedBy.length > 0) {
                text = '被使用'
                className = 'error-color'
              }
              return [<div class={className}>{text}</div>]
            },
          },
        },
        {
          field: 'creationTimestamp',
          title: '创建时间',
          formatter: ({ row }) => {
            return (row.creationTimestamp && this.$moment(row.creationTimestamp).format()) || '-'
          },
        },
        k8sLabelColumn({ field: 'annotations', title: '注释' }),
      ],
    }
  },
}
</script>
