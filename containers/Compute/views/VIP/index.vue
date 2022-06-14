<template>
  <div>
    <page-header :title="$t('dictionary.vip')" />
    <a-alert :message="$t('compute.instance_group_desc')" type="info" class="mt-2" />
    <page-body>
      <vip-List :id="listId" />
    </page-body>
  </div>
</template>

<script>
import vipList from './components/List'

export default {
  name: 'VIP',
  components: {
    vipList,
  },
  data () {
    return {
      listId: 'vipList',
    }
  },
}
</script>
