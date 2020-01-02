<template>
  <div>
    <page-header title="模板" />
    <page-body>
      <list :get-params="listParams" :id="listId" />
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
      listId: 'AnsibleTemplateList',
      listParams: {
        details: true,
        baremetal: false,
      },
    }
  },
}
</script>
