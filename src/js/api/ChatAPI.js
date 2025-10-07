import Entity from './Entity';
import createRequest from './createRequest';

export default class ChatAPI extends Entity {
  async create(user) {
    return createRequest({
      url: `${this.baseUrl}/new-user`,
      method: 'POST',
      data: user,
    });
  }
}