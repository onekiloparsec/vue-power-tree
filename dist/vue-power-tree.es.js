import { resolveComponent as H, openBlock as h, createElementBlock as c, normalizeClass as w, createElementVNode as f, Fragment as R, renderList as $, withModifiers as D, normalizeStyle as k, renderSlot as g, toDisplayString as m, createCommentVNode as S, createTextVNode as b, createBlock as E, withCtx as N, withDirectives as B, vShow as T } from "vue";
const L = {
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
      default: !1
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
      default: !0
    },
    allowToggleBranch: {
      type: Boolean,
      default: !0
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
      mouseIsDown: !1,
      isDragging: !1,
      lastMousePos: { x: 0, y: 0 },
      preventDrag: !1,
      currentValue: this.modelValue
    };
  },
  mounted() {
    this.isRoot && document.addEventListener("mouseup", this.onDocumentMouseupHandler);
  },
  beforeDestroy() {
    document.removeEventListener("mouseup", this.onDocumentMouseupHandler);
  },
  watch: {
    modelValue: function(e) {
      this.currentValue = this.copy(e);
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
        const e = this.copy(this.currentValue);
        return this.getNodes(e);
      }
      return this.getParent().nodes[this.parentInd].children;
    },
    /**
     * gaps is using for nodes indentation
     * @returns {number[]}
     */
    gaps() {
      const e = [];
      let t = this.level - 1;
      for (this.showBranches || t++; t-- > 0; ) e.push(t);
      return e;
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
    setCursorPosition(e) {
      if (this.isRoot) {
        this.rootCursorPosition = e;
        return;
      }
      this.getParent().setCursorPosition(e);
    },
    getNodes(e, t = [], s = !0) {
      return e.map((r, i) => {
        const l = t.concat(i);
        return this.getNode(l, r, e, s);
      });
    },
    getNode(e, t = null, s = null, r = null) {
      const i = e.slice(-1)[0];
      if (s = s || this.getNodeSiblings(this.currentValue, e), t = t || s && s[i] || null, r == null && (r = this.isVisible(e)), !t) return null;
      const l = t.isExpanded === void 0 ? !0 : !!t.isExpanded, a = t.isDraggable === void 0 ? !0 : !!t.isDraggable, o = t.isSelectable === void 0 ? !0 : !!t.isSelectable;
      return {
        // define the all IPowerTreeNodeModel props
        title: t.title,
        isLeaf: !!t.isLeaf,
        children: t.children ? this.getNodes(t.children, e, l) : [],
        isSelected: !!t.isSelected,
        isExpanded: l,
        isVisible: r,
        isDraggable: a,
        isSelectable: o,
        data: t.data !== void 0 ? t.data : {},
        // define the all IPowerTreeNode computed props
        path: e,
        pathStr: JSON.stringify(e),
        level: e.length,
        ind: i,
        isFirstChild: i === 0,
        isLastChild: i === s.length - 1
      };
    },
    isVisible(e) {
      if (e.length < 2) return !0;
      let t = this.currentValue;
      for (let s = 0; s < e.length - 1; s++) {
        let r = e[s], i = t[r];
        if (!(i.isExpanded === void 0 ? !0 : !!i.isExpanded)) return !1;
        t = i.children;
      }
      return !0;
    },
    emitInput(e) {
      this.currentValue = e, this.getRoot().$emit("update:modelValue", e);
    },
    emitSelect(e, t) {
      this.getRoot().$emit("select", e, t);
    },
    emitBeforeDrop(e, t, s) {
      this.getRoot().$emit("beforedrop", e, t, s);
    },
    emitDrop(e, t, s) {
      this.getRoot().$emit("drop", e, t, s);
    },
    emitToggle(e, t) {
      this.getRoot().$emit("toggle", e, t);
    },
    emitNodeClick(e, t) {
      this.getRoot().$emit("nodeclick", e, t);
    },
    emitNodeDblclick(e, t) {
      this.getRoot().$emit("nodedblclick", e, t);
    },
    emitNodeContextmenu(e, t) {
      this.getRoot().$emit("nodecontextmenu", e, t);
    },
    onExternalDragoverHandler(e, t) {
      t.preventDefault();
      const s = this.getRoot(), r = s.getCursorPositionFromCoords(t.clientX, t.clientY);
      s.setCursorPosition(r), s.$emit("externaldragover", r, t);
    },
    onExternalDropHandler(e, t) {
      const s = this.getRoot(), r = s.getCursorPositionFromCoords(t.clientX, t.clientY);
      s.$emit("externaldrop", r, t), this.setCursorPosition(null);
    },
    select(e, t = !1, s = null) {
      const r = this.getNode(e);
      if (!r)
        return null;
      const l = s && !!["ctrlKey", "metaKey"].find((d) => s[d]) && this.allowMultiselect, o = s && s.shiftKey && this.allowMultiselect && this.lastSelectedNode;
      t = (l || t) && this.allowMultiselect;
      const u = this.currentValue, n = [];
      let v = !1;
      return this.traverse((d, p) => {
        o ? ((d.pathStr === r.pathStr || d.pathStr === this.lastSelectedNode.pathStr) && (p.isSelected = d.isSelectable, v = !v), v && (p.isSelected = d.isSelectable)) : d.pathStr === r.pathStr ? p.isSelected = p.isSelected ? !1 : d.isSelectable : t || p.isSelected && (p.isSelected = !1), p.isSelected && n.push(p);
      }, u), this.lastSelectedNode = r, this.emitInput(u), this.emitSelect(n, s), r;
    },
    onMousemoveHandler(e) {
      if (!this.isRoot) {
        this.getRoot().onMousemoveHandler(e);
        return;
      }
      if (this.preventDrag)
        return;
      const t = this.isDragging, s = this.isDragging || this.mouseIsDown && (this.lastMousePos.x !== e.clientX || this.lastMousePos.y !== e.clientY), r = t === !1 && s === !0;
      if (this.lastMousePos = {
        x: e.clientX,
        y: e.clientY
      }, !s) return;
      const i = this.getRoot().$el, l = i.getBoundingClientRect(), a = this.$refs.dragInfo, o = e.clientY - l.top + i.scrollTop - (a.style.marginBottom | 0), u = e.clientX - l.left;
      a.style.top = o + "px", a.style.left = u + "px";
      const n = this.getCursorPositionFromCoords(e.clientX, e.clientY), v = n.node, d = n.placement;
      if (r && !v.isSelected && this.select(v.path, !1, e), !this.getDraggable().length) {
        this.preventDrag = !0;
        return;
      }
      this.isDragging = s, this.setCursorPosition({ node: v, placement: d });
      const P = l.bottom - this.scrollAreaHeight, y = (e.clientY - P) / (l.bottom - P), C = l.top + this.scrollAreaHeight, I = (C - e.clientY) / (C - l.top);
      y > 0 ? this.startScroll(y) : I > 0 ? this.startScroll(-I) : this.stopScroll();
    },
    getCursorPositionFromCoords(e, t) {
      const s = document.elementFromPoint(e, t), r = s.getAttribute("path") ? s : this.getClosetElementWithPath(s);
      let i, l;
      if (r) {
        if (!r) return;
        i = this.getNode(JSON.parse(r.getAttribute("path")));
        const a = r.offsetHeight, o = this.edgeSize, u = t - r.getBoundingClientRect().top;
        i.isLeaf ? l = u >= a / 2 ? "after" : "before" : u <= o ? l = "before" : u >= a - o ? l = "after" : l = "inside";
      } else {
        const o = this.getRoot().$el.getBoundingClientRect();
        t > o.top + o.height / 2 ? (l = "after", i = this.getLastNode()) : (l = "before", i = this.getFirstNode());
      }
      return { node: i, placement: l };
    },
    getClosetElementWithPath(e) {
      return e ? e.getAttribute("path") ? e : this.getClosetElementWithPath(e.parentElement) : null;
    },
    onMouseleaveHandler(e) {
      if (!this.isRoot || !this.isDragging) return;
      const s = this.getRoot().$el.getBoundingClientRect();
      e.clientY >= s.bottom ? this.setCursorPosition({ node: this.nodes.slice(-1)[0], placement: "after" }) : e.clientY < s.top && this.setCursorPosition({ node: this.getFirstNode(), placement: "before" });
    },
    getNodeEl(e) {
      this.getRoot().$el.querySelector(`[path="${JSON.stringify(e)}"]`);
    },
    getLastNode() {
      let e = null;
      return this.traverse((t) => {
        e = t;
      }), e;
    },
    getFirstNode() {
      return this.getNode([0]);
    },
    getNextNode(e, t = null) {
      let s = null;
      return this.traverse((r) => {
        if (!(this.comparePaths(r.path, e) < 1) && (!t || t(r)))
          return s = r, !1;
      }), s;
    },
    getPrevNode(e, t) {
      let s = [];
      this.traverse((i) => {
        if (this.comparePaths(i.path, e) >= 0)
          return !1;
        s.push(i);
      });
      let r = s.length;
      for (; r--; ) {
        const i = s[r];
        if (!t || t(i)) return i;
      }
      return null;
    },
    /**
     * returns 1 if path1 > path2
     * returns -1 if path1 < path2
     * returns 0 if path1 == path2
     *
     * examples
     *
     * [1, 2, 3] < [1, 2, 4]
     * [1, 1, 3] < [1, 2, 3]
     * [1, 2, 3] > [1, 2, 0]
     * [1, 2, 3] > [1, 1, 3]
     * [1, 2] < [1, 2, 0]
     *
     */
    comparePaths(e, t) {
      for (let s = 0; s < e.length; s++) {
        if (t[s] === void 0 || e[s] > t[s]) return 1;
        if (e[s] < t[s]) return -1;
      }
      return t[e.length] === void 0 ? 0 : -1;
    },
    onNodeMousedownHandler(e, t) {
      if (e.button === 0) {
        if (!this.isRoot) {
          this.getRoot().onNodeMousedownHandler(e, t);
          return;
        }
        this.mouseIsDown = !0;
      }
    },
    startScroll(e) {
      const t = this.getRoot().$el;
      this.scrollSpeed !== e && (this.scrollIntervalId && this.stopScroll(), this.scrollSpeed = e, this.scrollIntervalId = setInterval(() => {
        t.scrollTop += this.maxScrollSpeed * e;
      }, 20));
    },
    stopScroll() {
      clearInterval(this.scrollIntervalId), this.scrollIntervalId = 0, this.scrollSpeed = 0;
    },
    onDocumentMouseupHandler(e) {
      this.isDragging && this.onNodeMouseupHandler(e);
    },
    onNodeMouseupHandler(e, t = null) {
      if (e.button !== 0)
        return;
      if (!this.isRoot) {
        this.getRoot().onNodeMouseupHandler(e, t);
        return;
      }
      if (this.mouseIsDown = !1, !this.isDragging && t && !this.preventDrag && e.currentTarget.dataset.tree === "title" && this.select(t.path, !1, e), this.preventDrag = !1, !this.cursorPosition) {
        this.stopDrag();
        return;
      }
      const s = this.getDraggable();
      for (let o of s) {
        if (o.pathStr === this.cursorPosition.node.pathStr) {
          this.stopDrag();
          return;
        }
        if (this.checkNodeIsParent(o, this.cursorPosition.node)) {
          this.stopDrag();
          return;
        }
      }
      const r = this.copy(this.currentValue), i = [];
      for (let o of s) {
        const n = this.getNodeSiblings(r, o.path)[o.ind];
        i.push(n);
      }
      let l = !1;
      if (this.emitBeforeDrop(s, this.cursorPosition, () => l = !0), l) {
        this.stopDrag();
        return;
      }
      const a = [];
      for (let o of i)
        a.push(this.copy(o)), o._markToDelete = !0;
      this.insertModels(this.cursorPosition, a, r), this.traverseModels((o, u, n) => {
        o._markToDelete && u.splice(n, 1);
      }, r), this.lastSelectedNode = null, this.emitInput(r), this.emitDrop(s, this.cursorPosition, e), this.stopDrag();
    },
    onToggleHandler(e, t) {
      this.allowToggleBranch && (this.updateNode(t.path, { isExpanded: !t.isExpanded }), this.emitToggle(t, e), e.stopPropagation());
    },
    stopDrag() {
      this.isDragging = !1, this.mouseIsDown = !1, this.setCursorPosition(null), this.stopScroll();
    },
    getParent() {
      return this.$parent;
    },
    getRoot() {
      return this.isRoot ? this : this.getParent().getRoot();
    },
    getNodeSiblings(e, t) {
      return t.length === 1 ? e : this.getNodeSiblings(e[t[0]].children, t.slice(1));
    },
    updateNode(e, t) {
      if (!this.isRoot) {
        this.getParent().updateNode(e, t);
        return;
      }
      const s = JSON.stringify(e), r = this.copy(this.currentValue);
      this.traverse((i, l) => {
        i.pathStr === s && Object.assign(l, t);
      }, r), this.emitInput(r);
    },
    getSelected() {
      const e = [];
      return this.traverse((t) => {
        t.isSelected && e.push(t);
      }), e;
    },
    getDraggable() {
      const e = [];
      return this.traverse((t) => {
        t.isSelected && t.isDraggable && e.push(t);
      }), e;
    },
    traverse(e, t = null, s = []) {
      t || (t = this.currentValue);
      let r = !1;
      const i = [];
      for (let l = 0; l < t.length; l++) {
        const a = t[l], o = s.concat(l), u = this.getNode(o, a, t);
        if (r = e(u, a, t) === !1, i.push(u), r || a.children && (r = this.traverse(e, a.children, o) === !1, r))
          break;
      }
      return r ? !1 : i;
    },
    traverseModels(e, t) {
      let s = t.length;
      for (; s--; ) {
        const r = t[s];
        r.children && this.traverseModels(e, r.children), e(r, t, s);
      }
      return t;
    },
    remove(e) {
      const t = e.map((r) => JSON.stringify(r)), s = this.copy(this.currentValue);
      this.traverse((r, i, l) => {
        for (const a of t)
          r.pathStr === a && (i._markToDelete = !0);
      }, s), this.traverseModels((r, i, l) => {
        r._markToDelete && i.splice(l, 1);
      }, s), this.emitInput(s);
    },
    insertModels(e, t, s) {
      const r = e.node, i = this.getNodeSiblings(s, r.path), l = i[r.ind];
      if (e.placement === "inside")
        l.children = l.children || [], l.children.unshift(...t);
      else {
        const a = e.placement === "before" ? r.ind : r.ind + 1;
        i.splice(a, 0, ...t);
      }
    },
    insert(e, t) {
      const s = Array.isArray(t) ? t : [t], r = this.copy(this.currentValue);
      this.insertModels(e, s, r), this.emitInput(r);
    },
    checkNodeIsParent(e, t) {
      const s = t.path;
      return JSON.stringify(s.slice(0, e.path.length)) === e.pathStr;
    },
    copy(e) {
      return JSON.parse(JSON.stringify(e));
    }
  }
}, M = (e, t) => {
  const s = e.__vccOpts || e;
  for (const [r, i] of t)
    s[r] = i;
  return s;
}, V = {
  ref: "nodes",
  class: "vue-power-tree-nodes-list"
}, z = ["path"], Y = { class: "vue-power-tree-gap" }, F = {
  key: 0,
  class: "vue-power-tree-branch"
}, O = { key: 0 }, A = { key: 1 }, J = {
  class: "vue-power-tree-row",
  "data-tree": "row"
}, K = ["onClick"], X = ["onMousedown", "onMouseup", "onContextmenu", "onDblclick", "onClick", "onDragover", "onDrop"], W = {
  class: "vue-power-tree-sidebar",
  "data-tree": "sidebar"
}, j = {
  key: 0,
  ref: "dragInfo",
  class: "vue-power-tree-drag-info"
};
function q(e, t, s, r, i, l) {
  const a = H("power-tree", !0);
  return h(), c("div", {
    class: w(["vue-power-tree", { "vue-power-tree-root": e.isRoot }]),
    onMousemove: t[3] || (t[3] = (...o) => e.onMousemoveHandler && e.onMousemoveHandler(...o)),
    onMouseleave: t[4] || (t[4] = (...o) => e.onMouseleaveHandler && e.onMouseleaveHandler(...o)),
    onDragend: t[5] || (t[5] = (o) => e.onDragendHandler(null, o))
  }, [
    f("div", V, [
      (h(!0), c(R, null, $(e.nodes, (o, u) => (h(), c("div", {
        class: w(["vue-power-tree-node", { "vue-power-tree-selected": o.isSelected }])
      }, [
        f("div", {
          class: "vue-power-tree-cursor vue-power-tree-cursor_before",
          onDragover: t[0] || (t[0] = D(() => {
          }, ["prevent"])),
          style: k({
            visibility: e.cursorPosition && e.cursorPosition.node.pathStr === o.pathStr && e.cursorPosition.placement === "before" ? "visible" : "hidden",
            "--depth": e.depth
          })
        }, null, 36),
        f("div", {
          class: w(["vue-power-tree-node-item", {
            "vue-power-tree-cursor-hover": e.cursorPosition && e.cursorPosition.node.pathStr === o.pathStr,
            "vue-power-tree-cursor-inside": e.cursorPosition && e.cursorPosition.placement === "inside" && e.cursorPosition.node.pathStr === o.pathStr,
            "vue-power-tree-node-is-leaf": o.isLeaf,
            "vue-power-tree-node-is-folder": !o.isLeaf
          }]),
          path: o.pathStr
        }, [
          (h(!0), c(R, null, $(e.gaps, (n) => (h(), c("div", Y))), 256)),
          e.level && e.showBranches ? (h(), c("div", F, [
            g(e.$slots, "branch", { node: o }, () => [
              o.isLastChild ? S("", !0) : (h(), c("span", O, m("├") + m("─") + "  ", 1)),
              o.isLastChild ? (h(), c("span", A, m("└") + m("─") + "  ", 1)) : S("", !0)
            ])
          ])) : S("", !0),
          f("div", J, [
            o.isLeaf ? S("", !0) : (h(), c("span", {
              key: 0,
              class: "vue-power-tree-toggle",
              onClick: (n) => e.onToggleHandler(n, o)
            }, [
              g(e.$slots, "toggle", { node: o }, () => [
                f("span", null, m(o.isLeaf ? "" : o.isExpanded ? "-" : "+"), 1)
              ])
            ], 8, K)),
            f("span", {
              onMousedown: (n) => e.onNodeMousedownHandler(n, o),
              onMouseup: (n) => e.onNodeMouseupHandler(n, o),
              onContextmenu: (n) => e.emitNodeContextmenu(o, n),
              onDblclick: (n) => e.emitNodeDblclick(o, n),
              onClick: (n) => e.emitNodeClick(o, n),
              onDragover: (n) => e.onExternalDragoverHandler(o, n),
              onDrop: (n) => e.onExternalDropHandler(o, n),
              "data-tree": "title",
              class: "vue-power-tree-title"
            }, [
              g(e.$slots, "title", { node: o }, () => [
                b(m(o.title), 1)
              ])
            ], 40, X),
            !o.isLeaf && o.children.length == 0 && o.isExpanded ? g(e.$slots, "empty-node", {
              key: 1,
              node: o
            }) : S("", !0)
          ]),
          f("div", W, [
            g(e.$slots, "sidebar", { node: o })
          ])
        ], 10, z),
        o.children && o.children.length && o.isExpanded ? (h(), E(a, {
          key: 0,
          value: o.children,
          level: o.level,
          parentInd: u,
          allowMultiselect: e.allowMultiselect,
          allowToggleBranch: e.allowToggleBranch,
          edgeSize: e.edgeSize,
          showBranches: e.showBranches,
          onDragover: t[1] || (t[1] = D(() => {
          }, ["prevent"]))
        }, {
          title: N(({ node: n }) => [
            g(e.$slots, "title", { node: n }, () => [
              b(m(n.title), 1)
            ])
          ]),
          toggle: N(({ node: n }) => [
            g(e.$slots, "toggle", { node: n }, () => [
              f("span", null, m(n.isLeaf ? "" : n.isExpanded ? "-" : "+"), 1)
            ])
          ]),
          sidebar: N(({ node: n }) => [
            g(e.$slots, "sidebar", { node: n })
          ]),
          "empty-node": N(({ node: n }) => [
            !n.isLeaf && n.children.length === 0 && n.isExpanded ? g(e.$slots, "empty-node", {
              key: 0,
              node: n
            }) : S("", !0)
          ]),
          _: 2
        }, 1032, ["value", "level", "parentInd", "allowMultiselect", "allowToggleBranch", "edgeSize", "showBranches"])) : S("", !0),
        f("div", {
          class: "vue-power-tree-cursor vue-power-tree-cursor_after",
          onDragover: t[2] || (t[2] = D(() => {
          }, ["prevent"])),
          style: k({
            visibility: e.cursorPosition && e.cursorPosition.node.pathStr === o.pathStr && e.cursorPosition.placement === "after" ? "visible" : "hidden",
            "--depth": e.depth
          })
        }, null, 36)
      ], 2))), 256)),
      e.isRoot ? B((h(), c("div", j, [
        g(e.$slots, "draginfo", {}, () => [
          b(" Items: " + m(e.selectionSize), 1)
        ])
      ], 512)), [
        [T, e.isDragging]
      ]) : S("", !0)
    ], 512)
  ], 34);
}
const Q = /* @__PURE__ */ M(L, [["render", q]]);
export {
  Q as PowerTree
};
