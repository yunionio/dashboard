<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common_322')}}</div>
    <div slot="body">
      <page-list
        :list="list"
        :columns="columns" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudpoliciesListForClouduserForUserDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'CloudpoliciesListForClouduserForUserDialog',
        resource: 'cloudpolicies',
        apiVersion: 'v1',
        getParams: {
          cloudgroup_id: this.params.data[0].cloudgroup_id,
        },
      }),
      columns: [
        {
          field: 'name',
          title: this.$t('table.title.name'),
        },
        {
          field: 'description',
          title: this.$t('table.title.desc'),
          minWidth: 200,
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
