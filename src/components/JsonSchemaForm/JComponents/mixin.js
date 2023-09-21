export default {
  props: {
    value: {},
  },
  inject: ['scopeParams', 'formFd', 'extendFd'],
  methods: {
    change (...ret) {
      this.$emit('change', ...ret)
    },
  },
}
