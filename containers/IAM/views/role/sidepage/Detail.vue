<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :isEditName="false" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'RoleDetail',
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
        // {
        //   field: 'match_policies',
        //   title: this.$t('system.text_559'),
        //   slots: {
        //     default: ({ row }) => {
        //       const matchPolicies = row.match_policies || []
        //       if (matchPolicies.length <= 0) {
        //         return '-'
        //       }
        //       return matchPolicies.map((item, idx) => {
        //         return [
        //           <list-body-cell-wrap copy field={item} row={row} hideField message={item}>
        //             <side-page-trigger
        //               permission='policies_get'
        //               name='PolicySidePage'
        //               id={item}
        //               vm={this}>{ item }</side-page-trigger>
        //           </list-body-cell-wrap>,
        //         ]
        //       })
        //     },
        //   },
        // },
        {
          field: 'match_policies',
          title: this.$t('system.text_11'),
          slots: {
            default: ({ row }) => {
              return (
                <a onClick={ () => this.$emit('tab-change', 'policies-list-for-role-sidepage') }>{ (row.match_policies && row.match_policies.length) || 0 }</a>
              )
            },
          },
        },
        {
          field: 'user_count',
          title: this.$t('system.text_11'),
          formatter: ({ cellValue }) => `${cellValue}`,
        },
        {
          field: 'group_count',
          title: this.$t('system.role.groups'),
          formatter: ({ cellValue }) => `${cellValue}`,
        },
        {
          field: 'project_count',
          title: this.$t('system.role.projects'),
          formatter: ({ cellValue }) => `${cellValue}`,
        },
        getPublicScopeTableColumn({ vm: this, resource: 'roles' }),
      ],
    }
  },
}
</script>
