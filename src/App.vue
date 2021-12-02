<template>
  <div id="app">

  </div>
</template>

<script>
  import { PowerTree } from './components'

  export default {
    name: 'app',
    components: {
      PowerTree,
    }
  }
</script>

<style>
  * {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  *::before,
  *::after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  html {
    font-family: sans-serif;
    font-size: 10px;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    height: 100%;
  }

  body {
    position: relative;
    height: 100%;
    color: #555555;
    margin: 0;
    font-family: 'PT Sans', sans-serif;
    font-size: 14px;
    line-height: 1.42857143;
    background-color: #ffffff;
  }

  #app {
    /*font-family: 'Avenir', Helvetica, Arial, sans-serif;*/
    /*-webkit-font-smoothing: antialiased;*/
    /*-moz-osx-font-smoothing: grayscale;*/
    /*text-align: center;*/
    color: #2c3e50;
    min-width: 500px;
    width: 50%;
    margin: 60px auto;
  }
</style>
