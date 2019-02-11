<template>
  <div class="tests">
    <h1>Tests</h1>
    <div v-for="test in tests">
      <p id="test">
        <span><b>{{ test.title }}</b></span><br />
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'tests',
  data () {
    return {
      tests: []
    }
  },
  methods: {
    async getTests () {
      this.tests.push({
          'title': 'test'
      })
    }
  },
  mounted () {
    this.getTests()
  }
}
</script>

<style scoped>
#test {
  width: 40%;
  padding-left: 30%;
  padding-right: 30%;
  text-align: left;
}
</style>