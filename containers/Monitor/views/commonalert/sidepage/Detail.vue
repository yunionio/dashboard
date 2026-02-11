<template>
  <detail
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :on-manager="onManager"
    :hiddenKeys="hiddenKeys"
    :nameRules="nameRules"
    status-module="commonalert"
    :resource="resource" />
</template>

<script>
import { getEnabledTableColumn, getProjectTableColumn } from '@/utils/common/tableColumn'
import {
  levelColumn,
  strategyColumn,
  projectTableColumn,
  recipientsColumn,
  getResTypeColumn,
  getVerifiedContactTypesTableColumn,
  robotsColumn,
  rolesColumn,
  reasonColumn,
} from '../utils'

export default {
  name: 'CommonalertDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    resource: String,
  },
  data () {
    return {
      baseInfo: [
        getResTypeColumn(),
        projectTableColumn(),
        getEnabledTableColumn(),
        levelColumn(),
        getProjectTableColumn(),
        getVerifiedContactTypesTableColumn({ vm: this }),
      ],
      extraInfo: [
        {
          title: this.$t('monitor.commonalert.alarm_strategy'),
          items: [
            strategyColumn(),
            reasonColumn(),
          ],
        },
      ],
      hiddenKeys: ['project_domain', 'tenant'],
      nameRules: [{ required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` }],
    }
  },
  created () {
    this.getRobots()
    this.getRecipients()
    this.getRoles()
  },
  methods: {
    async getRecipients () {
      try {
        const { data: { data: recipientList } } = await new this.$Manager('receivers', 'v1')
          .list({
            params: {
              scope: this.$store.getters.scope,
              with_meta: true,
              limit: 0,
              project_domain_filter: true,
            },
          })
        this.baseInfo.push(recipientsColumn(recipientList))
      } catch (error) {
        console.error(error)
        return []
      }
    },
    async getRobots () {
      try {
        const { data: { data: robotList } } = await new this.$Manager('robots', 'v1')
          .list({
            params: {
              scope: this.$store.getters.scope,
              with_meta: true,
              limit: 0,
            },
          })
        this.baseInfo.push(robotsColumn(robotList))
      } catch (error) {
        console.error(error)
        return []
      }
    },
    async getRoles () {
      try {
        const { data: { data: roleList } } = await new this.$Manager('roles', 'v1')
          .list({
            params: {
              scope: this.$store.getters.scope,
              limit: 0,
            },
          })
        this.baseInfo.push(rolesColumn(roleList))
      } catch (error) {
        console.error(error)
        return []
      }
    },
  },
}
</script>
