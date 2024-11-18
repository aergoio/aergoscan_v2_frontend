<template>
  <div class="tree-node">
    <div class="node-content" @click="toggle">
      <span class="toggle-icon" v-if="hasChildren">
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span class="no-toggle-icon" v-else>•</span>
      <div class="node-info">
        <div class="node-op" v-if="data.op">{{ data.op }}</div>
        <div class="node-details">
          <span v-if="data.amount">{{ data.amount }} AERGO</span>
          <span v-if="data.function">{{ data.function }}</span>
          <span v-if="data.args">{{ data.args }}</span>
          <span v-if="data.result">{{ data.result }}</span>
        </div>
      </div>
    </div>
    <!-- 자식 노드가 있을 경우 재귀적으로 TreeNode 호출 -->
    <div
      v-if="expanded && (data.call || data.operations)"
      class="tree-children"
    >
      <!-- data.call이 있을 경우 -->
      <TreeNode v-if="data.call" :data="data.call" />
      <!-- data.operations이 있을 경우 -->
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
    TreeNode: () => import('./TreeNode.vue'), // 재귀 컴포넌트
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
  position: relative; /* 연결선 위치를 위해 필요 */
  margin-left: 20px;
}

/* 트리 구조의 연결선을 그리기 위한 스타일 */
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
  top: 28px; /* 아이콘의 세로 중심에 맞춤 */
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

.toggle-icon,
.no-toggle-icon {
  width: 24px;
  text-align: center;
  font-size: 14px;
  color: #333333;
}

.node-info {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
}

.node-op {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.node-details {
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
  height: 28px; /* 아이콘 높이와 동일하게 설정 */
}
</style>
