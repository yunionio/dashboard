<template>
  <div>
    <page-header title="主机模版" />
    <page-body>
      <servertemplate-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ServertemplateList from './components/List'

export default {
  name: 'ServertemplateIndex',
  components: {
    ServertemplateList,
  },
  data () {
    return {
      listId: 'ServertemplateList',
    }
  },
  methods: {
    createServer () {
      this.$router.push('/vminstance/create')
    },
  },
}
</script>
