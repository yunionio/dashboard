import i18n from '@/locales'

export function solWebConsole (manager, host, onData) {
  var hostId = host.host_id // if it is a baremetal server
  if (!hostId) {
    hostId = host.id
  }
  return {
    label: i18n.t('compute.text_342'),
    permission: 'hosts_get_ipmi',
    action: () => {
      manager.objectRpc({
        methodname: 'DoBaremetalConnect',
        objId: hostId,
      }).then(({ data }) => {
        onData(host, data)
      })
    },
    meta: () => {
      const ret = {
        validate: host.status === 'running',
      }
      return ret
    },
  }
}

export function jnlpConsole (manager, host) {
  return {
    label: i18n.t('compute.text_351'),
    action: () => {
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
    },
  }
}
