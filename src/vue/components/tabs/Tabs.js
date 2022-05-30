export default {
  name: "vue-tabs",
  props: {
    value: [String, Number, Object],
    title: {
      type: String,
      default:"Result"
    },
    routeReplace: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      activeTabIndex: 0,
      tabs: []
    };
  },

  methods: {
    navigateToTab(index, route) {
      this.changeTab(this.activeTabIndex, index, route);
    },

    activateTab(index) {
      this.activeTabIndex = index;
      let tab = this.tabs[index];
      tab.active = true;
      this.$emit("input", tab.title);
    },

    changeTab(oldIndex, newIndex, route) {
      let oldTab = this.tabs[oldIndex] || {};
      let newTab = this.tabs[newIndex];
      if (newTab.disabled) return;
      this.activeTabIndex = newIndex;
      oldTab.active = false;
      newTab.active = true;
      this.$emit("input", this.tabs[newIndex].title);
      this.$emit("tab-change", newIndex, newTab, oldTab);
      this.tryChangeRoute(route);
    },

    tryChangeRoute(route) {
      if (this.$router && route) {
        if (this.routeReplace) {
          this.$router.replace(route);
        } else {
          this.$router.push(route);
        }
      }
    },

    addTab(item) {
      const index = this.$slots.default.indexOf(item.$vnode);
      this.tabs.splice(index, 0, item);
    },

    removeTab(item) {
      const tabs = this.tabs;
      const index = tabs.indexOf(item);

      if (index > -1) {
        tabs.splice(index, 1);
      }
    },

    getTabs() {
      if (this.$slots.default) {
        return this.$slots.default.filter(comp => comp.componentOptions);
      }
      return [];
    },

    findTabAndActivate(tabNameOrIndex) {
      let indexToActivate = this.tabs.findIndex(
        (tab, index) => tab.title === tabNameOrIndex || index === tabNameOrIndex
      );

      if (
        indexToActivate === this.activeTabIndex &&
        !this.tabs[this.activeTabIndex].active
      ) {
        this.tabs[this.activeTabIndex].active = true;
      }

      if (indexToActivate !== -1) {
        this.changeTab(this.activeTabIndex, indexToActivate);
      } else {
        this.changeTab(this.activeTabIndex, 0);
      }
    },

    renderTabTitle(index) {
      if (this.tabs.length === 0) return;
      let tab = this.tabs[index];
      let { active, title } = tab;
      if (tab.$slots.title) return tab.$slots.title;
      if (tab.$scopedSlots.title) {
        return tab.$scopedSlots.title({
          active: active,
          title: title,
          data: tab.tabData
        });
      }
      return title;
    },

    renderTabs() {
      const h = this.$createElement;
      return this.tabs.map((tab, index) => {
        if (!tab) return;
        let { route, title, tabId } = tab;
        let active = this.activeTabIndex === index;
        return h(
          "a",
          {
            attrs: {
              name: "tab",
              id: `t-${tabId}`,
              role: "tab"
            },
            on: {
              click: () => !tab.disabled && this.navigateToTab(index, route)
            },
            class: [
              "item", active && "router-link-exact-active", title && title.toLowerCase(),
            ],
            key: title
          },
          [ this.renderTabTitle(index) ]
        );
      });
    }
  },

  render(h) {
    const tabList = this.renderTabs();
    return h(
      "div",
      { class: "tabs"},
      [
        h("div", { class: "tabs-title" }, [ this.title ]),
      h("div", { class: "tabs-header", attrs: { role: "tablist" } }, [
          tabList
      ]),
      h("div", { class: "tabs-contents" }, [this.$slots.default])
    ]);
  },

  watch: {
    tabs(newList) {
      if (newList.length > 0 && !this.value) {
        if (newList.length <= this.activeTabIndex) {
          this.activateTab(this.activeTabIndex - 1);
        } else {
          this.activateTab(this.activeTabIndex);
        }
      }

      if (newList.length > 0 && this.value) {
        this.findTabAndActivate(this.value);
      }
    },

    value(newVal) {
      this.findTabAndActivate(newVal);
    }
  }
};
