<script setup>
import { Divide, Subtitles } from "lucide-vue-next";
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
import { consoleWarn } from "vuetify/lib/util/console.mjs";

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
  searchText.value = "";
  selectedCategory.value = "All";
  selectedSort.value = "Default";
  checkout.value = false;
};

const user = ref([]);

const fetchUsers = () => {
  loading.value = true;
  fetch("https://dummyjson.com/users")
    .then((res) => res.json())
    .then((data) => {
      user.value = data.users || [];
      if (user.value.length > 0) {
        firstName.value = user.value[0].firstName || "";
        lastName.value = user.value[0].lastName || "";
        Email.value = user.value[0].email || "";
        address.value = user.value[0].address?.address || "";
        phone.value = user.value[0].phone || "";
        city.value = user.value[0].address?.city || "";
        state.value = user.value[0].address?.state || "";
        zip.value = user.value[0].address?.postalCode || "";
      }
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

  let results = products.value.filter((p) => {
    const name = (p.title || "").toLowerCase();
    const category = capitalize(p.category);

    const matchesCategory =
      !selected || selected === "All" || category === selected;
    const matchesName = !search || name.includes(search);

    return matchesCategory && matchesName;
  });

  console.warn("Sorting products by:", results);

  switch (selectedSort.value) {
    case "Name-A-Z":
      console.warn("Sorting products by Name-A-Z", results);
      results.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "Price:Low to High":
      results.sort((a, b) => a.price - b.price);
      break;
    case "Price:High to Low":
      results.sort((a, b) => b.price - a.price);
      break;
    case "Highest Rated":
      results.sort((a, b) => b.rating - a.rating);
      break;
  }

  return results;
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

const productForm = ref(null);

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
  if (
    !form.value.title ||
    !form.value.description ||
    form.value.price === null ||
    form.value.price === "" ||
    form.value.stock === null ||
    form.value.stock === "" ||
    !form.value.brand ||
    !form.value.category
  ) {
    snackbarMessage.value = "Please fill in all fields!";
    snackbarColor.value = "info";
    snackbar.value = true;
    return;
  }
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

// SHOP

const selectedSort = ref(null);

const sortOptions = [
  "Default",
  "Name-A-Z",
  "Price:Low to High",
  "Price:High to Low",
  "Highest Rated",
];

const shopArray = ref([]);
const cartEmpty = computed(() => shopArray.value.length === 0);
// Subtotal per item
const subtotalPerItem = (product) =>
  (product.price * product.quantity).toFixed(2);
// Subtotal semua item
const subtotalItems = computed(() =>
  shopArray.value.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)
);
// Total items (misal ada tambahan fee 1 dollar)
const totalItems = computed(() =>
  (parseFloat(subtotalItems.value) + 1).toFixed(2)
);

// FORM ORDER
// shipping information
const firstName = ref("");
const lastName = ref("");
const Email = ref("");
const address = ref("");
const phone = ref("");
const city = ref("");
const state = ref("");
const zip = ref("");
// payment information
const cardName = ref("");
const cardNumber = ref("");
const cardExpiry = ref("");
const cardCVV = ref("");

const addToCart = async (product) => {
  try {
    const response = await fetch("https://dummyjson.com/carts/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 1,
        products: [
          {
            id: 1,
            quantity: 1,
          },
          {
            id: 2,
            quantity: 1,
          },
          {
            id: 3,
            quantity: 1,
          },
        ],
      }),
    });
    const data = await response.json();

    const existing = shopArray.value.find((p) => p.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      shopArray.value.push({
        ...product,
        quantity: 1,
      });
    }
    snackbarMessage.value = `${product.title} added to cart!`;
    snackbarColor.value = "success";
    snackbar.value = true;
  } catch (error) {
    console.error("Failed to added product:", error);
    snackbarMessage.value = "Failed to added product to chart.";
    snackbarColor.value = "error";
    snackbar.value = true;
  }
};

// CART
const removeCart = () => {
  shopArray.value = [];
  snackbarMessage.value = "Cart emptied!";
  snackbarColor.value = "success";
  snackbar.value = true;
  checkout.value = false;
};

const removeItemCart = (item) => {
  const index = shopArray.value.findIndex((p) => p.id === item.id);
  if (index !== -1) {
    shopArray.value.splice(index, 1);
    snackbarMessage.value = `${item.title} removed from cart!`;
    snackbarColor.value = "success";
    snackbar.value = true;
  }
};

const checkout = ref(false);

const completeOrder = () => {
  if (shopArray.value.length === 0) {
    snackbarMessage.value = "Your cart is empty!";
    snackbarColor.value = "error";
    snackbar.value = true;
    return;
  }

  if (
    !firstName.value ||
    !lastName.value ||
    !Email.value ||
    !address.value ||
    !phone.value ||
    !city.value ||
    !state.value ||
    !zip.value ||
    !cardName.value ||
    !cardNumber.value ||
    !cardExpiry.value ||
    !cardCVV.value
  ) {
    snackbarMessage.value = "Please fill in all fields!";
    snackbarColor.value = "info";
    snackbar.value = true;
    return;
  }
  historyArray.value.push({
    id: Math.floor(Math.random() * 10000000000000),
    items: [...shopArray.value],
    date: new Date().toLocaleDateString("en-GB"),
    firstName: firstName.value,
    lastName: lastName.value,
    email: Email.value,
    address: address.value,
    phone: phone.value,
    city: city.value,
    state: state.value,
    zip: zip.value,
    cardName: cardName.value,
    cardNumber: cardNumber.value,
    cardExpiry: cardExpiry.value,
    cardCVV: cardCVV.value,
    total: totalItems.value,
    subtotalItems: subtotalItems.value,
    subtotalPerItem: shopArray.value.map((item) => ({
      ...item,
      subtotal: (item.price * item.quantity).toFixed(2),
    })),
  });

  cardName.value = "";
  cardNumber.value = "";
  cardExpiry.value = "";
  cardCVV.value = "";

  console.log("Order completed:", shopArray.value);
  snackbarMessage.value = "Order completed successfully!";
  snackbarColor.value = "success";
  snackbar.value = true;

  // Clear cart after order completion
  shopArray.value = [];
  checkout.value = false;
};

// HISTORY ORDERS
const historyArray = ref([]);
const historyDetail = ref(false);
const selectedHistory = ref(null);

const openHistoryDetail = (history) => {
  historyDetail.value = true;
  selectedHistory.value = history;
};

const closeHistoryDetail = () => {
  historyDetail.value = false;
  selectedHistory.value = null;
};
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
        >
          <template
            #append
            v-if="item.title === 'Cart' && shopArray.length > 0"
          >
            <v-chip color="gray" size="small" label>
              {{ shopArray.reduce((sum, item) => sum + item.quantity, 0) }}
            </v-chip>
          </template>
        </v-list-item>
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
            <v-img :src="user?.[0]?.image" alt="User Avatar"></v-img>
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
                class="d-flex justify-center align-center;justify-content: center"
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
                <v-form ref="productForm">
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
                      'https://icons.veryicon.com/png/o/miscellaneous/fu-jia-intranet/product-29.png'
                    "
                    height="200px"
                  />

                  <v-card-title
                    class="text-wrap"
                    style="
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                  >
                    {{ truncate(product.title, 15) }}
                  </v-card-title>

                  <v-card-subtitle>
                    {{ truncate(product.description, 70) }}
                  </v-card-subtitle>

                  <v-card-text class="mt-2">
                    <div class="row" style="justify-content: space-between">
                      <div class="text-h4 font-weight-bold">
                        ${{ product.price.toFixed(2) }}
                      </div>
                      <div class="d-flex align-center mt-1" style="gap: 4px">
                        <v-icon color="yellow darken-2" size="18"
                          >mdi-star</v-icon
                        >
                        <span>{{ product.rating?.toFixed(2) ?? 0 }}</span>
                      </div>
                    </div>
                    <div class="mt-2">
                      <v-chip small outlined>{{
                        capitalize(product.category)
                      }}</v-chip>
                      <span class="grey--text text--darken-1 float-right">
                        {{ product.stock }}</span
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
        <template v-else-if="selected.title === 'Shop'">
          <h1 class="title" style="margin: 0">{{ selected.title ?? "" }}</h1>
          <h2 class="h2-gray" style="margin-top: 8px">
            {{ selected.subtitle ?? "" }}
          </h2>
          <v-container fluid>
            <!-- Filter kategori -->
            <div class="row" style="display: flex; gap: 8px">
              <v-text-field
                v-model="searchText"
                label="search products..."
                prepend-icon="mdi-magnify"
                variant="outlined"
                style="flex: 0 0 50%"
                hide-details
              ></v-text-field>

              <v-select
                v-model="selectedCategory"
                :items="categories"
                label="Filter by Category"
                style="flex: 0 0 25%; margin-top: 18px"
                clearable
                outlined
              ></v-select>

              <v-select
                v-model="selectedSort"
                :items="sortOptions"
                label="Default"
                style="flex: 0 0 25%; margin-top: 18px"
                clearable
                outlined
              ></v-select>
            </div>

            <!-- Grid produk -->
            <v-row dense>
              <v-col
                v-for="product in filteredProducts.slice()"
                :key="product.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card position="relative">
                  <v-chip
                    color="#ff0000"
                    text-color="white"
                    class="discount-chip"
                    variant="flat"
                  >
                    -{{ Math.round(product.discountPercentage) || 0 }}%
                  </v-chip>
                  <v-img
                    :src="
                      product.thumbnail ||
                      'https://icons.veryicon.com/png/o/miscellaneous/fu-jia-intranet/product-29.png'
                    "
                    height="200px"
                  />

                  <v-card-title
                    class="text-wrap"
                    style="
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                  >
                    {{ truncate(product.title, 15) }}
                  </v-card-title>

                  <v-card-subtitle>
                    {{ truncate(product.description, 70) }}
                  </v-card-subtitle>

                  <v-card-text class="mt-2">
                    <div class="row" style="justify-content: space-between">
                      <div class="row" style="justify-content: space-between">
                        <div class="text-h4 font-weight-bold">
                          ${{ product.price.toFixed(2) }}
                        </div>
                        <h3
                          class="text-grey text-decoration-line-through"
                          style="
                            font-weight: normal;
                            text-decoration-thickness: 3px;
                            text-decoration-color: black;
                          "
                        >
                          ${{
                            Number(
                              product.price *
                                (1 + (product.discountPercentage || 0) / 100)
                            ).toFixed(2)
                          }}
                        </h3>
                      </div>
                      <div class="d-flex align-center mt-1" style="gap: 4px">
                        <v-icon color="yellow darken-2" size="18"
                          >mdi-star</v-icon
                        >
                        <span>{{ product.rating?.toFixed(2) ?? 0 }}</span>
                      </div>
                    </div>
                    <div class="mt-2">
                      <v-chip small outlined>{{
                        capitalize(product.category)
                      }}</v-chip>
                      <span class="grey--text text--darken-1 float-right"
                        >{{ product.stock }} in Stock</span
                      >
                    </div>
                  </v-card-text>

                  <v-card-actions style="justify-content: center">
                    <v-btn
                      prepend-icon="mdi-cart-outline"
                      color="black"
                      style="text-transform: capitalize; width: 80%"
                      size="large"
                      variant="elevated"
                      @click="addToCart(product)"
                    >
                      Add to Chart
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </template>
        <template v-else-if="selected.title === 'Cart'">
          <v-container
            fluid
            class="d-flex flex-column align-center justify-center"
            v-if="cartEmpty"
          >
            <v-icon size="128" color="grey lighten-1"
              >mdi-shopping-outline</v-icon
            >
            <h1 class="title">Your Cart is Empty</h1>
            <h2 class="h2" style="font-weight: normal">
              Add some products to get started
            </h2>
            <divider class="divider-small" />
            <v-btn
              color="black"
              style="text-transform: capitalize; width: 30%"
              size="large"
              variant="elevated"
              @click="
                selectItem({
                  title: 'Shop',
                  subtitle: 'Browse and purchase products',
                })
              "
            >
              Continue Shopping
            </v-btn>
          </v-container>

          <v-container v-else fluid>
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <div>
                <h1 class="title" style="margin: 0">
                  {{ checkout ? "Checkout" : selected.title ?? "" }}
                </h1>
                <h2 class="h2-gray" style="margin-top: 8px">
                  {{
                    checkout
                      ? "Complete your purchase"
                      : shopArray.length + " items in your cart"
                  }}
                </h2>
              </div>
              <v-btn v-if="!checkout" @click="removeCart"> Clear cart </v-btn>
            </div>
            <v-container fluid style="gap: 2%">
              <v-row>
                <!-- Kiri 70% -->
                <v-col cols="12" md="8">
                  <!-- Looping container per product -->
                  <v-container
                    v-for="(product, index) in shopArray"
                    :key="product.id"
                    class="grey-container"
                    style="margin-bottom: 16px"
                    fluid
                    v-if="!checkout"
                  >
                    <v-row class="align-center" dense>
                      <!-- Icon / Image -->
                      <img
                        :src="
                          product.thumbnail ||
                          'https://icons.veryicon.com/png/o/miscellaneous/fu-jia-intranet/product-29.png'
                        "
                        height="150px"
                        width="150px"
                      />

                      <!-- Product info -->
                      <v-col>
                        <h3 class="h3 mb-1">{{ product.title }}</h3>
                        <h1 class="h1">${{ product.price.toFixed(2) }}</h1>
                      </v-col>

                      <!-- Quantity input -->
                      <v-col cols="4">
                        <v-number-input
                          control-variant="split"
                          :min="1"
                          v-model="product.quantity"
                          class="number-input-small"
                          style="width: 150%"
                        />
                      </v-col>

                      <!-- Total & Delete -->
                      <v-col
                        cols="auto"
                        class="d-flex flex-column align-center"
                      >
                        <h2 class="h2 mb-2">${{ subtotalPerItem(product) }}</h2>
                        <v-btn
                          icon
                          color="red"
                          variant="text"
                          @click="removeItemCart(product)"
                          style="width: 50px; height: 50px; border-radius: 50%"
                        >
                          <v-icon size="36">mdi-delete-outline</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>

                  <v-container fluid v-else-if="checkout" class="pa-0">
                    <v-container class="grey-container" fluid>
                      <h1 class="h1" styl>Shipping Information</h1>
                      <divider class="divider-xs" />
                      <v-row>
                        <v-col cols="12" md="6">
                          <h3>First Name</h3>
                          <v-text-field
                            variant="outlined"
                            required
                            v-model="firstName"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <h3>Last Name</h3>
                          <v-text-field
                            variant="outlined"
                            required
                            v-model="lastName"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" md="6">
                          <h3>Email</h3>
                          <v-text-field
                            variant="outlined"
                            required
                            v-model="Email"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <h3>Phone</h3>
                          <v-text-field
                            v-model="phone"
                            variant="outlined"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <h3>Address</h3>
                          <v-text-field
                            v-model="address"
                            variant="outlined"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" md="4">
                          <h3>City</h3>
                          <v-text-field
                            v-model="city"
                            variant="outlined"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                          <h3>State</h3>
                          <v-text-field
                            v-model="state"
                            variant="outlined"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                          <h3>Zip Code</h3>
                          <v-text-field
                            v-model="zip"
                            variant="outlined"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                    <Divider class="divider-xs" />
                    <v-container class="grey-container" fluid>
                      <h1 class="h1" styl>Payment Information</h1>
                      <divider class="divider-xs" />
                      <v-row>
                        <v-col>
                          <h3>Cardholder Name</h3>
                          <v-text-field
                            v-model="cardName"
                            variant="outlined"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <h3>Card Number</h3>
                          <v-text-field
                            v-model="cardNumber"
                            variant="outlined"
                            required
                            label="1234 5678 9012 3456"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" md="6">
                          <h3>Expiry</h3>
                          <v-text-field
                            v-model="cardExpiry"
                            variant="outlined"
                            required
                            label="MM/YY"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <h3>CVV</h3>
                          <v-text-field
                            v-model="cardCVV"
                            variant="outlined"
                            required
                            label="123"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-container>
                </v-col>

                <!-- Kanan 30% -->
                <v-col cols="12" md="4">
                  <v-container class="grey-container" v-if="!checkout">
                    <h2 class="h2">Order Summary</h2>
                    <v-container
                      class="row"
                      style="justify-content: space-between"
                    >
                      <h3 class="h3" style="font-weight: normal">Subtotal</h3>
                      <h3 class="h3" style="font-weight: normal">
                        ${{ subtotalItems }}
                      </h3>
                    </v-container>
                    <v-container
                      class="row"
                      style="justify-content: space-between"
                    >
                      <h3 class="h3" style="font-weight: normal">Shipping</h3>
                      <h3 class="h3" style="font-weight: normal">Free</h3>
                    </v-container>
                    <v-container
                      class="row"
                      style="justify-content: space-between"
                    >
                      <h3 class="h3" style="font-weight: normal">Tax</h3>
                      <h3 class="h3" style="font-weight: normal">$1.00</h3>
                    </v-container>
                    <v-divider class="divider-xs" thickness="2" />
                    <v-container
                      class="row"
                      style="justify-content: space-between"
                    >
                      <h3 class="h2">Total</h3>
                      <h3 class="h2">${{ totalItems }}</h3>
                    </v-container>
                    <v-btn
                      color="black"
                      style="text-transform: capitalize; width: 100%"
                      size="large"
                      variant="elevated"
                      class="mt-4"
                      @click="checkout = true"
                    >
                      Proceed to Checkout
                    </v-btn>
                    <v-btn
                      color="white"
                      style="text-transform: capitalize; width: 100%"
                      size="large"
                      variant="elevated"
                      class="mt-4"
                      @click="
                        selectItem({
                          title: 'Shop',
                          subtitle: 'Browse and purchase products',
                        })
                      "
                    >
                      Continue Shopping
                    </v-btn>
                  </v-container>
                  <v-container class="grey-container" v-else-if="checkout">
                    <h2 class="h2">Order Summary</h2>
                    <v-row
                      v-for="(product, index) in shopArray"
                      :key="product.id"
                      class="align-center mb-4"
                      dense
                    >
                      <!-- Icon -->
                      <img
                        :src="
                          product.thumbnail ||
                          'https://icons.veryicon.com/png/o/miscellaneous/fu-jia-intranet/product-29.png'
                        "
                        height="50px"
                      />

                      <!-- Product info -->
                      <v-col>
                        <h3
                          class="h3 mb-1"
                          style="
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            max-width: 200px;
                          "
                        >
                          {{ product.title }}
                        </h3>

                        <h3 class="h3-gray">Qty:{{ product.quantity }}</h3>
                      </v-col>

                      <!-- Total & delete -->
                      <v-col
                        cols="auto"
                        class="d-flex flex-column align-center"
                      >
                        <h2 class="h2 mb-2" style="font-weight: normal">
                          ${{ (product.price * product.quantity).toFixed(2) }}
                        </h2>
                      </v-col>
                    </v-row>
                    <v-divider class="divider-xs" thickness="2" />
                    <v-container
                      class="row"
                      style="justify-content: space-between"
                    >
                      <h3 class="h3" style="font-weight: normal">Subtotal</h3>
                      <h3 class="h3" style="font-weight: normal">
                        ${{ subtotalItems }}
                      </h3>
                    </v-container>
                    <v-container
                      class="row"
                      style="justify-content: space-between"
                    >
                      <h3 class="h3" style="font-weight: normal">Shipping</h3>
                      <h3 class="h3" style="font-weight: normal">Free</h3>
                    </v-container>
                    <v-container
                      class="row"
                      style="justify-content: space-between"
                    >
                      <h3 class="h3" style="font-weight: normal">Tax</h3>
                      <h3 class="h3" style="font-weight: normal">$1.00</h3>
                    </v-container>
                    <v-divider class="divider-xs" thickness="2" />
                    <v-container
                      class="row"
                      style="justify-content: space-between"
                    >
                      <h3 class="h2">Total</h3>
                      <h3 class="h2">${{ totalItems }}</h3>
                    </v-container>
                    <v-btn
                      color="black"
                      style="text-transform: capitalize; width: 100%"
                      size="large"
                      variant="elevated"
                      class="mt-4"
                      @click="completeOrder"
                    >
                      Complete Order
                    </v-btn>
                  </v-container>
                </v-col>
              </v-row>
            </v-container>
          </v-container>
        </template>

        <template v-else-if="selected.title === 'Orders'">
          <v-container
            fluid
            class="d-flex flex-column align-center justify-center"
            v-if="historyArray.length === 0"
          >
            <v-icon size="128" color="grey lighten-1">mdi-history</v-icon>
            <h1 class="title">Your Orders is Empty</h1>
            <h2 class="h2" style="font-weight: normal">
              Add some products to get started
            </h2>
            <divider class="divider-small" />
            <v-btn
              color="black"
              style="text-transform: capitalize; width: 30%"
              size="large"
              variant="elevated"
              @click="
                selectItem({
                  title: 'Shop',
                  subtitle: 'Browse and purchase products',
                })
              "
            >
              Continue Shopping
            </v-btn>
          </v-container>
          <v-container
            fluid
            class="d-flex flex-column justify-center"
            v-else-if="historyArray.length > 0"
          >
            <h1 class="title" style="margin: 0">Order History</h1>
            <h2 class="h2-gray" style="margin-top: 8px">
              Track and manage your orders
            </h2>
            <Divider class="divider-small" />
            <!-- Looping setiap order -->
            <div
              v-for="history in historyArray"
              :key="history.id"
              class="grey-container"
              style="
                padding: 16px;
                margin-bottom: 16px;
                display: flex;
                flex-direction: column;
              "
            >
              <!-- Header -->
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <div style="display: flex; align-items: center; gap: 8px">
                  <h1 style="font-weight: normal">Order #{{ history.id }}</h1>
                  <v-chip color="green" text-color="white" variant="elevated"
                    >Completed</v-chip
                  >
                </div>
                <v-btn
                  @click="openHistoryDetail(history)"
                  prepend-icon="mdi-eye-outline"
                  style="text-transform: capitalize"
                >
                  View Details
                </v-btn>
              </div>

              <!-- Info -->
              <div
                style="
                  display: flex;
                  gap: 8px;
                  margin-top: 8px;
                  align-items: center;
                "
              >
                <v-icon color="grey">mdi-calendar-outline</v-icon>
                <h3 class="h3-gray">{{ history.date }}</h3>
                <v-icon color="grey">mdi-currency-usd</v-icon>
                <h3 class="h3-gray">${{ history.total }}</h3>
                <v-icon color="grey">mdi-cube-outline</v-icon>
                <h3 class="h3-gray">{{ history.items.length }} items</h3>
              </div>

              <!-- Gambar produk -->
              <div
                style="
                  display: flex;
                  flex-direction: row;
                  flex-wrap: nowrap;
                  gap: 8px;
                  margin-top: 8px;
                  justify-content: flex-start;
                "
              >
                <img
                  v-for="item in history.items"
                  :key="item.id"
                  :src="
                    item.thumbnail ||
                    `https://icons.veryicon.com/png/o/miscellaneous/fu-jia-intranet/product-29.png`
                  "
                  height="100"
                  width="100"
                  style="flex-shrink: 0; display: block"
                />
              </div>
            </div>

            <!-- MODAL HISTORY DETAIL -->
            <!-- Dialog -->
            <v-dialog v-model="historyDetail" max-width="1000" scrollable>
              <template #default>
                <div class="dialog-scroll" v-if="selectedHistory">
                  <v-card style="padding: 20px">
                    <v-card-title style="display: flex; align-items: center">
                      <div class="column" style="align-items: flex-start">
                        <h2 class="h2" style="margin: 0">
                          Order #{{ selectedHistory.id }}
                        </h2>
                        <h3 class="h3-gray">
                          Order placed on {{ selectedHistory.date }}
                        </h3>
                      </div>
                      <v-spacer></v-spacer>
                      <v-btn icon @click="closeHistoryDetail" variant="text">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </v-card-title>

                    <v-card-text>
                      <!-- Total -->
                      <v-row class="mb-2">
                        <v-col cols="6">
                          <h2 class="h2">Order Status</h2>
                          <v-chip
                            color="green"
                            text-color="white"
                            variant="elevated"
                          >
                            Completed
                          </v-chip>
                        </v-col>
                        <v-col cols="6">
                          <h2 class="h2">Total Amount</h2>
                          <h2 class="h1">${{ selectedHistory.total }}</h2>
                        </v-col>
                      </v-row>

                      <divider class="divider-small" />
                      <h2 class="h2">Items Ordered</h2>
                      <divider class="divider-xs" />
                      <v-container
                        v-for="item in selectedHistory.items"
                        :key="item.id"
                        class="grey-container mb-2"
                      >
                        <v-row class="align-center" no-gutters>
                          <v-col cols="auto">
                            <v-img
                              :src="
                                item.thumbnail ||
                                'https://icons.veryicon.com/png/o/miscellaneous/fu-jia-intranet/product-29.png'
                              "
                              height="75"
                              width="75"
                            ></v-img>
                          </v-col>

                          <v-col>
                            <h2 class="h2 mb-1" style="font-weight: normal">
                              {{ item.title }}
                            </h2>
                            <h3 class="h3-gray mb-0">
                              Quantity: {{ item.quantity }} x ${{ item.price }}
                            </h3>
                          </v-col>

                          <v-col
                            cols="auto"
                            class="d-flex align-center justify-end"
                          >
                            <h2 class="h2">
                              ${{ (item.price * item.quantity).toFixed(2) }}
                            </h2>
                          </v-col>
                        </v-row>
                      </v-container>

                      <divider class="divider-small" />
                      <h2 class="h2">Shipping Information</h2>
                      <divider class="divider-xs" />
                      <v-container class="grey-fill-container">
                        <h3 class="h3">
                          {{ selectedHistory.firstName }}
                          {{ selectedHistory.lastName }}
                        </h3>
                        <h3 class="h3" style="font-weight: normal">
                          {{ selectedHistory.address }}
                        </h3>
                        <h3 class="h3" style="font-weight: normal">
                          {{ selectedHistory.city }},
                          {{ selectedHistory.state }} {{ selectedHistory.zip }}
                        </h3>
                        <h3
                          class="h3"
                          style="color: #868686; font-weight: normal"
                        >
                          Email: {{ selectedHistory.email }}
                        </h3>
                        <h3
                          class="h3"
                          style="color: #868686; font-weight: normal"
                        >
                          Phone: {{ selectedHistory.phone }}
                        </h3>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </div>
              </template>
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
