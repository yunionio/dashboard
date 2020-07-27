<template>
  <div>
    <page-header :title="$t('cloudenv.text_21')" />
    <page-body>
      <policydefinition-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import PolicydefinitionList from './components/List'

export default {
  name: 'Policydefinition',
  components: {
    PolicydefinitionList,
  },
  data () {
    return {
      listId: 'PolicydefinitionList',
    }
  },
}
</script>
