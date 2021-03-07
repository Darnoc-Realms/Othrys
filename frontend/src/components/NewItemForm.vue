<template>
  <form @submit.prevent="onSubmit" autocomplete="off">
    <h2>Create {{ itemName }}</h2>
    <div v-for="field in fields" :key="field.id">
      <label> {{ field.title }} </label><br />
      <input v-if="field.type == 'String'" type="text" v-model.lazy.trim="inputs[field.name]" />
      <div v-else-if="field.type == 'Array'">
        <div v-for="option in field.options" :key="option[0]" v>
          <input type="text" v-model.lazy.trim="inputs[option[0]]" :placeholder="option[1]" />
        </div>
      </div>
    </div>
    <div>
      <button type="submit" @click="createItem" class="emphasis">Create</button>
      <button type="button" @click="cancelForm">Cancel</button>
    </div>
  </form>
</template>

<script>
export default {
  props: {
    itemName: {
      type: String,
      required: true,
    },
    fields: {
      type: Array,
      required: false,
    },
  },
  methods: {
    cancelForm() {
      this.$emit("new-item-cancelled");
    },
    createItem() {
      let item = {}
      this.fields.forEach(field => {
        item[field.name] = this.inputs[field.name]
      })
      this.$emit("new-item-created", item);
    },
  },
  computed: {},
  data() {
    return {
      inputs: {}
    };
  },
};
</script>

<style scoped>
form {
  padding: 1.5rem;
  background-color: var(--container_color);
}

div {
  margin-top: 1rem;
}

h2 {
  font-size: 1.3rem;
  font-weight: 500;
}

input {
  width: calc(100% - 0.75rem);
  border: 0.1rem solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  margin-top: 0.3rem;
  background-color: var(--light_color);
  color: var(--dark_text);
  padding: 0.2rem 0.4rem;
}

input:focus {
  background-color: transparent;
  border: 0.1rem solid rgba(0, 0, 0, 0.4);
}

label {
  color: var(--medium_text);
}

button {
  background-color: var(--medium_color);
  margin: 0.5rem 1rem 0.5rem 0;
  padding: 0.3rem 1.2rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  color: inherit;
}

button.emphasis {
  background-color: var(--blue);
  color: white;
}
</style>
