<template>
  <div :class="'terminal ' + size">
    <div class="search_box" v-if="inSearch">
      <input
        type="text"
        placeholder="Search here..."
        v-model.trim="searchTerm"
        ref="search"
      />
    </div>
    <div class="output" ref="output">
      <div
        :ref="'out_line'"
        v-for="i in shownlines"
        :key="Math.random().toString(36).substr(2, 9) + lines.indexOf(i)"
        v-html="i"
      ></div>
    </div>
    <div class="input_area">
      <div class="arrow">&gt;</div>
      <form @submit.prevent="sendCommand">
        <input
          type="text"
          class="command"
          ref="commandInput"
          :placeholder="commandMessage"
          v-model.lazy.trim="commandInput"
          @keyup.38="cyclePreviousCommands('backward')"
          @keyup.40="cyclePreviousCommands('forward')"
        />
      </form>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      size: "medium",
      commandInput: "",
      searchTerm: "",
      inSearch: false,
      lines: [],
      previousCommands: [],
    };
  },
  methods: {
    forceScroll() {
      const output_div = this.$refs.output;

      this.$nextTick(function () {
        output_div.scrollTop = output_div.scrollHeight;
      });
    },
    maybeScroll() {
      const output_div = this.$refs.output;
      const should_scroll =
        output_div.scrollTop > output_div.scrollHeight - 800 ? true : false;

      if (should_scroll) {
        this.$nextTick(function () {
          output_div.scrollTop = output_div.scrollHeight;
        });
      }
    },
    downloadLog() {
      const ouput_html = this.$refs.output.innerHTML;
      const output_linebreaks = ouput_html.replace(
        /(<div data-v-\S*="">|<br>)/gi,
        "%0D%0A"
      );
      const output_no_arrows = output_linebreaks.replace(/&gt; /gi, "");
      const output_text = output_no_arrows
        .replace(/(<([^>]+)>)/gi, "")
        .replace("%0D%0A%0D%0A", "");
      const link = document.createElement("a");
      const today = new Date();
      const date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      const time =
        today.getHours() + "." + today.getMinutes() + "." + today.getSeconds();
      const file_name = `${this.name} Log — ${date} — ${time}.txt`;

      link.setAttribute("download", file_name);
      link.setAttribute(
        "href",
        "data:" + "text/plain" + ";charset=utf-8," + output_text
      );
      link.click();
      this.$notify({
        title: "Downloaded Log",
        text: file_name,
        type: "success",
      });
    },
    setSize(size) {
      this.size = size;
      this.maybeScroll();
    },
    toggleSearch() {
      this.inSearch = !this.inSearch;
      this.searchTerm = "";
      if (this.inSearch) {
        this.$nextTick(function () {
          this.$refs.search.focus();
        });
      }
    },
    addLines(lines) {
      if (this.previousCommands == []) {
        lines.forEach((line) => this.lines.push(line));
      } else {
        lines.forEach((line) => {
          if (line.substring(0, 1) == "$") {
            this.lines.push(
              '<span style="color:#AAA">' +
                line.replace("$ ", '<span style="color:#34eb8c">$ </span>') +
                "</span>"
            );
          } else {
            this.lines.push(line);
          }
        });
      }
    },
    sendCommand() {
      if (this.commandInput != "exit") {
        this.$socket.emit("command", {
          command: this.commandInput,
          id: this.id,
        });
        this.previousCommands.unshift(this.commandInput);
        this.commandInput = "";
        this.forceScroll();
      } else {
        this.$notify({
          title: "Command cannot be 'exit'",
          type: "warn",
        });
      }
    },
    cyclePreviousCommands(direction) {
      if (this.previousCommands) {
        const current_index = this.previousCommands.indexOf(this.commandInput);
        switch (direction) {
          case "backward":
            if (current_index == -1) {
              this.commandInput = this.previousCommands[0];
            } else {
              this.commandInput = this.previousCommands[current_index + 1];
            }
            break;
          case "forward":
            if (current_index == -1) {
              this.commandInput = this.previousCommands[
                this.previousCommands.length
              ];
            } else {
              this.commandInput = this.previousCommands[current_index - 1];
            }
        }
      }
    },
    focusInput() {
      this.$nextTick(function () {
        this.$refs.commandInput.focus();
      });
    },
  },
  computed: {
    commandMessage() {
      return this.previousCommands.length > 0
        ? ""
        : "Type here and press enter to send a command ↵";
    },
    shownlines() {
      if (!this.inSearch) {
        return this.lines;
      } else {
        const filter = this.searchTerm.toLowerCase();
        const matching_lines = [];

        this.lines.forEach((line) => {
          if (line.toLowerCase().includes(filter)) {
            matching_lines.push(line);
          }
        });
        return matching_lines;
      }
    },
  },
  mounted() {
    this.forceScroll();
  },
};
</script>

<style scoped>
.terminal {
  background-color: black;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-family: monospace, monospace;
}

.output {
  overflow-y: scroll;
  padding-left: 0.5rem;
  scrollbar-color: grey transparent;
  scrollbar-width: thin;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 3rem - 8rem - var(--window_padding) - var(--window_padding))
}

.output > div {
  margin: 0rem 0;
  word-break: break-word;
}

.output::-webkit-scrollbar {
  width: 0.5rem;
}

.output::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

.output::-webkit-scrollbar-thumb {
  background-color: grey;
}

.input_area {
  border-top: 0.15rem solid rgba(255, 255, 255, 0.4);
  padding-left: 0.5rem;
}

.arrow {
  position: absolute;
  margin: 0.55rem 0 0.5rem 0.4rem;
}

.command {
  background-color: inherit;
  border: none;
  color: white;
  width: calc(100% - 2rem);
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  font-size: inherit;
}

::placeholder {
  font-size: 0.9rem;
}

.terminal > .output > div:first-child {
  margin-top: 0.3rem;
}

.terminal.large {
  font-size: 1rem;
}

.terminal.large > .output > div {
  line-height: 1.2rem;
}

.terminal.small {
  font-size: 0.8rem;
}

.terminal.small > .output > div {
  line-height: 0.9rem;
}

.search_box {
  position: absolute;
  right: 5rem;
  margin-top: 1rem;
}

.search_box > input {
  background-color: rgb(216, 216, 216);
  border: none;
  color: black;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-family: var(--font_family);
}
</style>