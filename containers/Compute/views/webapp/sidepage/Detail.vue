<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    status-module="webapp"
    resource="webapps" />
</template>

<script>
import {
  getTypeTableColumn,
  getKindTableColumn,
  getTechStackTableColumn,
} from '../utils/columns'
import {
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'WebAppDetail',
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
        getBrandTableColumn(),
        getTypeTableColumn(),
        getKindTableColumn(),
        getTechStackTableColumn(),
      ],
    }
  },
  methods: {
  },
}
</script>
