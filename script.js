let products = [];
const itemsPerPage = 4;
let currentPage = 1;
let selectedCategories = [];
let searchTerm = '';
let selectedPriceRange = 0; // Initially set to 0

const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

async function fetchProducts() {
  document.getElementById('loader').style.display = 'flex';
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    products = await response.json();
    displayProducts(currentPage);
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    document.getElementById('loader').style.display = 'none';
  }
}

function filterProducts() {
  let filteredProducts = products;

  // Filter by search term
  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filter by selected categories
  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter((product) =>
      selectedCategories.includes(product.category)
    );
  }

  // Filter by price range
  if (selectedPriceRange > 0) {
    filteredProducts = filteredProducts.filter(
      (product) => product.price <= selectedPriceRange
    );
  }

  return filteredProducts;
}

function displayProducts(page, sortBy = 'default') {
  const productList = document.getElementById('product-list');
  let filteredProducts = filterProducts();

  // Sort the products based on the selected option
  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  // Paginate the products
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  productList.innerHTML = ''; // Clear current products before displaying new ones
  paginatedProducts.forEach((product) => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.innerHTML = `
      <img src="${product.image}" alt="${
      product.title
    }" style="width:100%; height:auto;">
      <h3>${truncateTitle(product.title, 30)}</h3>
      <p>$${product.price.toFixed(2)}</p>
    `;
    productList.appendChild(productDiv);
  });

  // Handle "Load More" button visibility
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  if (currentPage >= totalPages) {
    document.getElementById('loadMoreBtn').style.display = 'none';
  } else {
    document.getElementById('loadMoreBtn').style.display = 'inline-block';
  }
}

function truncateTitle(title, maxChars) {
  return title.length > maxChars ? title.slice(0, maxChars) + '...' : title;
}

document.getElementById('sort').addEventListener('change', function () {
  const sortValue = this.value;
  currentPage = 1; // Reset to first page when sorting changes
  document.getElementById('product-list').innerHTML = ''; // Clear current products
  displayProducts(currentPage, sortValue);
});

const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
categoryCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', function () {
    if (this.checked) {
      selectedCategories.push(this.value);
    } else {
      selectedCategories = selectedCategories.filter(
        (category) => category !== this.value
      );
    }
    currentPage = 1; // Reset to first page when categories change
    document.getElementById('product-list').innerHTML = ''; // Clear current products
    displayProducts(currentPage, document.getElementById('sort').value);
  });
});

document.getElementById('searchBtn').addEventListener('click', () => {
  searchTerm = document.getElementById('searchInput').value;
  currentPage = 1; // Reset to first page when search is triggered
  document.getElementById('product-list').innerHTML = ''; // Clear current products
  displayProducts(currentPage, document.getElementById('sort').value);
});

document.getElementById('loadMoreBtn').addEventListener('click', () => {
  currentPage++;
  displayProducts(currentPage, document.getElementById('sort').value);
});

// Price Range filter
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');
const progressBar = document.getElementById('progress');

// Update the progress bar based on the range value
priceRange.addEventListener('input', function () {
  selectedPriceRange = priceRange.value; // Set the selected price range
  priceValue.textContent = `$${selectedPriceRange}`; // Update the displayed value
  progressBar.style.width = (selectedPriceRange / priceRange.max) * 100 + '%'; // Update the progress bar width

  // Filter and display products based on the updated price range
  currentPage = 1; // Reset to first page when price range changes
  document.getElementById('product-list').innerHTML = ''; // Clear current products
  displayProducts(currentPage, document.getElementById('sort').value);
});

fetchProducts();
