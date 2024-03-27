export default {
  methods: {
    async samlLogin (row) {
      let manager = new this.$Manager('cloudgroups')
      const hiddenLoadingMessage = this.$message.loading(this.$t('smal_login_message.loading'), 0)
      try {
        const response = await manager.getSpecific({
          id: row.cloudgroup_id,
          spec: 'saml',
        })
        if (response.data.init_login_url) {
          window.open(response.data.init_login_url, '_blank')
        } else {
          this.$message.error(this.$t('smal_login_message.no_login_url'))
        }
      } catch (error) {
        this.$message.error(this.$t('smal_login_message.fail'))
        throw error
      } finally {
        hiddenLoadingMessage()
        manager = null
      }
    },
  },
}
