import { Manager } from '@/utils/manager'

export default class ansible {
  constructor (ansiblePlaybookId) {
    this.state = {}
    this.ansiblePlaybookId = ansiblePlaybookId
    this.managerAnsibleplaybooks = new Manager('ansibleplaybooks')
  }

  stop () {
    if (this.ansiblePlaybookId) {
      return this.managerAnsibleplaybooks.performAction({
        id: this.ansiblePlaybookId,
        action: 'stop',
      })
    }
  }

  run () {
    if (this.ansiblePlaybookId) {
      return this.managerAnsibleplaybooks.performAction({
        id: this.ansiblePlaybookId,
        action: 'run',
      })
    }
  }

  get () {
    if (this.ansiblePlaybookId) {
      return this.managerAnsibleplaybooks.get({ id: this.ansiblePlaybookId })
    }
  }
}
