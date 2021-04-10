<template>
  <div>
    <page-header :title="`${$t('dictionary.guestimage')}`" />
    <page-body>
      <host-image-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import HostImageList from './components/List'

export default {
  name: 'HostImageIndex',
  components: {
    HostImageList,
  },
  data () {
    return {
      listId: 'HostImageList',
    }
  },
}
</script>
