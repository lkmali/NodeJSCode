import { send } from '../provider'
import { ClientService } from '../services'
import { ControllersRequest } from '../typings'

async function addClient ({ request }: ControllersRequest) {
  const clientService = new ClientService()
  await clientService.registerNewClient(request.body)
}

module.exports = {
  addClient: send(addClient, { auth: 'jwtAuth', code: 204, roles: ['superAdmin'] })
}
