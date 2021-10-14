<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extraInfo="extraInfo"
    :hiddenKeys="['project_domain', 'tenant', 'status', 'updated_at']"
    :show-desc="false" />
</template>

<script>
import { contactMap } from '@/constants'
import {
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import {
  getMobileTableColumn,
  getEmailTableColumn,
} from '../utils/columns'
import { getNote } from '../utils/index'
import ColumnsMixin from '../mixins/columns'
import CommonMixin from '../mixins/common'

export default {
  name: 'ContactDetail',
  mixins: [CommonMixin, ColumnsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      contactMap: contactMap,
    }
  },
  computed: {
    contactTypes () {
      if (this.data && this.data.enabled_contact_types) {
        const contactTypes = []
        this.data.enabled_contact_types.forEach((type) => {
          const item = this.data.verified_infos.find(obj => obj.contact_type === type)
          contactTypes.push(item)
        })
        return contactTypes
      }
      return []
    },
    baseInfo () {
      return [
        getEnabledTableColumn(),
        getMobileTableColumn(),
        getEmailTableColumn(),
      ]
    },
    extraInfo () {
      return [
        {
          title: this.$t('system.notify_channels'),
          slots: {
            default: ({ row }, h) => {
              const items = this.contactTypes.map((obj) => {
                return (
                  <div key={obj.contact_type} class="col-12">
                    <div class="row">
                      <span style="width: 100px" class="mt-2 ml-4 mb-2">{contactMap[obj.contact_type].label}</span>
                      <span style={ { color: this.getColor(obj) } } class="mt-2 mb-2">
                        {this.getTitle(obj, obj.contact_type)}
                      </span>
                    </div>
                  </div>
                )
              })
              return (
                <div class="row"> { items } </div>
              )
            },
          },
        },
      ]
    },
  },
  methods: {
    getColor (obj) {
      if (!obj.verified) {
        if (obj.note) {
          return '#d9001b'
        } else {
          return '#F59A23'
        }
      } else {
        return '#70b603'
      }
    },
    handleVerify () {
      const r = this.$router.resolve('/user')
      window.open(r.href, '_blank')
    },
    getTitle (obj, type) {
      let msg = ''
      if (!obj.verified) {
        msg = getNote(obj.note)
      } else {
        msg = obj.verified ? this.$t('status.verified.true') : this.$t('status.verified.false')
      }

      return msg
    },
  },
}
</script>
