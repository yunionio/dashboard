<template>
  <div>
    <page-header title="模版" />
    <page-body>
      <list :get-params="listParams" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'AnsibleTemplate',
  components: {
    List,
  },
  data () {
    return {
      listParams: {
        details: true,
        baremetal: false,
      },
    }
  },
}
</script>
