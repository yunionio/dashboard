export default {
  props: {
    value: {},
  },
  inject: ['scopeParams', 'formFd'],
  methods: {
    change (...ret) {
      this.$emit('change', ...ret)
    },
  },
}
