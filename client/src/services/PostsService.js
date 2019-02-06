import Api from './api'

export default {
  fetchPosts () {
    return Api().get('posts')
  }
}