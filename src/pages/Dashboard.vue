<script setup>
import { Subtitles } from "lucide-vue-next";
import { ref, onMounted, computed, reactive } from "vue";
import { fa } from "vuetify/locale";
import { Chart } from "chart.js/auto";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { VPie } from "vuetify/labs/VPie";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const drawer = ref(true);
const selected = ref({
  title: "Dashboard",
  subtitle: "Overview of your e-commerce metrics",
});

const loading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");

const items = [
  {
    title: "Dashboard",
    icon: "mdi-chart-multiple",
    subtitle: "Overview of your e-commerce metrics",
  },
  {
    title: "Products",
    icon: "mdi-cube-outline",
    subtitle: "Manage your product inventory",
  },
  {
    title: "Shop",
    icon: "mdi-shopping-outline",
    subtitle: "Browse and purchase products",
  },
  { title: "Cart", icon: "mdi-cart-outline" },
  { title: "Orders", icon: "mdi-history" },
];
const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const selectItem = (item) => {
  selected.value = item;
};

const user = ref([]);

const fetchUsers = () => {
  loading.value = true;
  fetch("https://dummyjson.com/users")
    .then((res) => res.json())
    .then((data) => {
      user.value = data.users || [];
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
    })
    .finally(() => {
      loading.value = false;
    });
};

// GRAPH
const labels = ["Jan", "Feb", "Mar", "Apr", "May"];
const dataPoints = [10, 20, 15, 30, 25];

const chartData = {
  labels: ["beauty", "fragances", "furniture", "groceries"],
  datasets: [
    {
      label: "Data",
      data: dataPoints,
      borderColor: "#9B85EB", // ungu lebih muda
      backgroundColor: "#9B85EB",
      borderWidth: 2,
      fill: false,
      tension: 0.3,
      borderDash: [5, 5], // garis putus-putus
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "white",
      titleColor: "black",
      bodyColor: "#9B85EB",
      borderColor: "#ccc",
      fill: false,
      borderDash: [5, 5],
      tension: 0.3,
      borderWidth: 1,
      titleFont: { weight: "bold" },
      callbacks: {
        title: (context) => {
          return context[0].label;
        },
        label: (context) => {
          return `count : ${context.formattedValue}`;
        },
      },
    },
  },
};

// PIE CHART
const chartPieData = [
  { title: "beauty", value: 5, color: "#4169E1" },
  { title: "groceries", value: 15, color: "#E57373" },
  { title: "fragnances", value: 5, color: "#81C784" },
  { title: "furniture", value: 5, color: "#FFD54F" },
];

// PRODUCTS
const products = ref([]);
const selectedCategory = ref(null);
const searchText = ref("");

const fetchProducts = async () => {
  loading.value = true;
  fetch("https://dummyjson.com/products")
    .then((res) => res.json())
    .then((data) => {
      products.value = data.products || [];
    })
    .catch((err) => {
      console.error("Failed to fetch products:", error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const categories = computed(() => {
  const cats = products.value.map((p) => capitalize(p.category));
  return [...new Set(cats)];
});

// Filter produk berdasarkan kategori
const filteredProducts = computed(() => {
  const search = (searchText.value || "").toLowerCase();
  const selected = selectedCategory.value;

  return products.value.filter((p) => {
    const name = (p.title || "").toLowerCase();
    const category = capitalize(p.category);

    const matchesCategory =
      !selected || selected === "All" || category === selected;
    const matchesName = !search || name.includes(search);

    return matchesCategory && matchesName;
  });
});

// Fungsi bantu truncate teks
const truncate = (text, length) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
};

// Fungsi capitalize kata pertama
const capitalize = (word) => {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
};

// Tombol Edit
const updateProductDialog = ref(false);

const editProduct = async () => {
  try {
    const response = await fetch(
      `https://dummyjson.com/products/${form.value.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.value.title,
          price: form.value.price,
          stock: form.value.stock,
          description: form.value.description,
          brand: form.value.brand,
          category: form.value.category,
        }),
      }
    );

    const updatedProduct = await response.json();

    // Update produk di UI
    const index = products.value.findIndex((p) => p.id === form.value.id);
    if (index !== -1) {
      products.value[index] = { ...updatedProduct };
    }

    snackbarMessage.value = "Product updated successfully!";
    snackbarColor.value = "success";
    snackbar.value = true;
    updateProductDialog.value = false;
  } catch (error) {
    console.error("Failed to update product:", error);
    snackbarMessage.value = "Failed to update product!";
    snackbarColor.value = "error";
    snackbar.value = true;
  }
};

// Tombol Delete
const deleteProduct = async (id) => {
  try {
    const response = await fetch(`https://dummyjson.com/products/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    console.log("Deleted product:", data);

    // Update UI local
    products.value = products.value.filter((p) => p.id !== id);

    snackbarMessage.value = "Product deleted successfully!";
    snackbarColor.value = "success";
    snackbar.value = true;
  } catch (error) {
    console.error("Failed to delete product:", error);
    snackbarMessage.value = "Failed to delete product.";
    snackbarColor.value = "error";
    snackbar.value = true;
  }
};

// add product
const newProductDialog = ref(false);

const form = ref({
  id: null,
  title: "",
  description: "",
  price: 0,
  stock: 0,
  brand: "",
  category: "",
});

const submitProduct = async () => {
  try {
    const response = await fetch("https://dummyjson.com/products/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form.value),
    });
    const data = await response.json();

    const lastId = products.value.length
      ? products.value[products.value.length - 1].id
      : 0;

    const newProduct = {
      ...form.value,
      id: lastId + 1,
    };

    products.value.push(newProduct); // Tambahkan produk baru ke daftar

    console.log("Product added:", products.value);
    snackbarMessage.value = "Product added successfully!";
    snackbarColor.value = "success";
    snackbar.value = true;

    // Tutup modal dan reset form jika perlu
    newProductDialog.value = false;
    form.value = {
      id: null,
      title: "",
      description: "",
      price: 0,
      category: "",
      brand: "",
      stock: 0,
    };

    // Bisa kasih alert atau snackbar sukses juga
  } catch (error) {
    console.error("Failed to add product:", error);
    snackbarMessage.value = "Failed to add product.";
    snackbarColor.value = "error";
    snackbar.value = true;
  }
};

onMounted(() => {
  fetchUsers();
  fetchProducts();
});
</script>

<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      :width="drawerWidth"
      :mini-variant="!drawer"
      mini-variant-width="60"
      class="sidebar"
      color="#FAF9F6"
    >
      <template v-slot:prepend>
        <v-list-item
          prepend-icon="mdi-shopping-outline"
          title="DummyJSON Store"
          subtitle="navigation"
          lines="one"
          style="display: flex; flex-direction: row; align-items: center"
        >
        </v-list-item>
      </template>
      <v-list>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          link
          @click="selectItem(item)"
          :class="{ 'active-item': selected === item.title }"
        ></v-list-item>
      </v-list>

      <!-- Footer -->
      <template v-slot:append>
        <v-divider></v-divider>
        <div
          class="sidebar-footer"
          style="
            padding: 16px;
            font-weight: 500;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <v-avatar size="32">
            <v-img
              :src="
                user?.[0]?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.[0]?.firstName || 'U'
                )}+${encodeURIComponent(
                  user?.[0]?.lastName || 'S'
                )}&background=random&color=fff&size=32`
              "
              alt="User Avatar"
            ></v-img>
          </v-avatar>

          <span>
            {{ user?.[0]?.firstName ?? "..." }}
            {{ user?.[0]?.lastName ?? "..." }}
          </span>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main app style="display: block">
      <div>
        <div style="padding-left: 10px">
          <v-btn icon variant="plain" @click="toggleDrawer">
            <v-icon>mdi-page-layout-sidebar-left</v-icon>
          </v-btn>
        </div>
        <v-divider thickness="2" />
      </div>

      <v-container
        fluid
        class="fill-height d-flex justify-center align-center"
        v-if="loading"
      >
        <v-progress-circular indeterminate color="black" size="120" />
      </v-container>

      <v-container v-else fluid>
        <template v-if="selected.title === 'Dashboard'">
          <!-- Layout header untuk tab lain -->
          <h1 class="title">{{ selected.title ?? "" }}</h1>
          <h2 class="h2-gray">{{ selected.subtitle ?? "" }}</h2>

          <divider class="divider-small" />

          <div class="row" style="gap: 8px">
            <v-container class="grey-container">
              <div class="row" style="justify-content: space-between">
                <h4 class="h4">Total Products</h4>
                <v-icon size="large">mdi-cube-outline</v-icon>
              </div>
              <h1 class="h1">194</h1>
              <h3 class="h3-gray">Available in store</h3>
            </v-container>

            <v-container class="grey-container">
              <div class="row" style="justify-content: space-between">
                <h4 class="h4">Total Users</h4>
                <v-icon size="large">mdi-account-multiple-outline</v-icon>
              </div>
              <h1 class="h1">208</h1>
              <h3 class="h3-gray">Registered customers</h3>
            </v-container>

            <v-container class="grey-container">
              <div class="row" style="justify-content: space-between">
                <h4 class="h4">Active Carts</h4>
                <v-icon size="large">mdi-cart-outline</v-icon>
              </div>
              <h1 class="h1">50</h1>
              <h3 class="h3-gray">Items in carts</h3>
            </v-container>

            <v-container class="grey-container">
              <div class="row" style="justify-content: space-between">
                <h4 class="h4">Total Revenue</h4>
                <v-icon size="large">mdi-chart-timeline-variant</v-icon>
              </div>
              <h1 class="h1">$589088.80</h1>
              <h3 class="h3-gray">From all carts</h3>
            </v-container>
          </div>

          <divider class="divider-small" />
          <div class="row" style="gap: 8px">
            <v-container class="grey-container">
              <h1 class="h1" style="font-weight: normal">
                Products by Category
              </h1>
              <h2 class="h2-gray" style="font-size: 20px">
                Distribution of products across categories
              </h2>
              <divider class="divider-xs" />

              <div style="height: 350px">
                <Bar :data="chartData" :options="chartOptions" />
              </div>
            </v-container>

            <v-container class="grey-container">
              <h1 class="h1" style="font-weight: normal">
                Category Distribution
              </h1>
              <h2 class="h2-gray" style="font-size: 20px">
                Pie chart view of product categories
              </h2>
              <divider class="divider-xs" />

              <div
                style="height: 350px"
                class="d-flex justify-center align-center"
              >
                <v-row align="center" no-gutters>
                  <!-- Pie Chart -->
                  <v-col cols="6" class="d-flex justify-center">
                    <v-pie
                      :items="chartPieData"
                      label="value"
                      color="color"
                      size="200"
                      tooltip
                    />
                  </v-col>

                  <!-- Legend -->
                  <v-col cols="6">
                    <v-list density="compact">
                      <v-list-item v-for="(item, i) in chartPieData" :key="i">
                        <v-list-item-avatar size="16">
                          <v-avatar :color="item.color" />
                        </v-list-item-avatar>
                        <v-list-item-title>
                          {{ item.title }} — {{ item.value }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </div>
            </v-container>
          </div>
        </template>
        <template v-else-if="selected.title === 'Products'">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <h1 class="title" style="margin: 0">{{ selected.title ?? "" }}</h1>
            <v-btn
              prepend-icon="mdi-plus"
              color="black"
              style="text-transform: capitalize"
              size="large"
              @click="
                {
                  form.id = null;
                  form.title = '';
                  form.description = '';
                  form.price = 0;
                  form.category = '';
                  form.brand = '';
                  form.stock = 0;
                  newProductDialog = true;
                }
              "
            >
              Add Product
            </v-btn>
          </div>
          <h2 class="h2-gray" style="margin-top: 8px">
            {{ selected.subtitle ?? "" }}
          </h2>

          <!-- MODAL ADD PRODUCT -->
          <v-dialog v-model="newProductDialog" max-width="500">
            <v-card>
              <v-card-title style="display: flex; align-items: center">
                <h3 class="h3" style="margin: 0">Add New Product</h3>
                <v-spacer></v-spacer>
                <v-btn icon @click="newProductDialog = false" variant="text">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-card-title>

              <v-card-subtitle class="h4">
                Create a new product for your store
              </v-card-subtitle>

              <v-card-text>
                <v-form @submit.prevent="submitProduct">
                  <v-text-field
                    v-model="form.title"
                    label="Title"
                    variant="outlined"
                    required
                  ></v-text-field>

                  <v-textarea
                    v-model="form.description"
                    label="Description"
                    variant="outlined"
                    required
                    auto-grow
                    rows="3"
                  ></v-textarea>

                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model.number="form.price"
                        label="Price"
                        type="number"
                        min="0"
                        variant="outlined"
                        required
                      ></v-text-field>
                    </v-col>

                    <v-col cols="6">
                      <v-text-field
                        v-model.number="form.stock"
                        label="Stock"
                        type="number"
                        min="0"
                        variant="outlined"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model="form.brand"
                        label="Brand"
                        variant="outlined"
                        required
                      ></v-text-field>
                    </v-col>

                    <v-col cols="6">
                      <v-select
                        v-model="form.category"
                        :items="categories"
                        label="Category"
                        variant="outlined"
                        required
                      ></v-select>
                    </v-col>
                  </v-row>

                  <v-card-actions class="justify-end">
                    <v-btn
                      color="black"
                      variant="elevated"
                      style="text-transform: capitalize"
                      @click="submitProduct"
                      >Add Product</v-btn
                    >
                  </v-card-actions>
                </v-form>
              </v-card-text>
            </v-card>
          </v-dialog>

          <v-container fluid>
            <!-- Filter kategori -->
            <div class="row" style="display: flex; gap: 8px">
              <v-text-field
                v-model="searchText"
                label="search products..."
                prepend-icon="mdi-magnify"
                variant="outlined"
                style="flex: 0 0 70%"
                hide-details
              ></v-text-field>

              <v-select
                v-model="selectedCategory"
                :items="categories"
                label="Filter by Category"
                style="flex: 0 0 30%; margin-top: 18px"
                clearable
                outlined
              ></v-select>
            </div>

            <!-- Grid produk -->
            <v-row dense>
              <v-col
                v-for="product in filteredProducts
                  .slice()
                  .sort((a, b) => b.id - a.id)"
                :key="product.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card>
                  <v-img
                    :src="
                      product.thumbnail ||
                      'https://via.placeholder.com/200x200?text=No+Image'
                    "
                    height="200px"
                  />

                  <v-card-title class="text-wrap">
                    {{ truncate(product.title, 20) }}
                  </v-card-title>

                  <v-card-subtitle>
                    {{ truncate(product.description, 70) }}
                  </v-card-subtitle>

                  <v-card-text class="mt-2">
                    <div class="row" style="justify-content: space-between">
                      <div class="text-h6 font-weight-bold">
                        ${{ product.price.toFixed(2) }}
                      </div>
                      <div class="d-flex align-center mt-1" style="gap: 4px">
                        <v-icon color="yellow darken-2" size="18"
                          >mdi-star</v-icon
                        >
                        <span>{{ product.rating?.toFixed(2) ?? "" }}</span>
                      </div>
                    </div>
                    <div class="mt-2">
                      <v-chip small outlined>{{
                        capitalize(product.category)
                      }}</v-chip>
                      <span class="grey--text text--darken-1 float-right"
                        >Stock: {{ product.stock }}</span
                      >
                    </div>
                  </v-card-text>

                  <v-card-actions>
                    <v-btn
                      variant="tonal"
                      icon
                      @click="
                        () => {
                          Object.assign(form, product);
                          updateProductDialog = true;
                        }
                      "
                      style="border-radius: 0"
                    >
                      <v-icon>mdi-pencil-outline</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="tonal"
                      @click="deleteProduct(product.id)"
                      style="border-radius: 0"
                    >
                      <v-icon>mdi-delete-outline</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
            <!-- MODAL UPDATE PRODUCT -->
            <v-dialog v-model="updateProductDialog" max-width="500">
              <v-card>
                <v-card-title style="display: flex; align-items: center">
                  <h3 class="h3" style="margin: 0">Edit Product</h3>
                  <v-spacer></v-spacer>
                  <v-btn
                    icon
                    @click="updateProductDialog = false"
                    variant="text"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-card-title>

                <v-card-subtitle class="h4">
                  Update product information
                </v-card-subtitle>

                <v-card-text>
                  <v-form @submit.prevent="editProduct()">
                    <v-text-field
                      v-model="form.title"
                      label="Title"
                      variant="outlined"
                      required
                    ></v-text-field>

                    <v-textarea
                      v-model="form.description"
                      label="Description"
                      variant="outlined"
                      required
                      auto-grow
                      rows="3"
                    ></v-textarea>

                    <v-row>
                      <v-col cols="6">
                        <v-text-field
                          v-model.number="form.price"
                          label="Price"
                          type="number"
                          min="0"
                          variant="outlined"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="6">
                        <v-text-field
                          v-model.number="form.stock"
                          label="Stock"
                          type="number"
                          min="0"
                          variant="outlined"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-card-actions class="justify-end">
                      <v-btn
                        color="black"
                        variant="elevated"
                        style="text-transform: capitalize"
                        @click="editProduct()"
                        >Update Product</v-btn
                      >
                    </v-card-actions>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-container>
        </template>
      </v-container>
    </v-main>
  </v-app>
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
