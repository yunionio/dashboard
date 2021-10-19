import _ from 'lodash'
import i18n from '@/locales'

export default {
  methods: {
    async addQuotaHandle (row, action) {
      this.quotaData[action].isUpdate = true
      this.quotaData[action].isAdd = true
      this.quotaData[action].isKeyRepeat = true
      const quotaHandle = {
        project: async () => {
          const record = {
            secgroup: 50,
            isNew: true,
            action: 'project',
          }
          const { row: newRow } = await this.$refs.xProjectQuotaTable.insertAt(record, row)
          await this.$refs.xProjectQuotaTable.setActiveCell(newRow, 'secgroup')
        },
        image: async () => {
          const record = {
            image: 50,
            isNew: true,
            action: 'image',
          }
          const { row: newRow } = await this.$refs.xImageQuotaTable.insertAt(record, row)
          await this.$refs.xImageQuotaTable.setActiveRow(newRow)
        },
        region: async () => {
          const record = {
            port: 200,
            eport: 200,
            eip: 100,
            snapshot: 100,
            instance_snapshot: 100,
            bucket: 50,
            object_cnt: 10000,
            object_gb: 10240,
            rds: 50,
            cache: 50,
            loadbalancer: 50,
            isNew: true,
            action: 'region',
          }
          const { row: newRow } = await this.$refs.xRegionQuotaTable.insertAt(record, row)
          await this.$refs.xRegionQuotaTable.setActiveRow(newRow)
        },
        host: async () => {
          const record = {
            cpu: 500,
            count: 200,
            memory: 1024,
            storage: 1024,
            isolated_device: 50,
            isNew: true,
            action: 'host',
          }
          const { row: newRow } = await this.$refs.xHostQuotaTable.insertAt(record, row)
          await this.$refs.xHostQuotaTable.setActiveRow(newRow)
        },
        domain: async () => {
          const record = {
            cloudaccount: 20,
            globalvpc: 10,
            dns_zone: 10,
            isNew: true,
            action: 'domain',
          }
          const { row: newRow } = await this.$refs.xDomainQuotaTable.insertAt(record, row)
          await this.$refs.xDomainQuotaTable.setActiveRow(newRow)
        },
        identity: async () => {
          const record = {
            group: 500,
            policy: 100,
            project: 100,
            role: 100,
            user: 500,
            isNew: true,
            action: 'identity',
          }
          const { row: newRow } = await this.$refs.xIdentityQuotaTable.insertAt(record, row)
          await this.$refs.xIdentityQuotaTable.setActiveRow(newRow)
        },
        infras: async () => {
          const record = {
            host: 500,
            vpc: 500,
            isNew: true,
            action: 'infras',
          }
          const { row: newRow } = await this.$refs.xInfrasQuotaTable.insertAt(record, row)
          await this.$refs.xInfrasQuotaTable.setActiveRow(newRow)
        },
      }
      quotaHandle[action]()
    },
    editQuotaTableRowEvent (row, action) {
      this.quotaData[action].isUpdate = true
      const table = `x${_.capitalize(action)}QuotaTable`
      const xTable = this.$refs[table]
      if (xTable.getActiveRecord()) {
        this.$message.warn(i18n.t('system.text_72'))
        return
      }
      const quotaHandle = {
        project: () => {
          row.action = 'project'
        },
        image: async () => {
          row.action = 'image'
        },
        region: async () => {
          row.action = 'region'
          row.account = row.account_id
          row.manager = row.manager_id
          row.region = row.region_id
          this.backfillRowFeildsOptions(row)
        },
        host: () => {
          row.action = 'host'
          row.account = row.account_id
          row.manager = row.manager_id
          row.region = row.region_id
          row.zone = row.zone_id
          row.memory = row.memory / 1024
          row.storage = row.storage / 1024
          this.backfillRowFeildsOptions(row)
        },
        domain: () => {
          row.action = 'domain'
        },
        identity: () => {
          row.action = 'identity'
        },
        infras: () => {
          row.action = 'infras'
        },
      }
      quotaHandle[action]()
      xTable.setActiveRow(row)
    },
    saveQuotaTableRowEvent (row, action) {
      this.quotaData[action].isAdd = false
      const quotaHandle = {
        project: async () => {
          await this.$refs.xProjectQuotaTable.clearActived()
          const params = {
            secgroup: row.secgroup,
            action: 'replace',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchProjectQuota()
          }
        },
        image: async () => {
          await this.$refs.xImageQuotaTable.clearActived()
          const params = {
            image: row.image,
            type: row.type,
            action: 'replace',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchImageQuota()
          }
        },
        region: async () => {
          await this.$refs.xRegionQuotaTable.clearActived()
          const params = {
            cloud_env: row.cloud_env,
            brand: row.brand,
            account_id: row.account,
            manager_id: row.manager,
            region_id: row.region,
            port: row.port,
            eport: row.eport,
            eip: row.eip,
            snapshot: row.snapshot,
            instance_snapshot: row.instance_snapshot,
            bucket: row.bucket,
            object_cnt: row.object_cnt,
            object_gb: row.object_gb,
            rds: row.rds,
            cache: row.cache,
            loadbalancer: row.loadbalancer,
            action: 'replace',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchRegionQuota()
          }
        },
        host: async () => {
          await this.$refs.xHostQuotaTable.clearActived()
          const params = {
            cloud_env: row.cloud_env,
            brand: row.brand,
            account_id: row.account,
            manager_id: row.manager,
            region_id: row.region,
            zone_id: row.zone,
            hypervisor: row.hypervisor,
            count: row.count,
            cpu: row.cpu,
            memory: row.memory * 1024,
            storage: row.storage * 1024,
            isolated_device: row.isolated_device,
            action: 'replace',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchHostQuota()
          }
        },
        domain: async () => {
          await this.$refs.xDomainQuotaTable.clearActived()
          const params = {
            cloudaccount: row.cloudaccount,
            globalvpc: row.globalvpc,
            dns_zone: row.dns_zone,
            action: 'replace',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchDomainQuota()
          }
        },
        identity: async () => {
          await this.$refs.xIdentityQuotaTable.clearActived()
          const params = {
            group: row.group,
            policy: row.policy,
            project: row.project,
            role: row.role,
            user: row.user,
            action: 'replace',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchIdentityQuota()
          }
        },
        infras: async () => {
          await this.$refs.xInfrasQuotaTable.clearActived()
          const params = {
            cloud_env: row.cloud_env,
            brand: row.brand,
            account_id: row.account,
            manager_id: row.manager,
            region_id: row.region,
            zone_id: row.zone,
            hypervisor: row.hypervisor,
            host: row.host,
            vpc: row.vpc,
            action: 'replace',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchInfrasQuota()
          }
        },
      }
      quotaHandle[action]()
    },
    deleteQuotaTableRowEvent (row, action) {
      const quotaHandle = {
        project: async () => {
          await this.$refs.xProjectQuotaTable.clearActived()
          const params = {
            secgroup: row.secgroup,
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchProjectQuota()
          }
        },
        image: async () => {
          const params = {
            image: row.image,
            type: row.type,
            action: 'delete',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchImageQuota()
          }
        },
        region: async () => {
          const params = {
            cloud_env: row.cloud_env,
            brand: row.brand,
            account_id: row.account_id,
            manager_id: row.manager_id,
            region_id: row.region_id,
            port: row.port,
            eport: row.eport,
            eip: row.eip,
            snapshot: row.snapshot,
            instance_snapshot: row.instance_snapshot,
            bucket: row.bucket,
            object_cnt: row.object_cnt,
            object_gb: row.object_gb,
            rds: row.rds,
            cache: row.cache,
            loadbalancer: row.loadbalancer,
            action: 'delete',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchRegionQuota()
          }
        },
        host: async () => {
          const params = {
            cloud_env: row.cloud_env,
            brand: row.brand,
            account_id: row.account_id,
            manager_id: row.manager_id,
            region_id: row.region_id,
            zone_id: row.zone_id,
            hypervisor: row.hypervisor,
            count: row.count,
            cpu: row.cpu,
            memory: row.memory * 1024,
            storage: row.storage * 1024,
            isolated_device: row.isolated_device,
            action: 'delete',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchHostQuota()
          }
        },
        domain: async () => {
          await this.$refs.xDomainQuotaTable.clearActived()
          const params = {
            cloudaccount: row.cloudaccount,
            globalvpc: row.globalvpc,
            dns_zone: row.dns_zone,
            action: 'delete',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchDomainQuota()
          }
        },
        identity: async () => {
          await this.$refs.xIdentityQuotaTable.clearActived()
          const params = {
            group: row.group,
            policy: row.policy,
            project: row.project,
            role: row.role,
            user: row.user,
            action: 'delete',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchIdentityQuota()
          }
        },
        infras: async () => {
          const params = {
            cloud_env: row.cloud_env,
            brand: row.brand,
            account_id: row.account_id,
            manager_id: row.manager_id,
            region_id: row.region_id,
            zone_id: row.zone_id,
            hypervisor: row.hypervisor,
            host: row.host,
            vpc: row.vpc,
            action: 'delete',
          }
          try {
            await this.doQuotaUpdate(params, action)
          } catch (error) {
            throw error
          } finally {
            this.fetchInfrasQuota()
          }
        },
      }
      this.createDialog('CommonDialog', {
        header: this.$t('system.text_580'),
        width: 420,
        body: () => {
          return this.$t('system.text_581')
        },
        ok () {
          return quotaHandle[action]()
        },
      })
    },
    cancleQuotaTableRowEvent (row, action) {
      this.quotaData[action].isAdd = false
      const quotaHandle = {
        project: async () => {
          const xTable = this.$refs.xProjectQuotaTable
          await xTable.clearActived()
          await xTable.revertData(row)
        },
        image: async () => {
          const xTable = this.$refs.xImageQuotaTable
          await xTable.clearActived()
          await xTable.revertData(row)
        },
        region: async () => {
          const xTable = this.$refs.xRegionQuotaTable
          await xTable.clearActived()
          await xTable.revertData(row)
        },
        host: async () => {
          const xTable = this.$refs.xHostQuotaTable
          await xTable.clearActived()
          await xTable.revertData(row)
        },
        domain: async () => {
          const xTable = this.$refs.xDomainQuotaTable
          await xTable.clearActived()
          await xTable.revertData(row)
        },
        identity: async () => {
          const xTable = this.$refs.xIdentityQuotaTable
          await xTable.clearActived()
          await xTable.revertData(row)
        },
        infras: async () => {
          const xTable = this.$refs.xInfrasQuotaTable
          await xTable.clearActived()
          await xTable.revertData(row)
        },
      }
      quotaHandle[action]()
    },
    editClosedEvent (action) {
      this.quotaData[action].isUpdate = false
      const quotaHandle = {
        project: async () => {
          await this.fetchProjectQuota()
        },
        image: async () => {
          await this.fetchImageQuota()
        },
        region: async () => {
          await this.fetchRegionQuota()
        },
        host: async () => {
          await this.fetchHostQuota()
        },
        domain: async () => {
          await this.fetchDomainQuota()
        },
        identity: async () => {
          await this.fetchIdentityQuota()
        },
        infras: async () => {
          await this.fetchInfrasQuota()
        },
      }
      quotaHandle[action]()
    },
    editActivedEvent ({ row }) {
      const quotaHandle = {
        image: () => {
          const xTable = this.$refs.xImageQuotaTable
          const columFields = ['type']
          columFields.forEach((filed) => {
            const column = xTable.getColumnByField(filed)
            column.editRender.attrs.disabled = !row.isNew
          })
        },
        region: () => {
          const xTable = this.$refs.xRegionQuotaTable
          const columFields = ['cloud_env', 'brand', 'account', 'manager', 'region']
          columFields.forEach((filed) => {
            const column = xTable.getColumnByField(filed)
            column.editRender.attrs.disabled = !row.isNew
          })
        },
        host: () => {
          const xTable = this.$refs.xHostQuotaTable
          const columFields = ['cloud_env', 'brand', 'account', 'manager', 'region', 'zone', 'hypervisor']
          columFields.forEach((filed) => {
            const column = xTable.getColumnByField(filed)
            column.editRender.attrs.disabled = !row.isNew
          })
        },
        infras: () => {
          const xTable = this.$refs.xInfrasQuotaTable
          const columFields = ['cloud_env', 'brand', 'account', 'manager', 'region']
          columFields.forEach((filed) => {
            const column = xTable.getColumnByField(filed)
            column.editRender.attrs.disabled = !row.isNew
          })
        },
      }
      quotaHandle[row.action]()
    },
  },
}
