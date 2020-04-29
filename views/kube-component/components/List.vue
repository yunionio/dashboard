<template>
  <div>
    <div class="mb-2">
      <span>集群&nbsp;</span>
      <cluster-select
        :clusterObj.sync="clusterObj"
        v-model="cluster"
        style="width: 140px;" />
    </div>
    <page-card-list
      v-if="responseData.length"
      :list="list"
      :showPageer="false"
      :isRefreshed="false"
      :card-fields="cardFields"
      :group-actions="groupActions"
      :single-actions="singleActions" />
    <a-alert v-else message="无可用服务组件" banner />
  </div>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'KubeComponentList',
  components: {
    ClusterSelect,
  },
  mixins: [WindowsMixin],
  props: {
    id: {
      type: String,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        idKey: 'name',
      }),
      cardFields: {
        url: {
          formatter: (data) => {
            return require(`../assets/images/${data.name.toLowerCase()}${data.name.toLowerCase() === 'cephcsi' ? '.svg' : '.png'}`)
          },
        },
        title: 'name',
        content: [{
          title: '状态',
          field: 'enabled',
          slots: (data) => {
            return (<div class='status'>
              <status status={ data['enabled'] } statusModule='enabled' />
            </div>)
          },
        }],
      },
      groupActions: [],
      singleActions: [
        {
          label: '新建',
          action: obj => {
            this.$router.push({
              path: '/k8s-kubecomponent/create',
              query: {
                kubeComponent: obj.name,
                cluster: this.cluster,
              },
            })
          },
          meta: (obj) => ({
            buttonType: 'primary',
            validate: !obj.created,
          }),
        },
        {
          label: '更新',
          action: obj => {
            this.$router.push({
              path: '/k8s-kubecomponent/update',
              query: {
                kubeComponent: obj.name,
                cluster: this.cluster,
              },
            })
          },
          meta: (obj) => ({
            validate: obj.created,
          }),
        },
        {
          label: '禁用',
          action: obj => {
            return new this.$Manager('kubeclusters', 'v1').performAction({
              id: this.cluster,
              action: 'disable-component',
              data: {
                type: obj.name,
              },
            }).then(() => {
              this.fetchData()
            }).catch(error => {
              throw error
            })
          },
          meta: (obj) => ({
            validate: obj.enabled && obj.created,
          }),
        },
        {
          label: '启用',
          action: obj => {
            return new this.$Manager('kubeclusters', 'v1').performAction({
              id: this.cluster,
              action: 'enable-component',
              data: {
                type: obj.name,
              },
            }).then(() => {
              this.fetchData()
            }).catch(error => {
              throw error
            })
          },
          meta: (obj) => ({
            validate: !obj.enabled && obj.created,
          }),
        },
        {
          label: '删除',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              title: '删除',
              name: 'cephCSI',
              idKey: 'name',
              ok: (ids, data) => {
                return new this.$Manager(`kubeclusters`, 'v1').performAction({
                  id: this.cluster,
                  action: 'delete-component',
                  data: {
                    type: obj.name,
                  },
                }).then(() => {
                  this.refresh()
                  return true
                }).catch(error => {
                  throw error
                })
              },
            })
          },
          meta: obj => ({
            validate: obj.created,
          }),
        },
      ],
      cluster: '',
      clusterObj: {},
      responseData: [],
    }
  },
  watch: {
    cluster () {
      this.fetchData()
    },
  },
  created () {
    this.manager = new this.$Manager('kubeclusters', 'v1')
  },
  methods: {
    async fetchData () {
      if (this.cluster) {
        const { data } = await this.manager.getSpecific({
          id: this.cluster,
          spec: 'components-status',
        })
        this.list.responseData = {
          data: [],
        }
        for (let key in data) {
          data[key]['name'] = key
          if (key === 'cephCSI') this.list.responseData.data.push(data[key])
          this.responseData = this.list.responseData.data
        }
        this.list.fetchData()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.status {
  width: 50px;
  display: inline-block;
  vertical-align: bottom;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
