<template>
  <div>
    <page-header :title="$t('dictionary.mount_target')" />
    <page-body>
      <mount-target-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import MountTargetList from './components/List'

export default {
  name: 'MountTarget',
  components: {
    MountTargetList,
  },
  data () {
    return {
      listId: 'MountTargetList',
    }
  },
}
</script>
