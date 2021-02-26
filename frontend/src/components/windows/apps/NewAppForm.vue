<template>
  <form @submit.prevent="onSubmit" autocomplete="off">
    <h2>Create App</h2>
    <div>
      <label> App Name </label><br >
      <input type="text" model.lazy.trim="newName" required/>
    </div>
    <div>
      <label> Short Descripton </label><br >
      <input type="text" v-model.lazy.trim="newDesc" />
    </div>
    <div>
      <label> Path to index </label><br >
      <input type="text" v-model.lazy.trim="newPath" required/>
    </div>
    <div>
      <button type="submit" @click="createApp" class="emphasis">Create</button>
      <button type="button" @click="cancelForm">Cancel</button>
    </div>
  </form>
</template>

<script>
export default {
  props: {},
  methods: {
    cancelForm() {
      this.$emit("new-app-cancelled");
    },
    createApp() {
      this.$emit("new-app-created", this.data)
    }
  },
  computed: {},
  data() {
    return {
      newName: "",
      newDesc: "",
      newPath: "",
    };
  },
};
</script>

<style scoped>
form {
  padding: 1.5rem;
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
  margin: 0.5rem;
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
