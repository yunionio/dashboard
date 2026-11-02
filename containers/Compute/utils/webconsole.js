import i18n from '@/locales'
import store from '@/store'

export function solWebConsole (manager, host, onData, createDialog) {
  var hostId = host.host_id // if it is a baremetal server
  if (!hostId) {
    hostId = host.id
  }
  return {
    label: i18n.t('compute.text_342'),
    permission: 'hosts_get_ipmi',
    action: () => {
      const success = () => {
        manager.objectRpc({
          methodname: 'DoBaremetalConnect',
          objId: hostId,
        }).then(({ data }) => {
          onData(host, { ...data, extra_param_str: `&instance_name=SOL ${host.name}&ips=${host.ips}` })
        })
      }
      if (store.getters.userInfo.enable_mfa && store.state.auth.auth.system_totp_on && createDialog) {
        createDialog('SecretVertifyDialog', {
          success,
        })
      } else {
        success()
      }
    },
    meta: () => {
      const ret = {
        validate: host.status === 'running',
      }
      return ret
    },
  }
}

// 获取 server 的 ssh 端口（接口返回 { port: 0 } 表示未配置），RDP 复用该端口
export async function getServerSshPort (manager, id, fallback) {
  if (!manager || !id) return fallback
  try {
    const { data } = await manager.getSpecific({ id, spec: 'sshport' })
    const port = Number(data?.port)
    if (port > 0 && port <= 65535) {
      return port
    }
  } catch (e) {
    // 接口不可用时忽略，使用默认端口
  }
  return fallback
}

export function jnlpConsole (manager, host, createDialog) {
  return {
    label: i18n.t('compute.text_351'),
    action: () => {
      const success = () => {
        manager.getSpecific({
          id: host.id,
          spec: 'jnlp',
        }).then(res => {
          const blob = new Blob([res.data.jnlp], { type: 'application/x-java-jnlp-file' })
          const url = window.URL.createObjectURL(blob)
          const fileName = `${host.name}.jnlp`
          const linkDom = document.createElement('a')
          linkDom.href = url
          linkDom.setAttribute('download', fileName)
          document.body.appendChild(linkDom)
          linkDom.click()
          document.body.removeChild(linkDom)
          window.URL.revokeObjectURL(url)
        })
      }
      if (store.getters.userInfo.enable_mfa && store.state.auth.auth.system_totp_on && createDialog) {
        createDialog('SecretVertifyDialog', {
          success,
        })
      } else {
        success()
      }
    },
  }
}
