<template>
  <div class="tree-node">
    <div
      class="node-content"
      @click="toggle"
      :class="{ 'contract-highlight': data.contract }"
    >
      <div class="node-info">
        <div class="node-layout">
          <div class="field-block" v-if="data.op">
            <div class="field-title">Operation</div>
            <div class="field-value node-op" :class="data.op">
              {{ data.op }}
            </div>
          </div>
          <div class="field-block" v-if="data.contract">
            <div class="field-title">Contract</div>
            <div class="field-value centered" :title="data.contract">
              {{ $options.filters.formatEllipsisText(data.contract, 30) }}
            </div>
          </div>
          <div class="field-block" v-if="data.amount">
            <div class="field-title">Amount</div>
            <div class="field-value centered">
              {{
                data.amount.toLowerCase().includes('aergo')
                  ? data.amount
                  : `${data.amount} aer`
              }}
            </div>
          </div>
          <div class="field-block" v-if="data.function">
            <div class="field-title">Function</div>
            <div class="field-value centered">
              {{ data.function.toUpperCase() }}
            </div>
          </div>
          <div class="field-block args-inline" v-if="filteredArgs.length">
            <div class="field-title">Args</div>
            <div class="field-value args-list">
              <div
                class="arg-item"
                v-for="(arg, index) in filteredArgs"
                :key="index"
              >
                <div class="arg-line">
                  <span class="arg-index">{{ index + 1 }}.</span>
                  <span class="arg-value">{{ arg }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="node-result">
          <span class="error" v-if="isErrorResult"> ⚠️ {{ parsedError }} </span>
          <span class="result" v-else-if="data.result">{{ data.result }}</span>
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
      return this.data.args.map((arg) => {
        try {
          const parsed = JSON.parse(arg)
          return Array.isArray(parsed) ? JSON.stringify(parsed) : parsed
        } catch (e) {
          return arg
        }
      })
    },
    isErrorResult() {
      return (
        typeof this.data.result === 'string' &&
        this.data.result.toLowerCase().includes('error')
      )
    },
    parsedError() {
      if (!this.data.result) return ''
      const match = this.data.result.match(/error[:]?(.+)/i)
      return match ? match[1].trim() : this.data.result
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

<style lang="scss" scoped>
.tree-node {
  position: relative;
  margin-left: 20px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -10px;
    width: 1px;
    height: 100%;
    background-color: #e8e8e8;
  }

  &::after {
    content: '';
    position: absolute;
    top: 16px;
    left: -10px;
    width: 10px;
    height: 1px;
    background-color: #e8e8e8;
  }

  &:last-child::before {
    height: 28px;
  }
}

.node-content {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 4px 0;

  &:hover {
    background-color: #f0f0f0;
  }

  &.contract-highlight {
    background-color: #f0f8ff;
    border: 1px solid #b0d4ff;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #e0f0ff;
    }
  }
}

.node-info {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
  overflow: hidden;
  width: 100%;
}

.node-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  margin-bottom: 8px;
  flex-direction: row;
}

.field-block {
  display: flex;
  flex-direction: column;
  flex: 1 1 160px;
  min-width: 120px;
}

.field-title {
  font-size: 13px;
  font-weight: bold;
  color: #ff008b;
  margin-bottom: 2px;
}

.field-value {
  font-size: 13px;
  color: #3c3b3e;
  word-break: break-word;
  white-space: nowrap;
}

.node-op {
  font-weight: 600;
  text-transform: capitalize;
}

.args-inline {
  flex: 2 1 300px;
  min-width: 200px;
  width: auto;
}

.args-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: monospace;
  font-size: 12px;
  color: #333;
  background-color: #eeeeee;
  border-radius: 6px;
  padding: 8px 10px;
  word-break: break-word;
  white-space: normal;
}

.arg-item {
  display: flex;
}

.arg-line {
  display: flex;
  gap: 2px;
  align-items: center;
}

.arg-index {
  color: #555;
  font-weight: 600;
  min-width: 20px;
}

.arg-value {
  flex: 1;
  word-break: break-word;
}

.result {
  color: #333;
  font-size: 13px;
  margin-top: 4px;
}

.error {
  color: #d32f2f;
  font-weight: 500;
  font-size: 13px;
  margin-top: 4px;
}

.centered {
  display: flex;
  align-items: center;
}

.tree-children {
  margin-left: 20px;
}
</style>
