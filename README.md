# vue-power-tree

Customizable draggable tree component for Vue.js

![preview](preview.png)

[demo](https://holiber.github.io/vue-power-tree/demo/index)

install

`npm i vue-power-tree`


	
# Quick start
````html

<div id="app">
  <vue-power-tree v-model="nodes"/>
</div>

<link rel="stylesheet" href="dist/vue-power-tree-dark.css">
<script src="dist/vue-power-tree.js"></script>

<script>

  var nodes = [
    {title: 'Item1', isLeaf: true},
    {title: 'Item2', isLeaf: true, data: { visible: false }},
    {title: 'Folder1'},
    {
      title: 'Folder2', isExpanded: true, children: [
        {title: 'Item3', isLeaf: true},
        {title: 'Item4', isLeaf: true}
      ]
    }
  ];

  new Vue({
    el: '#app',
    components: { PowerTree },
    data: function () {
     return {
       nodes: nodes
     }
    }
  });
  
</script>    

````

The `value` property is an array of `IPowerTreeNodeModel` nodes:

````typescript
interface IPowerTreeNodeModel<TDataType> {
    title: string;
    isLeaf?: boolean;
    children?: IPowerTreeNodeModel<TDataType>[];
    isExpanded?: boolean;
    isSelected?: boolean;
    isDraggable?: boolean;
    isSelectable?: boolean;
    data?: TDataType; // any serializable user data
}
````

For convenience the component's events return `IPowerTreeNode` objects. Those actually are `IPowerTreeNodeModel`
with some computed props:
````typescript
interface IPowerTreeNode<TDataType> extends IPowerTreeNodeModel<TDataType> {
    isFirstChild: boolean;
    isLastChild: boolean;
    isVisible: boolean;	// node is visible if all of its parents are expanded
    level: number; // nesting level
    ind: number; // index in the array of siblings 
    path: number[]; // path to node as array of indexes, for example [2, 0, 1] in the example above is path to `Item4` 
    pathStr: string; // serialized path to node
    children: IPowerTreeNode<TDataType>[];
}
````

You can get the list of `IPowerTreeNode` from the computed `slVueTree.nodes` property



# Props

| prop             | type               | default                | description                                                                                                                                                                                              |
|------------------|--------------------|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| value            | IPowerTreeNodeModel[] | []                     | An array of nodes to show. Each node is represented by `IPowerTreeNodeModel` interface                                                                                                                              |
| allowMultiselect | Boolean            | true                   | Disable or enable the multiselect feature                                                                                                                                                                |
| allowToggleBranch | Boolean            | true                   | Disable or enable the expand/collapse button                                                                                                                                                                |
| edgeSize         | Number             | 3                      | Offset in pixels from top and bottom for folder-node element. While dragging cursor is in that offset, the dragging node will be placed before or after the folder-node instead of being placed inside the folder. |
| scrollAreaHeight | Number             | 70                     | Offset in pixels from top and bottom for the component element. While dragging cursor is in that area, the scrolling starts.                                                                                |
| maxScrollSpeed   | Number             | 20                     | The scroll speed is relative to the cursor position. Defines the max scroll speed.             
| multiselectKey   | String/String[] |['ctrlKey', 'metaKey'] | The keys for multiselect mode. Allowed values are ['ctrlKey', 'metaKey', 'altKey']   

# Computed props

| prop           | type            | description                                                                                                                                                                                                                                                     |
|----------------|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| nodes          | IPowerTreeNode[]   | List of nodes with some computed props. See `IPowerTreeNode` interface.                                                                                                                                                                                            |
| cursorPosition | ICursorPosition | Represents the current cursor position that describes the action that will be applied to the dragged node on `mouseup` event. See `ICursorPosition` interface |
| selectionSize  | Number          | The count of selected nodes
| dragSize       | Number          | The count of selected and draggable nodes
| isDragging     | Boolean         | True if nodes are dragging

````
interface ICursorPosition<TDataType> {
  node: IPowerTreeNode<TDataType>;
  placement: 'before' | 'inside' | 'after';
}  
````

# Events

| event           | callback arguments                                                         | description                                       |
|-----------------|----------------------------------------------------------------------------|---------------------------------------------------|
| input           | nodes: IPowerTreeNodeModel[]                                                  | triggers for any changes to `value` property     |
| select          | selectedNodes: IPowerTreeNode[], event: MouseEvent                            | triggers when a node has been selected/deselected |
| toggle          | toggledNode: IPowerTreeNode, event: MouseEvent                                | triggers when a node has been collapsed/expanded  |
| drop            | draggingNodes: IPowerTreeNode[], position: ICursorPosition, event: MouseEvent | triggers when dragging nodes have been dropped    |
| nodeclick       | node: IPowerTreeNode, event: MouseEvent                                       | handle `click` event on node                      |
| nodedblclick    | node: IPowerTreeNode, event: MouseEvent                                       | handle `dblclick` event on node                   |
| nodecontextmenu | node: IPowerTreeNode, event: MouseEvent                                       | handle `contextmenu` event on node                |
| externaldrop    | cursorPosition: ICursorPosition, event: MouseEvent                         | handle `drop` event for external items [demo](https://holiber.github.io/vue-power-tree/demo/externaldrag)             |

# Methods


| method                                                                                                   | description                                                                                        |
|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| getNode(path: number[]): IPowerTreeNode                                                                     | Find the node by using its path                                                                   |
| traverse(cb: (node: IPowerTreeNode, nodeModel: IPowerTreeNodeModel, siblings: IPowerTreeNodeModel[])  => boolean) | Helpful method to traverse all nodes. The traversing will be stopped if callback returns `false`.  |
| updateNode(path: number[], patch: Partial<IPowerTreeNodeModel>)                                             | Update the node by using its path                                                                 |
| select(path: number[], addToSelection = false)                                                           | Select the node by using its path                                                                 |                                                                                                                                              |
| getNodeEl(): HTMLElement                                                                                 | Get the node HTMLElement by using its path                                                        |
| getSelected(): IPowerTreeNode[]                                                                             | Get selected nodes                                                                                 |
| insert(position: ICursorPosition, nodeModel: IPowerTreeNodeModel)                                           | Insert nodes by the current cursor position.                                                       |
| remove(paths: number[][])                                                                                | Remove nodes by paths. For example `.remove([[0,1], [0,2]])`
| getFirstNode(): IPowerTreeNode                                                                              | Get the first node in the tree                                                                     |
| getLastNode(): IPowerTreeNode                                                                               | Get the last node in the tree
| getNextNode(path: number[], filter?: (node: IPowerTreeNode<TDataType>) => boolean): IPowerTreeNode<TDataType>; | Get the next node. You can skip the next nodes by using `filter`
| getPrevNode(path: number[], filter?: (node: IPowerTreeNode<TDataType>) => boolean): IPowerTreeNode<TDataType>; | Get the previous node. You can skip the previous nodes by using `filter`

# Slots


| slot       | context     | description                                                                                   |
|------------|-------------|-----------------------------------------------------------------------------------------------|
| title      | IPowerTreeNode | Slot for item title                                                                           |
| toggle     | IPowerTreeNode | Slot for expand/collapse button                                                               |
| sidebar    | IPowerTreeNode | Sidebar content                                                                               |
| draginfo   | PowerTree   | Slot that follows the mouse cursor while dragging. By default shows the dragging nodes count. |
| empty-node | IPowerTreeNode | Slot for (optional) message when folder is open, but empty                                    |

# IE 11 support

You must add a [babel-polyfill](https://babeljs.io/docs/en/babel-polyfill) for it to work correctly in IE11  
[See IE11 example](https://holiber.github.io/vue-power-tree/demo/ie11test.html)


# Examples


## Add a folder or item icon via `title` slot
````html
<vue-power-tree v-model="nodes">
    <template slot="title" slot-scope="{ node }">

      <span class="item-icon">
        <i class="fa fa-file" v-if="node.isLeaf"></i>
        <i class="fa fa-folder" v-if="!node.isLeaf"></i>
      </span>
    
      {{ node.title }}
      
    </template>
</vue-power-tree>

````

## Select all nodes

```javascript
slVueTree.traverse((node, nodeModel, path) => {
    Vue.set(nodeModel, 'isSelected', true);
})
```

## Handle keydown and keyup events via `getNextNode` and `getPrevNode` methods

[demo](https://holiber.github.io/vue-power-tree/demo/keyboardcontrol)

## Contributing
[see CONTRIBUTING.md](CONTRIBUTING.md)

# Changelog
v1.8.5
- fix d.ts https://github.com/holiber/vue-power-tree/pull/77

v1.8.4
- added `insert` method https://github.com/holiber/vue-power-tree/pull/39

v1.8.3
- Allow to disable or enable the expand/collapse button https://github.com/holiber/vue-power-tree/pull/33

v1.8.1
- added IE11 support https://github.com/holiber/vue-power-tree/issues/17

v1.8.0

- added `empty-node` slot

v1.7.1

- added `multiselectKey` property

v1.7.0

- added `isSelectable` and `isDraggable` flags

v1.6.0

- added `getNextNode` and `getPrevNode` methods https://github.com/holiber/vue-power-tree/issues/6

v1.5.1
- improve drop on the bottom of tree https://github.com/holiber/vue-power-tree/issues/5

v1.5.0
- `PowerTree.select` method added
- `PowerTree.@nodeclick` event fixed
