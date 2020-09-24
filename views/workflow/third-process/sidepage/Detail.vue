<template>
  <div>
    <detail
      :onManager="onManager"
      :data="data"
      :hiddenKeys="['updated_at', 'description']"
      :show-desc="false"
      :base-info="baseInfo"
      :extra-info="extraInfo" />
  </div>
</template>

<script>
import {
  getCommentTableColumn,
} from '../../utils/columns'
import {
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { getWorkflowType } from '@/constants/workflow'

export default {
  name: 'ThirdProcessDetail',
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
          field: 'domain',
          title: this.$t('common_437'),
          formatter: ({ cellValue, row }) => {
            return this.variables.resource_domain_name || '-'
          },
        },
        {
          field: 'project',
          title: this.$t('common_310'),
          formatter: ({ cellValue, row }) => {
            return this.variables.resource_project_name || '-'
          },
        },
        {
          field: 'status',
          title: this.$t('common.status'),
          formatter: ({ cellValue, row }) => {
            return this.data.status || '-'
          },
        },
        {
          field: 'initiator_name',
          title: this.$t('common_371'),
          formatter: ({ cellValue, row }) => {
            return this.data.start_user_name || '-'
          },
        },
        {
          field: 'process_definition_key',
          title: this.$t('common_375'),
          formatter: ({ cellValue, row }) => {
            const pdk = this.variables.process_definition_key || this.process_definition_key
            const objType = getWorkflowType(pdk)
            return (objType && objType.name) || '-'
          },
        },
        getCommentTableColumn(),
        getTimeTableColumn({ field: 'created_at', title: this.$t('common_374') }),
        getTimeTableColumn({ field: 'end_at', title: this.$t('common_387') }),
      ],
      extraInfo: [],
    }
  },
  computed: {
    variables () {
      return JSON.parse(this.data.variables || '{}')
    },
    proccessDefinitionKey () {
      return this.variables.process_definition_key
    },
    paramter () {
      if (this.variables.paramter) {
        return JSON.parse(this.variables.paramter || '{}')
      }
      return {}
    },
  },
}
</script>
