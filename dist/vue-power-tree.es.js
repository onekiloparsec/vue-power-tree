import { resolveComponent, openBlock, createElementBlock, normalizeClass, createElementVNode, Fragment, renderList, withModifiers, normalizeStyle, renderSlot, toDisplayString, createCommentVNode, createTextVNode, createBlock, withCtx, withDirectives, vShow } from "vue";
var _sfc_main = {
  name: "power-tree",
  emits: ["update:modelValue", "select", "beforedrop", "drop", "toggle", "nodeclick", "nodedblclick", "nodecontextmenu", "externaldragover", "externaldrop"],
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    edgeSize: {
      type: Number,
      default: 3
    },
    showBranches: {
      type: Boolean,
      default: false
    },
    level: {
      type: Number,
      default: 0
    },
    parentInd: {
      type: Number
    },
    allowMultiselect: {
      type: Boolean,
      default: true
    },
    allowToggleBranch: {
      type: Boolean,
      default: true
    },
    multiselectKey: {
      type: [String, Array],
      default: function() {
        return ["ctrlKey", "metaKey"];
      },
      validator: function(value) {
        let allowedKeys = ["ctrlKey", "metaKey", "altKey"];
        let multiselectKeys = Array.isArray(value) ? value : [value];
        multiselectKeys = multiselectKeys.filter((keyName) => allowedKeys.indexOf(keyName) !== -1);
        return !!multiselectKeys.length;
      }
    },
    scrollAreaHeight: {
      type: Number,
      default: 70
    },
    maxScrollSpeed: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      rootCursorPosition: null,
      scrollIntervalId: 0,
      scrollSpeed: 0,
      lastSelectedNode: null,
      mouseIsDown: false,
      isDragging: false,
      lastMousePos: { x: 0, y: 0 },
      preventDrag: false,
      currentValue: this.modelValue
    };
  },
  mounted() {
    if (this.isRoot) {
      document.addEventListener("mouseup", this.onDocumentMouseupHandler);
    }
  },
  beforeDestroy() {
    document.removeEventListener("mouseup", this.onDocumentMouseupHandler);
  },
  watch: {
    modelValue: function(newValue) {
      this.currentValue = this.copy(newValue);
    }
  },
  computed: {
    cursorPosition() {
      return this.isRoot ? this.rootCursorPosition : this.getParent().cursorPosition;
    },
    depth() {
      return this.gaps.length;
    },
    nodes() {
      if (this.isRoot) {
        const nodeModels = this.copy(this.currentValue);
        return this.getNodes(nodeModels);
      }
      return this.getParent().nodes[this.parentInd].children;
    },
    gaps() {
      const gaps = [];
      let i = this.level - 1;
      if (!this.showBranches)
        i++;
      while (i-- > 0)
        gaps.push(i);
      return gaps;
    },
    isRoot() {
      return !this.level;
    },
    selectionSize() {
      return this.getSelected().length;
    },
    dragSize() {
      return this.getDraggable().length;
    }
  },
  methods: {
    setCursorPosition(pos) {
      if (this.isRoot) {
        this.rootCursorPosition = pos;
        return;
      }
      this.getParent().setCursorPosition(pos);
    },
    getNodes(nodeModels, parentPath = [], isVisible = true) {
      return nodeModels.map((nodeModel, ind) => {
        const nodePath = parentPath.concat(ind);
        return this.getNode(nodePath, nodeModel, nodeModels, isVisible);
      });
    },
    getNode(path, nodeModel = null, siblings = null, isVisible = null) {
      const ind = path.slice(-1)[0];
      siblings = siblings || this.getNodeSiblings(this.currentValue, path);
      nodeModel = nodeModel || siblings && siblings[ind] || null;
      if (isVisible == null) {
        isVisible = this.isVisible(path);
      }
      if (!nodeModel)
        return null;
      const isExpanded = nodeModel.isExpanded === void 0 ? true : !!nodeModel.isExpanded;
      const isDraggable = nodeModel.isDraggable === void 0 ? true : !!nodeModel.isDraggable;
      const isSelectable = nodeModel.isSelectable === void 0 ? true : !!nodeModel.isSelectable;
      return {
        title: nodeModel.title,
        isLeaf: !!nodeModel.isLeaf,
        children: nodeModel.children ? this.getNodes(nodeModel.children, path, isExpanded) : [],
        isSelected: !!nodeModel.isSelected,
        isExpanded,
        isVisible,
        isDraggable,
        isSelectable,
        data: nodeModel.data !== void 0 ? nodeModel.data : {},
        path,
        pathStr: JSON.stringify(path),
        level: path.length,
        ind,
        isFirstChild: ind === 0,
        isLastChild: ind === siblings.length - 1
      };
    },
    isVisible(path) {
      if (path.length < 2)
        return true;
      let nodeModels = this.currentValue;
      for (let i = 0; i < path.length - 1; i++) {
        let ind = path[i];
        let nodeModel = nodeModels[ind];
        let isExpanded = nodeModel.isExpanded === void 0 ? true : !!nodeModel.isExpanded;
        if (!isExpanded)
          return false;
        nodeModels = nodeModel.children;
      }
      return true;
    },
    emitInput(newValue) {
      this.currentValue = newValue;
      this.getRoot().$emit("update:modelValue", newValue);
    },
    emitSelect(selectedNodes, event) {
      this.getRoot().$emit("select", selectedNodes, event);
    },
    emitBeforeDrop(draggingNodes, position, cancel) {
      this.getRoot().$emit("beforedrop", draggingNodes, position, cancel);
    },
    emitDrop(draggingNodes, position, event) {
      this.getRoot().$emit("drop", draggingNodes, position, event);
    },
    emitToggle(toggledNode, event) {
      this.getRoot().$emit("toggle", toggledNode, event);
    },
    emitNodeClick(node, event) {
      this.getRoot().$emit("nodeclick", node, event);
    },
    emitNodeDblclick(node, event) {
      this.getRoot().$emit("nodedblclick", node, event);
    },
    emitNodeContextmenu(node, event) {
      this.getRoot().$emit("nodecontextmenu", node, event);
    },
    onExternalDragoverHandler(node, event) {
      event.preventDefault();
      const root = this.getRoot();
      const cursorPosition = root.getCursorPositionFromCoords(event.clientX, event.clientY);
      root.setCursorPosition(cursorPosition);
      root.$emit("externaldragover", cursorPosition, event);
    },
    onExternalDropHandler(node, event) {
      const root = this.getRoot();
      const cursorPosition = root.getCursorPositionFromCoords(event.clientX, event.clientY);
      root.$emit("externaldrop", cursorPosition, event);
      this.setCursorPosition(null);
    },
    select(path, addToSelection = false, event = null) {
      const multiselectKeys = Array.isArray(this.multiselectKey) ? this.multiselectKey : [this.multiselectKey];
      const multiselectKeyIsPressed = event && !!multiselectKeys.find((key) => event[key]);
      addToSelection = (multiselectKeyIsPressed || addToSelection) && this.allowMultiselect;
      const selectedNode = this.getNode(path);
      if (!selectedNode)
        return null;
      const newNodes = this.copy(this.currentValue);
      const shiftSelectionMode = this.allowMultiselect && event && event.shiftKey && this.lastSelectedNode;
      const selectedNodes = [];
      let shiftSelectionStarted = false;
      this.traverse((node, nodeModel) => {
        if (shiftSelectionMode) {
          if (node.pathStr === selectedNode.pathStr || node.pathStr === this.lastSelectedNode.pathStr) {
            nodeModel.isSelected = node.isSelectable;
            shiftSelectionStarted = !shiftSelectionStarted;
          }
          if (shiftSelectionStarted)
            nodeModel.isSelected = node.isSelectable;
        } else if (node.pathStr === selectedNode.pathStr) {
          nodeModel.isSelected = node.isSelectable;
        } else if (!addToSelection) {
          if (nodeModel.isSelected)
            nodeModel.isSelected = false;
        }
        if (nodeModel.isSelected) {
          selectedNodes.push(node);
        }
      }, newNodes);
      this.lastSelectedNode = selectedNode;
      this.emitInput(newNodes);
      this.emitSelect(selectedNodes, event);
      return selectedNode;
    },
    onMousemoveHandler(event) {
      if (!this.isRoot) {
        this.getRoot().onMousemoveHandler(event);
        return;
      }
      if (this.preventDrag) {
        return;
      }
      const initialDraggingState = this.isDragging;
      const isDragging = this.isDragging || this.mouseIsDown && (this.lastMousePos.x !== event.clientX || this.lastMousePos.y !== event.clientY);
      const isDragStarted = initialDraggingState === false && isDragging === true;
      this.lastMousePos = {
        x: event.clientX,
        y: event.clientY
      };
      if (!isDragging)
        return;
      const $root = this.getRoot().$el;
      const rootRect = $root.getBoundingClientRect();
      const $dragInfo = this.$refs.dragInfo;
      const dragInfoTop = event.clientY - rootRect.top + $root.scrollTop - ($dragInfo.style.marginBottom | 0);
      const dragInfoLeft = event.clientX - rootRect.left;
      $dragInfo.style.top = dragInfoTop + "px";
      $dragInfo.style.left = dragInfoLeft + "px";
      const cursorPosition = this.getCursorPositionFromCoords(event.clientX, event.clientY);
      const destNode = cursorPosition.node;
      const placement = cursorPosition.placement;
      if (isDragStarted && !destNode.isSelected) {
        this.select(destNode.path, false, event);
      }
      const draggableNodes = this.getDraggable();
      if (!draggableNodes.length) {
        this.preventDrag = true;
        return;
      }
      this.isDragging = isDragging;
      this.setCursorPosition({ node: destNode, placement });
      const scrollBottomLine = rootRect.bottom - this.scrollAreaHeight;
      const scrollDownSpeed = (event.clientY - scrollBottomLine) / (rootRect.bottom - scrollBottomLine);
      const scrollTopLine = rootRect.top + this.scrollAreaHeight;
      const scrollTopSpeed = (scrollTopLine - event.clientY) / (scrollTopLine - rootRect.top);
      if (scrollDownSpeed > 0) {
        this.startScroll(scrollDownSpeed);
      } else if (scrollTopSpeed > 0) {
        this.startScroll(-scrollTopSpeed);
      } else {
        this.stopScroll();
      }
    },
    getCursorPositionFromCoords(x, y) {
      const $target = document.elementFromPoint(x, y);
      const $nodeItem = $target.getAttribute("path") ? $target : this.getClosetElementWithPath($target);
      let destNode;
      let placement;
      if ($nodeItem) {
        if (!$nodeItem)
          return;
        destNode = this.getNode(JSON.parse($nodeItem.getAttribute("path")));
        const nodeHeight = $nodeItem.offsetHeight;
        const edgeSize = this.edgeSize;
        const offsetY = y - $nodeItem.getBoundingClientRect().top;
        if (destNode.isLeaf) {
          placement = offsetY >= nodeHeight / 2 ? "after" : "before";
        } else {
          if (offsetY <= edgeSize) {
            placement = "before";
          } else if (offsetY >= nodeHeight - edgeSize) {
            placement = "after";
          } else {
            placement = "inside";
          }
        }
      } else {
        const $root = this.getRoot().$el;
        const rootRect = $root.getBoundingClientRect();
        if (y > rootRect.top + rootRect.height / 2) {
          placement = "after";
          destNode = this.getLastNode();
        } else {
          placement = "before";
          destNode = this.getFirstNode();
        }
      }
      return { node: destNode, placement };
    },
    getClosetElementWithPath($el) {
      if (!$el)
        return null;
      if ($el.getAttribute("path"))
        return $el;
      return this.getClosetElementWithPath($el.parentElement);
    },
    onMouseleaveHandler(event) {
      if (!this.isRoot || !this.isDragging)
        return;
      const $root = this.getRoot().$el;
      const rootRect = $root.getBoundingClientRect();
      if (event.clientY >= rootRect.bottom) {
        this.setCursorPosition({ node: this.nodes.slice(-1)[0], placement: "after" });
      } else if (event.clientY < rootRect.top) {
        this.setCursorPosition({ node: this.getFirstNode(), placement: "before" });
      }
    },
    getNodeEl(path) {
      this.getRoot().$el.querySelector(`[path="${JSON.stringify(path)}"]`);
    },
    getLastNode() {
      let lastNode = null;
      this.traverse((node) => {
        lastNode = node;
      });
      return lastNode;
    },
    getFirstNode() {
      return this.getNode([0]);
    },
    getNextNode(path, filter = null) {
      let resultNode = null;
      this.traverse((node) => {
        if (this.comparePaths(node.path, path) < 1) {
          return;
        }
        if (!filter || filter(node)) {
          resultNode = node;
          return false;
        }
      });
      return resultNode;
    },
    getPrevNode(path, filter) {
      let prevNodes = [];
      this.traverse((node) => {
        if (this.comparePaths(node.path, path) >= 0) {
          return false;
        }
        prevNodes.push(node);
      });
      let i = prevNodes.length;
      while (i--) {
        const node = prevNodes[i];
        if (!filter || filter(node))
          return node;
      }
      return null;
    },
    comparePaths(path1, path2) {
      for (let i = 0; i < path1.length; i++) {
        if (path2[i] === void 0)
          return 1;
        if (path1[i] > path2[i])
          return 1;
        if (path1[i] < path2[i])
          return -1;
      }
      return path2[path1.length] === void 0 ? 0 : -1;
    },
    onNodeMousedownHandler(event, node) {
      if (event.button !== 0)
        return;
      if (!this.isRoot) {
        this.getRoot().onNodeMousedownHandler(event, node);
        return;
      }
      this.mouseIsDown = true;
    },
    startScroll(speed) {
      const $root = this.getRoot().$el;
      if (this.scrollSpeed === speed) {
        return;
      } else if (this.scrollIntervalId) {
        this.stopScroll();
      }
      this.scrollSpeed = speed;
      this.scrollIntervalId = setInterval(() => {
        $root.scrollTop += this.maxScrollSpeed * speed;
      }, 20);
    },
    stopScroll() {
      clearInterval(this.scrollIntervalId);
      this.scrollIntervalId = 0;
      this.scrollSpeed = 0;
    },
    onDocumentMouseupHandler(event) {
      if (this.isDragging)
        this.onNodeMouseupHandler(event);
    },
    onNodeMouseupHandler(event, targetNode = null) {
      if (event.button !== 0) {
        return;
      }
      if (!this.isRoot) {
        this.getRoot().onNodeMouseupHandler(event, targetNode);
        return;
      }
      this.mouseIsDown = false;
      if (!this.isDragging && targetNode && !this.preventDrag && event.currentTarget.dataset.tree === "title") {
        this.select(targetNode.path, false, event);
      }
      this.preventDrag = false;
      if (!this.cursorPosition) {
        this.stopDrag();
        return;
      }
      const draggingNodes = this.getDraggable();
      for (let draggingNode of draggingNodes) {
        if (draggingNode.pathStr === this.cursorPosition.node.pathStr) {
          this.stopDrag();
          return;
        }
        if (this.checkNodeIsParent(draggingNode, this.cursorPosition.node)) {
          this.stopDrag();
          return;
        }
      }
      const newNodes = this.copy(this.currentValue);
      const nodeModelsSubjectToInsert = [];
      for (let draggingNode of draggingNodes) {
        const sourceSiblings = this.getNodeSiblings(newNodes, draggingNode.path);
        const draggingNodeModel = sourceSiblings[draggingNode.ind];
        nodeModelsSubjectToInsert.push(draggingNodeModel);
      }
      let cancelled = false;
      this.emitBeforeDrop(draggingNodes, this.cursorPosition, () => cancelled = true);
      if (cancelled) {
        this.stopDrag();
        return;
      }
      const nodeModelsToInsert = [];
      for (let draggingNodeModel of nodeModelsSubjectToInsert) {
        nodeModelsToInsert.push(this.copy(draggingNodeModel));
        draggingNodeModel["_markToDelete"] = true;
      }
      this.insertModels(this.cursorPosition, nodeModelsToInsert, newNodes);
      this.traverseModels((nodeModel, siblings, ind) => {
        if (!nodeModel._markToDelete)
          return;
        siblings.splice(ind, 1);
      }, newNodes);
      this.lastSelectedNode = null;
      this.emitInput(newNodes);
      this.emitDrop(draggingNodes, this.cursorPosition, event);
      this.stopDrag();
    },
    onToggleHandler(event, node) {
      if (!this.allowToggleBranch) {
        return;
      }
      this.updateNode(node.path, { isExpanded: !node.isExpanded });
      this.emitToggle(node, event);
      event.stopPropagation();
    },
    stopDrag() {
      this.isDragging = false;
      this.mouseIsDown = false;
      this.setCursorPosition(null);
      this.stopScroll();
    },
    getParent() {
      return this.$parent;
    },
    getRoot() {
      if (this.isRoot)
        return this;
      return this.getParent().getRoot();
    },
    getNodeSiblings(nodes, path) {
      if (path.length === 1)
        return nodes;
      return this.getNodeSiblings(nodes[path[0]].children, path.slice(1));
    },
    updateNode(path, patch) {
      if (!this.isRoot) {
        this.getParent().updateNode(path, patch);
        return;
      }
      const pathStr = JSON.stringify(path);
      const newNodes = this.copy(this.currentValue);
      this.traverse((node, nodeModel) => {
        if (node.pathStr !== pathStr)
          return;
        Object.assign(nodeModel, patch);
      }, newNodes);
      this.emitInput(newNodes);
    },
    getSelected() {
      const selectedNodes = [];
      this.traverse((node) => {
        if (node.isSelected)
          selectedNodes.push(node);
      });
      return selectedNodes;
    },
    getDraggable() {
      const selectedNodes = [];
      this.traverse((node) => {
        if (node.isSelected && node.isDraggable)
          selectedNodes.push(node);
      });
      return selectedNodes;
    },
    traverse(cb, nodeModels = null, parentPath = []) {
      if (!nodeModels)
        nodeModels = this.currentValue;
      let shouldStop = false;
      const nodes = [];
      for (let nodeInd = 0; nodeInd < nodeModels.length; nodeInd++) {
        const nodeModel = nodeModels[nodeInd];
        const itemPath = parentPath.concat(nodeInd);
        const node = this.getNode(itemPath, nodeModel, nodeModels);
        shouldStop = cb(node, nodeModel, nodeModels) === false;
        nodes.push(node);
        if (shouldStop)
          break;
        if (nodeModel.children) {
          shouldStop = this.traverse(cb, nodeModel.children, itemPath) === false;
          if (shouldStop)
            break;
        }
      }
      return !shouldStop ? nodes : false;
    },
    traverseModels(cb, nodeModels) {
      let i = nodeModels.length;
      while (i--) {
        const nodeModel = nodeModels[i];
        if (nodeModel.children)
          this.traverseModels(cb, nodeModel.children);
        cb(nodeModel, nodeModels, i);
      }
      return nodeModels;
    },
    remove(paths) {
      const pathsStr = paths.map((path) => JSON.stringify(path));
      const newNodes = this.copy(this.currentValue);
      this.traverse((node, nodeModel, siblings) => {
        for (const pathStr of pathsStr) {
          if (node.pathStr === pathStr)
            nodeModel._markToDelete = true;
        }
      }, newNodes);
      this.traverseModels((nodeModel, siblings, ind) => {
        if (!nodeModel._markToDelete)
          return;
        siblings.splice(ind, 1);
      }, newNodes);
      this.emitInput(newNodes);
    },
    insertModels(cursorPosition, nodeModels, newNodes) {
      const destNode = cursorPosition.node;
      const destSiblings = this.getNodeSiblings(newNodes, destNode.path);
      const destNodeModel = destSiblings[destNode.ind];
      if (cursorPosition.placement === "inside") {
        destNodeModel.children = destNodeModel.children || [];
        destNodeModel.children.unshift(...nodeModels);
      } else {
        const insertInd = cursorPosition.placement === "before" ? destNode.ind : destNode.ind + 1;
        destSiblings.splice(insertInd, 0, ...nodeModels);
      }
    },
    insert(cursorPosition, nodeModel) {
      const nodeModels = Array.isArray(nodeModel) ? nodeModel : [nodeModel];
      const newNodes = this.copy(this.currentValue);
      this.insertModels(cursorPosition, nodeModels, newNodes);
      this.emitInput(newNodes);
    },
    checkNodeIsParent(sourceNode, destNode) {
      const destPath = destNode.path;
      return JSON.stringify(destPath.slice(0, sourceNode.path.length)) === sourceNode.pathStr;
    },
    copy(entity) {
      return JSON.parse(JSON.stringify(entity));
    }
  }
};
var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _hoisted_1 = {
  ref: "nodes",
  class: "vue-power-tree-nodes-list"
};
const _hoisted_2 = ["path"];
const _hoisted_3 = { class: "vue-power-tree-gap" };
const _hoisted_4 = {
  key: 0,
  class: "vue-power-tree-branch"
};
const _hoisted_5 = { key: 0 };
const _hoisted_6 = { key: 1 };
const _hoisted_7 = {
  class: "vue-power-tree-row",
  "data-tree": "row"
};
const _hoisted_8 = ["onClick"];
const _hoisted_9 = ["onMousedown", "onMouseup", "onContextmenu", "onDblclick", "onClick", "onDragover", "onDrop"];
const _hoisted_10 = {
  class: "vue-power-tree-sidebar",
  "data-tree": "sidebar"
};
const _hoisted_11 = {
  key: 0,
  ref: "dragInfo",
  class: "vue-power-tree-drag-info"
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_power_tree = resolveComponent("power-tree", true);
  return openBlock(), createElementBlock("div", {
    class: normalizeClass(["vue-power-tree", { "vue-power-tree-root": _ctx.isRoot }]),
    onMousemove: _cache[3] || (_cache[3] = (...args) => _ctx.onMousemoveHandler && _ctx.onMousemoveHandler(...args)),
    onMouseleave: _cache[4] || (_cache[4] = (...args) => _ctx.onMouseleaveHandler && _ctx.onMouseleaveHandler(...args)),
    onDragend: _cache[5] || (_cache[5] = ($event) => _ctx.onDragendHandler(null, $event))
  }, [
    createElementVNode("div", _hoisted_1, [
      (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.nodes, (node, nodeInd) => {
        return openBlock(), createElementBlock("div", {
          class: normalizeClass(["vue-power-tree-node", { "vue-power-tree-selected": node.isSelected }])
        }, [
          createElementVNode("div", {
            class: "vue-power-tree-cursor vue-power-tree-cursor_before",
            onDragover: _cache[0] || (_cache[0] = withModifiers(() => {
            }, ["prevent"])),
            style: normalizeStyle({
              "visibility": _ctx.cursorPosition && _ctx.cursorPosition.node.pathStr === node.pathStr && _ctx.cursorPosition.placement === "before" ? "visible" : "hidden",
              "--depth": _ctx.depth
            })
          }, null, 36),
          createElementVNode("div", {
            class: normalizeClass(["vue-power-tree-node-item", {
              "vue-power-tree-cursor-hover": _ctx.cursorPosition && _ctx.cursorPosition.node.pathStr === node.pathStr,
              "vue-power-tree-cursor-inside": _ctx.cursorPosition && _ctx.cursorPosition.placement === "inside" && _ctx.cursorPosition.node.pathStr === node.pathStr,
              "vue-power-tree-node-is-leaf": node.isLeaf,
              "vue-power-tree-node-is-folder": !node.isLeaf
            }]),
            path: node.pathStr
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.gaps, (gapInd) => {
              return openBlock(), createElementBlock("div", _hoisted_3);
            }), 256)),
            _ctx.level && _ctx.showBranches ? (openBlock(), createElementBlock("div", _hoisted_4, [
              renderSlot(_ctx.$slots, "branch", { node }, () => [
                !node.isLastChild ? (openBlock(), createElementBlock("span", _hoisted_5, toDisplayString(String.fromCharCode(9500)) + toDisplayString(String.fromCharCode(9472)) + "\xA0 ", 1)) : createCommentVNode("", true),
                node.isLastChild ? (openBlock(), createElementBlock("span", _hoisted_6, toDisplayString(String.fromCharCode(9492)) + toDisplayString(String.fromCharCode(9472)) + "\xA0 ", 1)) : createCommentVNode("", true)
              ])
            ])) : createCommentVNode("", true),
            createElementVNode("div", _hoisted_7, [
              !node.isLeaf ? (openBlock(), createElementBlock("span", {
                key: 0,
                class: "vue-power-tree-toggle",
                onClick: ($event) => _ctx.onToggleHandler($event, node)
              }, [
                renderSlot(_ctx.$slots, "toggle", { node }, () => [
                  createElementVNode("span", null, toDisplayString(!node.isLeaf ? node.isExpanded ? "-" : "+" : ""), 1)
                ])
              ], 8, _hoisted_8)) : createCommentVNode("", true),
              createElementVNode("span", {
                onMousedown: ($event) => _ctx.onNodeMousedownHandler($event, node),
                onMouseup: ($event) => _ctx.onNodeMouseupHandler($event, node),
                onContextmenu: ($event) => _ctx.emitNodeContextmenu(node, $event),
                onDblclick: ($event) => _ctx.emitNodeDblclick(node, $event),
                onClick: ($event) => _ctx.emitNodeClick(node, $event),
                onDragover: ($event) => _ctx.onExternalDragoverHandler(node, $event),
                onDrop: ($event) => _ctx.onExternalDropHandler(node, $event),
                "data-tree": "title",
                class: "vue-power-tree-title"
              }, [
                renderSlot(_ctx.$slots, "title", { node }, () => [
                  createTextVNode(toDisplayString(node.title), 1)
                ])
              ], 40, _hoisted_9),
              !node.isLeaf && node.children.length == 0 && node.isExpanded ? renderSlot(_ctx.$slots, "empty-node", {
                key: 1,
                node
              }) : createCommentVNode("", true)
            ]),
            createElementVNode("div", _hoisted_10, [
              renderSlot(_ctx.$slots, "sidebar", { node })
            ])
          ], 10, _hoisted_2),
          node.children && node.children.length && node.isExpanded ? (openBlock(), createBlock(_component_power_tree, {
            key: 0,
            value: node.children,
            level: node.level,
            parentInd: nodeInd,
            allowMultiselect: _ctx.allowMultiselect,
            allowToggleBranch: _ctx.allowToggleBranch,
            edgeSize: _ctx.edgeSize,
            showBranches: _ctx.showBranches,
            onDragover: _cache[1] || (_cache[1] = withModifiers(() => {
            }, ["prevent"]))
          }, {
            title: withCtx(({ node: node2 }) => [
              renderSlot(_ctx.$slots, "title", { node: node2 }, () => [
                createTextVNode(toDisplayString(node2.title), 1)
              ])
            ]),
            toggle: withCtx(({ node: node2 }) => [
              renderSlot(_ctx.$slots, "toggle", { node: node2 }, () => [
                createElementVNode("span", null, toDisplayString(!node2.isLeaf ? node2.isExpanded ? "-" : "+" : ""), 1)
              ])
            ]),
            sidebar: withCtx(({ node: node2 }) => [
              renderSlot(_ctx.$slots, "sidebar", { node: node2 })
            ]),
            "empty-node": withCtx(({ node: node2 }) => [
              !node2.isLeaf && node2.children.length === 0 && node2.isExpanded ? renderSlot(_ctx.$slots, "empty-node", {
                key: 0,
                node: node2
              }) : createCommentVNode("", true)
            ]),
            _: 2
          }, 1032, ["value", "level", "parentInd", "allowMultiselect", "allowToggleBranch", "edgeSize", "showBranches"])) : createCommentVNode("", true),
          createElementVNode("div", {
            class: "vue-power-tree-cursor vue-power-tree-cursor_after",
            onDragover: _cache[2] || (_cache[2] = withModifiers(() => {
            }, ["prevent"])),
            style: normalizeStyle({
              "visibility": _ctx.cursorPosition && _ctx.cursorPosition.node.pathStr === node.pathStr && _ctx.cursorPosition.placement === "after" ? "visible" : "hidden",
              "--depth": _ctx.depth
            })
          }, null, 36)
        ], 2);
      }), 256)),
      _ctx.isRoot ? withDirectives((openBlock(), createElementBlock("div", _hoisted_11, [
        renderSlot(_ctx.$slots, "draginfo", {}, () => [
          createTextVNode(" Items: " + toDisplayString(_ctx.selectionSize), 1)
        ])
      ], 512)), [
        [vShow, _ctx.isDragging]
      ]) : createCommentVNode("", true)
    ], 512)
  ], 34);
}
var powerTree = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
var powerTreeMinimal = "";
export { powerTree as PowerTree };
