import { getNote } from '../utils/index'

export default {
  methods: {
    async verifyConcact (item, data) {
      if (item.verified) return false
      if (['dingtalk', 'feishu', 'workwx'].includes(item.contact_type)) {
        try {
          const res = await new this.$Manager('receivers', 'v1').performAction({
            id: data.id,
            action: 'trigger-verify',
            data: {
              contact_type: item.contact_type,
            },
          })
          const verified_infos = res.data.verified_infos || []
          const verified_info = verified_infos.find(v => v.contact_type === item.contact_type)
          if (!verified_info.verified) {
            const note = getNote(verified_info.note)
            this.$message.error(note)
          }
          // this.refresh()
          this.$bus.$emit('ContactListSingleRefresh', data.id)
        } catch (error) {
          throw error
        }
      }
    },
  },
}
