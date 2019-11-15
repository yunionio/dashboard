<template>
  <component :is="component" :type="type" />
</template>

<script>
import IDC from './form/IDC'

export default {
  name: 'ServerCreate',
  components: {
    IDC,
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
