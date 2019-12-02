<template>
  <component :is="component" :type="type" />
</template>

<script>
import IDC from './form/IDC'
import Public from './form/Public'
import Private from './form/Private'
export default {
  name: 'ServerCreate',
  components: {
    IDC,
    Public,
    Private,
  },
  computed: {
    type () {
      const { type = 'idc' } = this.$route.query
      switch (type) {
        case 'private':
          return 'private'
        case 'public':
          return 'public'
        default:
          return 'idc'
      }
    },
    component () {
      const { type = 'idc' } = this.$route.query
      switch (type) {
        case 'private':
          return 'Private'
        case 'public':
          return 'Public'
        default:
          return 'IDC'
      }
    },
  },
}
</script>
