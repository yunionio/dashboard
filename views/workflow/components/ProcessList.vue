<template>
  <div>
    <a-steps :current="current" labelPlacement="vertical">
      <a-step
        v-for="(p, index) in newProcessList"
        :key="index"
        :title="p.title">
        <template slot="description">
          <a-popover>
            <template slot="content">
              <span>{{ p.assignees }}</span>
            </template>
            <span>{{ p.shortAssigness }}</span>
          </a-popover>
        </template>
      </a-step>
    </a-steps>
  </div>
</template>

<script>
export default {
  name: 'ProcessList',
  props: {
    processList: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      current: -1,
    }
  },
  computed: {
    newProcessList () {
      return this.processList.map((item) => {
        const assigneesArr = Array.isArray(item.assignees) ? item.assignees : [item.assignees]
        const assignees = assigneesArr.join(',')
        return {
          title: item.title,
          assignees: assignees,
          shortAssigness: assignees.length > 26 ? `${assignees.substring(0, 26)}...` : assignees,
        }
      })
    },
  },
}
</script>
