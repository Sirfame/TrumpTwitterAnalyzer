<template>
  <div id="app">
    <img src="./assets/logo.png">
    <Posts msg="Welcome to the Donald Trump Tweets Analyzer"/>
  </div>
</template>

<script>
import Posts from './components/Posts.vue'
import Tests from './components/Test.vue'
export default {
  name: 'app',
  components: {
    Posts,
    Tests
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

img {
  width: 20%;
  height: 20%;
}
</style>
