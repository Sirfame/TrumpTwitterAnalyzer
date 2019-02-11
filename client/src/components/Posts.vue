<template>
  <div class="posts">
    <h1>Tweets</h1>
    <div v-for="post in posts">
      <p id="tweets">
        <span><b>{{ post.title }}</b></span><br />
        <span>{{ post.score }}</span>
      </p>
    </div>
  </div>
</template>

<script>
import PostsService from '../services/PostsService'
export default {
  name: 'posts',
  data () {
    return {
      posts: []
    }
  },
  methods: {
    async getPosts () {
      const response = await PostsService.fetchPosts()
      this.posts = response.data
    }
  },
  mounted () {
    this.getPosts()
  }
}
</script>

<style scoped>
#tweets {
  width: 40%;
  padding-left: 30%;
  padding-right: 30%;
  text-align: left;
}
</style>