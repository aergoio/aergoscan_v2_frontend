<template>
  <div class="tree-node">
    <div
      class="node-content"
      @click="toggle"
      :class="{
        'contract-highlight': data.contract,
        clickable: hasChildren,
        'args-open-highlight': isFirst,
      }"
    >
      <div class="node-info">
        <div class="node-grid">
          <div class="field" v-if="data.op">
            <label>Operation</label>
            <span class="node-op">{{ data.op }}</span>
          </div>
          <div class="field" v-if="data.contract">
            <label>Contract</label>
            <span :title="data.contract">{{ data.contract }}</span>
          </div>
          <div class="field" v-if="data.amount">
            <label>Amount</label>
            <span>{{ formatAmount(data.amount) }}</span>
          </div>
          <div class="field" v-if="data.function">
            <label>Function</label>
            <span>{{ data.function }}</span>
          </div>

          <!-- Arguments -->
          <div class="field full-width" v-if="filteredArgs.length">
            <details
              class="args-toggle"
              :open="argsOpen"
              @click.stop
              @toggle="onArgsToggle"
            >
              <summary class="args-summary">
                <label>
                  Arguments
                  <span class="arg-count">{{ filteredArgs.length }}</span>
                </label>
                <img
                  src="~@assets/img/ic_arrow_down_white.svg"
                  class="arrow-icon"
                  alt="Toggle"
                />
              </summary>
              <ul class="args-list">
                <li v-for="(arg, i) in filteredArgs" :key="i">
                  <strong>{{ i + 1 }}.</strong> {{ arg }}
                </li>
              </ul>
            </details>
          </div>

          <!-- Result -->
          <div class="field full-width" v-if="data.result">
            <label>Result</label>
            <span :class="{ error: isErrorResult }">
              {{ isErrorResult ? parsedError : data.result }}
            </span>
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
let firstNodeInitialized = false

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
      isFirst: !firstNodeInitialized && (firstNodeInitialized = true),
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
      if (!Array.isArray(this.data.args)) return []
      return this.data.args.map((arg) => {
        try {
          const parsed = JSON.parse(arg)
          return Array.isArray(parsed) ? JSON.stringify(parsed) : parsed
        } catch {
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
      if (this.hasChildren) this.expanded = !this.expanded
    },
    onArgsToggle(event) {
      this.argsOpen = event.target.open
    },
    formatAmount(amount) {
      return amount.toLowerCase().includes('aergo') ? amount : `${amount} aer`
    },
  },
}
</script>

<style scoped lang="scss">
.tree-node {
  position: relative;
  margin-left: 20px;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: -10px;
    width: 1px;
    height: 103%;
    background-color: #e8e8e8;
  }

  &::after {
    content: '';
    position: absolute;
    top: 60px;
    left: -10px;
    width: 10px;
    height: 1px;
    background-color: #e8e8e8;
  }

  &:last-child::before {
    height: 67px;
  }
}

.tree-children {
  margin-left: 20px;
}

.node-content {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  transition: background-color 0.2s, border-color 0.2s;
  margin: 6px 0;
  cursor: default;

  &.clickable {
    cursor: pointer;

    &:hover {
      background-color: #f8f8f8;
    }

    &.args-open-highlight:hover {
      background-color: #f2f8ff;
    }
  }

  &.contract-highlight {
    background-color: #f6f6f6;
    border-color: #ddd;
  }

  &.args-open-highlight {
    background-color: #f2f8ff;
    border-color: #b8d3fc;
  }
}

.node-info {
  width: 100%;
}

.node-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;

  label {
    cursor: inherit;
    color: #1a1823;
    font-family: Lato;
    font-size: 13px;
    font-weight: 700;
    line-height: 24px;
    margin-bottom: 2px;
  }

  span {
    color: #666;
    font-family: Lato;
    font-size: 13px;
    font-weight: 500;
    line-height: 24px;
    word-break: break-word;
  }

  &.full-width {
    grid-column: 1 / -1;
  }
}

.args-toggle {
  summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    align-items: center;

    &::-webkit-details-marker {
      display: none;
    }

    .arg-count {
      margin-left: 4px;
      color: #bebbc1;
      font-family: Lato;
      font-size: 13px;
      font-weight: 700;
      line-height: 24px;
    }

    .icon {
      display: inline-block;
      transition: transform 0.2s ease;
    }
  }
}

.args-list {
  list-style: none;
  padding-left: 0;
  margin-top: 6px;

  li {
    font-family: 'Lato' monospace;
    font-size: 12px;
    color: #444;
    margin-bottom: 4px;
  }
}

.error {
  color: #d32f2f;
  font-weight: 500;
}
</style>
