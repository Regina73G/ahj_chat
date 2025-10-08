export default class Entity {
  constructor() {
    this.baseUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://ahj-chat-backend-zi77.onrender.com';
  }

  async list() {
    throw new Error("Метод должен быть реализован в дочернем классе");
  }

  async get(id) { // eslint-disable-line no-unused-vars
    throw new Error("Метод должен быть реализован в дочернем классе");
  }

  async create(data) { // eslint-disable-line no-unused-vars
    throw new Error("Метод должен быть реализован в дочернем классе");
  }

  async update(id, data) { // eslint-disable-line no-unused-vars
    throw new Error("Метод должен быть реализован в дочернем классе");
  }

  async delete(id) { // eslint-disable-line no-unused-vars
    throw new Error("Метод должен быть реализован в дочернем классе");
  }
}