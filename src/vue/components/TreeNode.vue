<template>
  <div class="tree-node">
    <div
      class="node-content"
      @click="toggle"
      :class="{ 'contract-highlight': data.contract }"
    >
      <!-- <span class="toggle-icon" v-if="hasChildren">
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span class="no-toggle-icon" v-else>•</span> -->
      <div class="node-info">
        <div class="node-layout">
          <div class="node-op" v-if="data.op">{{ data.op }}</div>
          <div class="node-details">
            <span v-if="data.contract">{{ data.contract }} </span>
            <span v-if="data.amount">{{ data.amount }} AERGO</span>
            <span v-if="data.function">{{ data.function }}</span>
            <span v-if="filteredArgs.length > 0">{{ filteredArgs }}</span>
            <span v-if="data.result">{{ data.result }}</span>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="expanded && (data.call || data.operations)"
      class="tree-children"
    >
      <TreeNode v-if="data.call" :data="data.call" />
      <TreeNode
        v-for="(item, index) in data.operations"
        :key="index"
        :data="item"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeNode',
  components: {
    TreeNode: () => import('./TreeNode.vue'),
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      expanded: true,
    }
  },
  computed: {
    hasChildren() {
      return (
        (this.data.call &&
          (this.data.call.operations || this.data.call.call)) ||
        (this.data.operations && this.data.operations.length > 0)
      )
    },
    filteredArgs() {
      if (!this.data.args || !Array.isArray(this.data.args)) {
        return []
      }

      return this.data.args
        .map((arg, idx) => {
          if (idx === 1 || idx === 2) {
            try {
              const parsed = JSON.parse(arg)
              if (parsed.length === 0 || parsed.every((item) => item === '')) {
                return null
              }
              return parsed
            } catch (e) {
              return arg
            }
          }
          return arg
        })
        .filter((arg) => arg !== null)
    },
  },
  methods: {
    toggle() {
      if (this.hasChildren) {
        this.expanded = !this.expanded
      }
    },
  },
}
</script>

<style scoped>
.tree-node {
  position: relative;
  margin-left: 20px;
}

.tree-node::before {
  content: '';
  position: absolute;
  top: 0;
  left: -10px;
  width: 1px;
  height: 100%;
  background-color: #e8e8e8;
}

.tree-node::after {
  content: '';
  position: absolute;
  top: 28px;
  left: -10px;
  width: 10px;
  height: 1px;
  background-color: #e8e8e8;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 4px 0;
}
.node-content:hover {
  background-color: #f5f5f5;
}
.contract-highlight {
  background-color: #eaf4ff;
  color: #ffffff;
  border: 1px solid #b3d8ff;
  transition: background-color 0.2s ease;
}
.contract-highlight:hover {
  background-color: #d9ebff;
}

.node-info {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
}

.node-layout {
  display: flex;
  align-items: center;
}

.node-op {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.node-details {
  margin-left: 8px;
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  color: #666;
}

.node-details > span {
  margin-right: 10px;
}

.tree-children {
  margin-left: 20px;
}

.tree-node:last-child::before {
  /* 마지막 노드의 연결선을 끊어줍니다 */
  height: 28px;
}
</style>
