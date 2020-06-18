<template>
  <div>
    <page-header :title="$t('dictionary.commonalert')" />
    <page-body>
      <commonalert-list />
    </page-body>
  </div>
</template>

<script>
import CommonalertList from './components/List'

export default {
  name: 'Monitor',
  components: {
    CommonalertList,
  },
  data () {
    return {
      loading: false,
    }
  },
}
</script>
