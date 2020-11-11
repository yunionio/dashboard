<template>
  <vxe-grid :data="responseData.data || []" :columns="columns" resizable />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { getStatusTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'VmReleaseAnsibleplaybookSidepage',
  mixins: [WindowsMixin],
  props: {
    responseData: {
      type: Object,
      default: () => ({ data: [] }),
    },
  },
  data () {
    return {
      columns: [
        {
          field: 'name',
          title: this.$t('helm.text_16'),
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              const text = row.name || '-'
              return [
                <list-body-cell-wrap copy hideField={true} field='name' row={row} message={text}>
                  <side-page-trigger name='K8sAnsibleplaybookSidePage' id='test' vm={this} options={{ output: row.externalInfo.output }}>{text}</side-page-trigger>
                </list-body-cell-wrap>,
              ]
            },
          },
        },
        getStatusTableColumn({ statusModule: 'vmReleaseAnsibleplaybook', sortable: false }),
        // {
        //   field: 'vcpuCount',
        //   title: 'CPU',
        //   formatter: ({ row }) => `${row.vcpuCount} 核`,
        // },
        // {
        //   field: 'vmemSizeGB',
        //   title: '内存',
        //   formatter: ({ row }) => `${row.vmemSizeGB} GB`,
        // },
      ],
    }
  },
}
</script>
