<template>
  <div>
    <page-header :title="$t('cloudenv.text_580')" />
    <div class="mini-title mb-2 mt-2">
      {{$t('cloudenv.text_581')}}
    </div>
    <page-body>
      <resource-owner-manage-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ResourceOwnerManageList from './components/List'

export default {
  name: 'ResourceOwnerManageIndex',
  components: {
    ResourceOwnerManageList,
  },
  data () {
    return {
      listId: 'ProxysettingList',
    }
  },
}
</script>
