<template>
  <div id="app">

    <h2> power-tree - minimal css</h2>

    <a href="/demo/minimal-theme.html" target="_blank">Source code</a>

    <div class="row">
      <div class="tree-container">
        <power-tree v-model="nodes" :show-branches="true">
          <template #sidebar>
            <div data-sidebar="true">
              <button @click="click" data-sidebar="button">-</button>
            </div>
          </template>
        </power-tree>
      </div>

      <div class="json-preview">
        <pre>{{ JSON.stringify(nodes, null, 4) }}</pre>
      </div>
    </div>


  </div>
</template>

<script>
  import { PowerTree } from './components'

  var nodes = [
    { title: 'Item1', isLeaf: true },
    { title: 'Item2', isLeaf: true, data: { visible: false } },
    { title: 'Folder1' },
    {
      title: 'Folder2', isExpanded: true, children: [
        { title: 'Item3', isLeaf: true },
        { title: 'Item4', isLeaf: true },
        {
          title: 'Folder3', children: [
            { title: 'Item5', isLeaf: true }
          ]
        }
      ]
    },
    { title: 'Folder5', isExpanded: false },
    { title: 'Item6', isLeaf: true },
    { title: 'Item7', isLeaf: true, data: { visible: false } },
    {
      title: 'Folder6', children: [
        {
          title: 'Folder7', children: [
            { title: 'Item8', isLeaf: true },
            { title: 'Item9', isLeaf: true }
          ]
        }
      ]
    }
  ]

  export default {
    name: 'app',
    components: { PowerTree },
    data () {
      return {
        nodes: nodes,
        lastEvent: 'No last event'
      }
    },
    methods: {
      click (event) {
        console.log(event)
      }
    }
  }
</script>

<style>
  /*html {*/
  /*  font-family: sans-serif;*/
  /*  font-size: 10px;*/
  /*  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);*/
  /*  -ms-text-size-adjust: 100%;*/
  /*  -webkit-text-size-adjust: 100%;*/
  /*  height: 100%;*/
  /*}*/

  /*body {*/
  /*  position: relative;*/
  /*  height: 100%;*/
  /*  color: #555555;*/
  /*  margin: 0;*/
  /*  font-family: 'PT Sans', sans-serif;*/
  /*  font-size: 14px;*/
  /*  line-height: 1.42857143;*/
  /*  background-color: #ffffff;*/
  /*}*/

  /*#app {*/
  /*  !*font-family: 'Avenir', Helvetica, Arial, sans-serif;*!*/
  /*  !*-webkit-font-smoothing: antialiased;*!*/
  /*  !*-moz-osx-font-smoothing: grayscale;*!*/
  /*  !*text-align: center;*!*/
  /*  color: #2c3e50;*/
  /*  min-width: 500px;*/
  /*  width: 50%;*/
  /*  margin: 60px auto;*/
  /*}*/

  body {
    background: #050d12;
    font-family: Arial;
    color: rgba(255, 255, 255, 0.5);
  }

  a {
    color: #bbb;
  }

  .row {
    display: flex;
    margin-bottom: 10px;
  }

  .tree-container {
    flex-grow: 1;
  }


  .json-preview {
    flex-grow: 1;
    margin-left: 10px;
    background-color: #13242d;
    border: 1px solid black;
    padding: 10px;
  }
</style>
