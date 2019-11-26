<template>
  <component :is="component" :type="type" />
</template>

<script>
import IDC from './form/IDC'
import Public from './form/Public'

export default {
  name: 'ServerCreate',
  components: {
    IDC,
    Public,
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
