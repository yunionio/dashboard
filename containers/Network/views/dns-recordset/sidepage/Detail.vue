<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="dns_recordsets"
    :hiddenKeys="['tenant', 'project_domain', 'status']"
    :nameProps="{edit: false}" />
</template>

<script>
import {
  getDnsTypeTableColumns,
  getDnsValueTableColumns,
  getTtlTableColumns,
} from '../utils/columns'
import {
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
export default {
  name: 'DnsRecordSetDetail',
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
        getDnsTypeTableColumns(),
        getDnsValueTableColumns(),
        getTtlTableColumns(),
        getEnabledTableColumn(),
      ],
      extraInfo: [],
    }
  },
}
</script>
