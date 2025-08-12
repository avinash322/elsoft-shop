<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const username = ref("");
const password = ref("");
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");
const loading = ref(false);

const login = async () => {
  loading.value = true;

  try {
    const response = await axios.post("https://dummyjson.com/auth/login", {
      username: username.value,
      password: password.value,
    });

    if (response.data && response.data.accessToken) {
      snackbarMessage.value = "Login success!";
      snackbarColor.value = "success";
      snackbar.value = true;
      router.push("/dashboard");
    } else {
      snackbarMessage.value =
        "Login Failed. Please check your credensial and try again.";
      snackbarColor.value = "error";
      snackbar.value = true;
    }
  } catch (error) {
    snackbarMessage.value =
      "Login Failed. Please check your credensial and try again.";
    snackbarColor.value = "error";
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container
    fluid
    class="d-flex justify-center align-center"
    style="height: 100vh; background-color: #f9fafb"
  >
    <v-card elevation="2" width="400" class="pa-6">
      <v-card-title class="text-h5 text-center mb-2"> Sign in </v-card-title>
      <p class="text-subtitle-2 text-center mb-6">
        Enter your credentials to access the e-commerce dashboard
      </p>

      <v-text-field
        label="Username"
        v-model="username"
        variant="outlined"
        density="comfortable"
      ></v-text-field>

      <v-text-field
        label="Password"
        type="password"
        v-model="password"
        variant="outlined"
        density="comfortable"
      ></v-text-field>

      <v-btn block :loading="loading" color="black" class="mt-4" @click="login">
        Sign in
      </v-btn>

      <v-card class="mt-6 pa-4" color="blue-lighten-1" variant="tonal">
        <strong>Demo Credentials:</strong>
        <div>Username: emilys</div>
        <div>Password: emilyspass</div>
      </v-card>
    </v-card>
  </v-container>

  <v-snackbar
    v-model="snackbar"
    :color="snackbarColor"
    timeout="4000"
    location="bottom"
    vertical
  >
    {{ snackbarMessage }}
    <template #actions>
      <v-btn text @click="snackbar = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>
