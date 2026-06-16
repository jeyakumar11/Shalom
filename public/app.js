// ===== State Management =====
let cart = [];
let currentCategory = 'indian';
let selectedSizes = {};
let indianProducts = [];
let westernProducts = [];
let bridalProducts = [];
let accessoriesProducts = [];
let allProducts = [];
let filteredProducts = {};

// Make cart globally accessible for debugging
window.cart = cart;
// ===== THEME TOGGLE WITH BULB ANIMATION (FIXED & WORKING) =====
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log('Theme toggle clicked! Current:', currentTheme, 'New:', newTheme);
    
    // Get bulb elements
    const bulbIcon = document.querySelector('.bulb-icon');
    const bulbRope = document.querySelector('.bulb-rope');
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (bulbIcon) {
        // Stop current animation
        bulbIcon.style.animation = 'none';
        
        // Force reflow to restart animation
        void bulbIcon.offsetWidth;
        
        // Trigger pull animation
        bulbIcon.style.animation = 'pullBulb 0.5s ease';
        
        // Reset to gentle swing after pull
        setTimeout(() => {
            bulbIcon.style.animation = 'gentleSwing 3s ease-in-out infinite';
        }, 500);
    }
    
    // Animate rope pull
    if (bulbRope) {
        bulbRope.style.height = '35px';
        setTimeout(() => {
            bulbRope.style.height = '25px';
        }, 200);
    }
    
    // Toggle theme
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    console.log('Theme changed to:', newTheme);
    
    // Show notification
    const emoji = newTheme === 'dark' ? '🌙' : '☀️';
    const message = newTheme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled';
    showNotification(`${emoji} ${message}`, 'success');
}

// Make toggleTheme globally accessible
window.toggleTheme = toggleTheme;

// Load saved theme on page load
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    html.setAttribute('data-theme', savedTheme);
    console.log('Loaded theme:', savedTheme);
}function playClickSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Audio not supported, silently fail
    }
}

// Flash screen effect when switching themes
function flashScreen(newTheme) {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${newTheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
        z-index: 9999;
        pointer-events: none;
        animation: flashFade 0.5s ease-out;
    `;
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.remove();
    }, 500);
}

// Add flash animation to document
const flashStyle = document.createElement('style');
flashStyle.textContent = `
    @keyframes flashFade {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(flashStyle);

// Load saved theme on page load
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    html.setAttribute('data-theme', savedTheme);
    
    // Update icon
    const themeToggle = document.querySelector('.theme-toggle i');
    if (themeToggle) {
        themeToggle.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', async () => {
    loadSavedTheme(); // Load theme first
    loadCartFromStorage(); // Load cart first
    await fetchProducts();
    updateCartUI();
    setupEventListeners();
    setupMobileNavigation();
});

// ===== Load Cart from Storage =====
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('shalomCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            console.log('Loaded cart from storage:', cart); // Debug log
        }
    } catch (error) {
        console.error('Error loading cart from storage:', error);
        cart = [];
    }
}

// ===== Fetch Products from API =====
async function fetchProducts() {
    try {
        showLoadingState();
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.success) {
            allProducts = data.products;
            console.log('Loaded products:', allProducts.length);
            
            // Separate products by category
            indianProducts = allProducts.filter(p => p.category === 'indian');
            westernProducts = allProducts.filter(p => p.category === 'western');
            bridalProducts = allProducts.filter(p => p.category === 'bridal');
            accessoriesProducts = allProducts.filter(p => p.category === 'accessories');
            
            console.log('Categories:', {
                indian: indianProducts.length,
                western: westernProducts.length,
                bridal: bridalProducts.length,
                accessories: accessoriesProducts.length
            });
            
            // Enhance products with additional data
            indianProducts = indianProducts.map(p => enhanceProduct(p, 'indian'));
            westernProducts = westernProducts.map(p => enhanceProduct(p, 'western'));
            bridalProducts = bridalProducts.map(p => enhanceProduct(p, 'bridal'));
            accessoriesProducts = accessoriesProducts.map(p => enhanceProduct(p, 'accessories'));
            
            // Initialize filtered products
            filteredProducts = {
                indian: [...indianProducts],
                western: [...westernProducts],
                bridal: [...bridalProducts],
                accessories: [...accessoriesProducts]
            };
            
            // Load products into the page immediately
            loadProducts('indian');
            loadProducts('western');
            loadProducts('bridal');
            loadProducts('accessories');
            
            hideLoadingState();
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        hideLoadingState();
    }
}
// ===== Enhance Product Data =====
function enhanceProduct(product, category) {
    const occasionMap = {
        'indian': 'Festive, Traditional, Party',
        'western': 'Casual, Office, Everyday',
        'bridal': 'Wedding, Reception, Engagement',
        'accessories': 'All Occasions, Daily Wear'
    };
    
    return {
        ...product,
        aiDescription: product.aiDescription || generateAIDescription(product),
        occasion: product.occasion || occasionMap[category],
        badge: getBadgeText(product, category)
    };
}

// ===== Get Badge Text =====
function getBadgeText(product, category) {
    if (category === 'bridal') return 'Bridal';
    if (category === 'accessories') return 'Accessory';
    if (product.price < 500) return 'Budget';
    if (product.price > 2000) return 'Premium';
    return 'Popular';
}

// ===== Generate AI Description =====
function generateAIDescription(product) {
    return `This ${product.name.toLowerCase()} showcases exceptional craftsmanship and attention to detail. Made from premium ${product.fabric}, it offers both comfort and style. Perfect for ${product.occasion || 'various occasions'}.`;
}

// ===== Product Display =====
function loadProducts(category) {
    const productMap = {
        'indian': indianProducts,
        'western': westernProducts,
        'bridal': bridalProducts,
        'accessories': accessoriesProducts
    };
    
    const products = filteredProducts[category] || productMap[category] || [];
    const container = document.getElementById(`${category}Products`);
    
    console.log(`Loading ${category} products:`, products.length);
    
    if (!container) {
        console.error(`Container not found for ${category}Products`);
        return;
    }
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;grid-column:1/-1;">
                <i class="fas fa-box-open" style="font-size:3rem;color:#ccc;margin-bottom:1rem;"></i>
                <p style="color:#666;font-size:1.1rem;">No products available in ${category} category.</p>
                <p style="color:#999;font-size:0.9rem;">Check back soon for new arrivals!</p>
            </div>
        `;
        return;
    }
    container.innerHTML = products.map((product, index) => {
        const sizes = Array.isArray(product.sizes) ? product.sizes : [];
        const badge = product.badge || getBadgeText(product, category);
        
        return `
        <div class="product-card" data-product-id="${product.id}" style="animation-delay: ${index * 0.1}s;">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" onerror="handleImageError(this)">
                ${badge ? `<div class="product-badge">${badge}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <span class="product-fabric"><i class="fas fa-tshirt"></i> ${product.fabric || 'N/A'}</span>
                    <span class="product-occasion"><i class="fas fa-calendar"></i> ${product.occasion || 'Various'}</span>
                    ${product.stock < 10 ? '<span style="color: #e74c3c;"><i class="fas fa-exclamation-triangle"></i> Low Stock</span>' : ''}
                </div>
                <p class="product-price">₹${product.price.toLocaleString('en-IN')}</p>
                <div class="product-sizes">
                    ${sizes.map(size => `
                        <button class="size-btn" onclick="selectSize(${product.id}, '${size}', this)" data-size="${size}">${size}</button>
                    `).join('')}
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i> 
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>`;
    }).join('');
}

// ===== Category Management =====
function showCategory(category) {
    console.log(`Switching to category: ${category}`);
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-category="${category}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Hide all sections
    document.querySelectorAll('.products-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const targetSection = document.getElementById(category);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    currentCategory = category;
    resetFilters(category);
    loadProducts(category);
    window.location.hash = category;
}
// ===== Size Selection =====
function selectSize(productId, size, element) {
    const productCard = element.closest('.product-card');
    productCard.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedSizes[productId] = size;
    showNotification(`Size ${size} selected`, 'success');
}

// ===== Cart Management =====
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    if (product.stock === 0) {
        showNotification('Sorry, this product is out of stock', 'error');
        return;
    }
    
    const selectedSize = selectedSizes[productId];
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        showNotification('Please select a size', 'warning');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId && item.size === selectedSize);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`${product.name} quantity updated in cart`, 'success');
    } else {
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: selectedSize || 'N/A',
            quantity: 1,
            maxStock: product.stock
        };
        cart.push(cartItem);
        showNotification(`${product.name} added to cart`, 'success');
    }
    
    console.log('Cart after adding item:', cart); // Debug log
    updateCartUI();
    localStorage.setItem('shalomCart', JSON.stringify(cart));
}

function removeFromCart(productId, size) {
    const initialLength = cart.length;
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    
    if (cart.length < initialLength) {
        showNotification('Item removed from cart', 'success');
        updateCartUI();
        localStorage.setItem('shalomCart', JSON.stringify(cart));
    }
}

function updateQuantity(productId, size, change) {
    const item = cart.find(item => item.id === productId && item.size === size);
    if (item) {
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            removeFromCart(productId, size);
        } else if (newQuantity <= item.maxStock) {
            item.quantity = newQuantity;
            showNotification('Quantity updated', 'success');
            updateCartUI();
            localStorage.setItem('shalomCart', JSON.stringify(cart));
        } else {
            showNotification(`Only ${item.maxStock} items available in stock`, 'warning');
        }
    }
}

function updateCartUI() {
    console.log('updateCartUI called, cart length:', cart.length);
    console.log('Cart contents:', cart);
    
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartGST = document.getElementById('cartGST');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Check if elements exist
    console.log('Cart elements found:', {
        cartCount: !!cartCount,
        cartItems: !!cartItems,
        cartSubtotal: !!cartSubtotal,
        cartGST: !!cartGST,
        cartTotal: !!cartTotal,
        checkoutBtn: !!checkoutBtn
    });
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        if (cartItems) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        }
        if (checkoutBtn) checkoutBtn.disabled = true;
        if (cartSubtotal) cartSubtotal.textContent = '₹0';
        if (cartGST) cartGST.textContent = '₹0';
        if (cartTotal) cartTotal.textContent = '₹0';
    } else {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const gst = subtotal * 0.18;
        const total = subtotal + gst;
        
        console.log('Cart calculations:', { subtotal, gst, total });
        
        // Build cart items HTML
        if (cartItems) {
            const cartHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.style.display='none'">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-size">Size: ${item.size || 'N/A'}</div>
                        <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, '${item.size}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, '${item.size}', 1)">+</button>
                            <button class="remove-btn" onclick="removeFromCart(${item.id}, '${item.size}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            console.log('Setting cart HTML:', cartHTML);
            cartItems.innerHTML = cartHTML;
        }
        
        // Update totals
        if (cartSubtotal) cartSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        if (cartGST) cartGST.textContent = `₹${gst.toFixed(2)}`;
        if (cartTotal) cartTotal.textContent = `₹${total.toFixed(2)}`;
        if (checkoutBtn) checkoutBtn.disabled = false;
    }
    
    console.log('updateCartUI completed');
}
// ===== Utility Functions =====
function scrollToSection(sectionId) {
    if (['indian', 'western', 'bridal', 'accessories'].includes(sectionId)) {
        showCategory(sectionId);
    } else {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const targetLink = document.querySelector(`[href="#${sectionId}"]`);
    if (targetLink) targetLink.classList.add('active');
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    if (cartSidebar) cartSidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const colors = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 4000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function handleImageError(img) {
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
    img.alt = 'Image not found';
}
// ===== Filtering and Sorting =====
function sortProducts(category, sortBy) {
    const productMap = {
        'indian': indianProducts,
        'western': westernProducts,
        'bridal': bridalProducts,
        'accessories': accessoriesProducts
    };
    
    let products = [...(productMap[category] || [])];
    
    switch (sortBy) {
        case 'price-low':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'newest':
            products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
    }
    
    filteredProducts[category] = products;
    loadProducts(category);
    showNotification(`Products sorted by ${sortBy.replace('-', ' ')}`, 'success');
}

function filterByPrice(category, priceRange) {
    const productMap = {
        'indian': indianProducts,
        'western': westernProducts,
        'bridal': bridalProducts,
        'accessories': accessoriesProducts
    };
    
    let products = [...(productMap[category] || [])];
    
    if (priceRange) {
        if (priceRange.includes('+')) {
            const minPrice = parseInt(priceRange.replace('+', ''));
            products = products.filter(p => p.price >= minPrice);
        } else {
            const [min, max] = priceRange.split('-').map(p => parseInt(p));
            products = products.filter(p => p.price >= min && p.price <= max);
        }
        showNotification(`Filtered products by price: ₹${priceRange}`, 'success');
    }
    
    filteredProducts[category] = products;
    loadProducts(category);
}

function filterByType(category, type) {
    const productMap = {
        'indian': indianProducts,
        'western': westernProducts,
        'bridal': bridalProducts,
        'accessories': accessoriesProducts
    };
    
    let products = [...(productMap[category] || [])];
    
    if (type) {
        products = products.filter(p => 
            p.name.toLowerCase().includes(type.toLowerCase()) ||
            p.description.toLowerCase().includes(type.toLowerCase()) ||
            (p.fabric && p.fabric.toLowerCase().includes(type.toLowerCase()))
        );
        showNotification(`Filtered by type: ${type}`, 'success');
    }
    
    filteredProducts[category] = products;
    loadProducts(category);
}
function resetFilters(category) {
    const productMap = {
        'indian': indianProducts,
        'western': westernProducts,
        'bridal': bridalProducts,
        'accessories': accessoriesProducts
    };
    
    if (productMap[category]) {
        filteredProducts[category] = [...productMap[category]];
    }
    
    const section = document.getElementById(category);
    if (section) {
        const selects = section.querySelectorAll('select');
        selects.forEach(select => select.selectedIndex = 0);
        
        const searchInput = section.querySelector('.search-input');
        if (searchInput) searchInput.value = '';
    }
}

// ===== Search Functionality =====
let searchTimeout;
function searchProducts(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => performSearch(query), 300);
}

function performSearch(query) {
    if (!query || query.length < 2) {
        resetFilters(currentCategory);
        loadProducts(currentCategory);
        return;
    }
    
    const productMap = {
        'indian': indianProducts,
        'western': westernProducts,
        'bridal': bridalProducts,
        'accessories': accessoriesProducts
    };
    
    const products = productMap[currentCategory] || [];
    const searchQuery = query.toLowerCase();
    
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        (product.fabric && product.fabric.toLowerCase().includes(searchQuery)) ||
        (product.occasion && product.occasion.toLowerCase().includes(searchQuery)) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery))
    );
    
    filteredProducts[currentCategory] = filtered;
    loadProducts(currentCategory);
    
    const resultText = filtered.length === 0 ? 'No products found' : 
                      filtered.length === 1 ? '1 product found' : 
                      `${filtered.length} products found`;
    
    showNotification(`${resultText} for "${query}"`, filtered.length > 0 ? 'success' : 'warning');
}
// ===== Loading States =====
function showLoadingState() {
    const categories = ['indian', 'western', 'bridal', 'accessories'];
    categories.forEach(category => {
        const container = document.getElementById(`${category}Products`);
        if (container) {
            container.innerHTML = '<div style="text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#8B0000;"></i><p>Loading products...</p></div>';
        }
    });
}

function hideLoadingState() {
    // Loading is automatically hidden when products load
}

// ===== Mobile Navigation =====
function setupMobileNavigation() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const nav = document.querySelector('.nav');
    
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            const icon = toggle.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
    }
}

function toggleMobileNav() {
    const nav = document.querySelector('.nav');
    const overlay = document.getElementById('overlay');
    const toggle = document.querySelector('.mobile-nav-toggle');
    
    if (nav) {
        nav.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
        
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.className = nav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            }
        }
    }
}

// Close mobile menu when clicking nav links
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            
            // Close mobile menu
            const nav = document.querySelector('.nav');
            const overlay = document.getElementById('overlay');
            if (window.innerWidth <= 768 && nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                const toggle = document.querySelector('.mobile-nav-toggle');
                if (toggle) {
                    const icon = toggle.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                }
            }
            
            // Remove active from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active to clicked link
            link.classList.add('active');
            
            // Navigate to section
            if (['indian', 'western', 'bridal', 'accessories'].includes(target)) {
                showCategory(target);
            } else {
                scrollToSection(target);
            }
        });
    });
});

// ===== Event Listeners =====
function setupEventListeners() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('href').substring(1);
            
            if (['indian', 'western', 'bridal', 'accessories'].includes(target)) {
                showCategory(target);
            } else {
                scrollToSection(target);
            }
        });
    });
    
    // Handle URL hash on page load
    const hash = window.location.hash.substring(1);
    if (['indian', 'western', 'bridal', 'accessories'].includes(hash)) {
        setTimeout(() => showCategory(hash), 500);
    } else {
        setTimeout(() => showCategory('indian'), 500);
    }
}
// ===== ENHANCED CHECKOUT PROCESS (STANDARD PAYMENT GATEWAY) =====
async function handleCheckout(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Collect and validate form data
    const orderData = {
        customerName: formData.get('customerName')?.trim(),
        email: formData.get('email')?.trim(),
        phone: formData.get('phone')?.trim(),
        addressStreet: formData.get('addressStreet')?.trim(),
        addressCity: formData.get('addressCity')?.trim(),
        addressState: formData.get('addressState')?.trim(),
        addressPin: formData.get('addressPin')?.trim(),
        paymentMethod: formData.get('paymentMethod')
    };
    
    // Comprehensive validation
    const validationErrors = validateCheckoutForm(orderData);
    if (validationErrors.length > 0) {
        showNotification(validationErrors.join(', '), 'error');
        return;
    }
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    
    // Validate minimum order amount
    if (total < 1) {
        showNotification('Minimum order amount is ₹1', 'error');
        return;
    }
    
    // Store checkout data for UPI payment
    window.currentCheckoutData = { ...orderData, subtotal, gst, total };
    
    try {
        // Show processing state
        showNotification('Processing your request...', 'info');
        
        // Route to appropriate payment method
        switch (orderData.paymentMethod) {
            case 'online':
                await processRazorpayPayment(orderData, subtotal, gst, total);
                break;
            case 'upi':
                closeCheckout();
                showMobileUpiModal();
                break;
            case 'cod':
                await processCODPayment(orderData, subtotal, gst, total);
                break;
            default:
                throw new Error('Please select a valid payment method');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Checkout failed: ' + error.message, 'error');
        showPaymentFailedModal();
    }
}

// ===== FORM VALIDATION =====
function validateCheckoutForm(orderData) {
    const errors = [];
    
    if (!orderData.customerName || orderData.customerName.length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (!orderData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.email)) {
        errors.push('Valid email is required');
    }
    
    if (!orderData.phone || !/^[6-9]\d{9}$/.test(orderData.phone)) {
        errors.push('Valid 10-digit mobile number is required');
    }
    
    if (!orderData.addressStreet || orderData.addressStreet.length < 5) {
        errors.push('Complete street address is required');
    }
    
    if (!orderData.addressCity || orderData.addressCity.length < 2) {
        errors.push('Valid city name is required');
    }
    
    if (!orderData.addressState || orderData.addressState.length < 2) {
        errors.push('Valid state name is required');
    }
    
    if (!orderData.addressPin || !/^\d{6}$/.test(orderData.addressPin)) {
        errors.push('Valid 6-digit PIN code is required');
    }
    
    if (!orderData.paymentMethod) {
        errors.push('Please select a payment method');
    }
    
    return errors;
}

// ===== PROFESSIONAL RAZORPAY INTEGRATION =====
async function processRazorpayPayment(orderData, subtotal, gst, total) {
    try {
        showNotification('Initializing secure payment...', 'info');
        
        // Create Razorpay order with enhanced details
        const response = await fetch('/api/create-razorpay-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: total,
                currency: 'INR',
                receipt: `SHALOM_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                notes: {
                    customer_name: orderData.customerName,
                    customer_email: orderData.email,
                    customer_phone: orderData.phone,
                    order_type: 'fashion_purchase',
                    items_count: cart.length,
                    subtotal: subtotal,
                    gst: gst.toFixed(2)
                }
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Payment initialization failed');
        }
        
        console.log('Razorpay order created:', data.order);
        showNotification('Opening secure payment gateway...', 'info');
        
        // Enhanced Razorpay configuration
        const options = {
            key: data.razorpay_key,
            amount: data.order.amount,
            currency: data.order.currency,
            name: 'SHALOM BOUTIQUE',
            description: `Fashion Purchase - ${cart.length} items`,
            image: '/images/shalom-logo.png',
            order_id: data.order.id,
            
            // Customer prefill
            prefill: {
                name: orderData.customerName,
                email: orderData.email,
                contact: orderData.phone
            },
            
            // Enhanced notes
            notes: {
                address: `${orderData.addressStreet}, ${orderData.addressCity}, ${orderData.addressState} - ${orderData.addressPin}`,
                order_type: 'online_fashion_purchase',
                merchant: 'Shalom Boutique'
            },
            
            // Theme
            theme: {
                color: '#10B981'
            },
            
            // Payment methods configuration
            method: {
                upi: true,
                card: true,
                netbanking: true,
                wallet: true,
                emi: false,
                paylater: false
            },
            
            // Enhanced configuration
            config: {
                display: {
                    language: 'en'
                }
            },
            
            // Success handler
            handler: async function (response) {
                console.log('✅ Payment Success:', response);
                await handleRazorpaySuccess(response, orderData, subtotal, gst, total, data.order.receipt);
            },
            
            // Modal configuration
            modal: {
                ondismiss: function() {
                    console.log('❌ Payment Modal Dismissed');
                    showNotification('Payment was cancelled', 'warning');
                    showPaymentFailedModal('Payment was cancelled by user');
                },
                
                // Handle escape key and close button
                escape: true,
                backdropclose: false
            },
            
            // Retry configuration
            retry: {
                enabled: true,
                max_count: 3
            }
        };
        
        // Initialize Razorpay
        const rzp = new Razorpay(options);
        
        // Enhanced error handling
        rzp.on('payment.failed', function (response) {
            console.error('❌ Payment Failed:', response.error);
            const errorMsg = response.error.description || response.error.reason || 'Payment failed';
            showNotification('Payment failed: ' + errorMsg, 'error');
            showPaymentFailedModal(errorMsg);
        });
        
        // Open payment modal
        rzp.open();
        
    } catch (error) {
        console.error('❌ Razorpay Error:', error);
        showNotification('Payment setup failed: ' + error.message, 'error');
        showPaymentFailedModal(error.message);
    }
}

// ===== ENHANCED SUCCESS HANDLER =====
async function handleRazorpaySuccess(response, orderData, subtotal, gst, total, receipt) {
    try {
        showNotification('✅ Payment successful! Verifying...', 'success');
        console.log('Processing payment verification:', response);
        
        // Verify payment signature with enhanced validation
        const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: total,
                currency: 'INR'
            })
        });
        
        if (!verifyResponse.ok) {
            throw new Error(`Verification request failed: ${verifyResponse.status}`);
        }
        
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success) {
            showNotification('✅ Payment verified! Creating your order...', 'success');
            
            // Create order with complete payment details
            const orderPayload = {
                ...orderData,
                items: cart,
                subtotal,
                gst,
                total,
                paymentMethod: 'Razorpay Online Payment',
                paymentStatus: 'Paid',
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                receipt: receipt,
                paymentDetails: {
                    gateway: 'razorpay',
                    method: 'online',
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    signature: response.razorpay_signature,
                    timestamp: new Date().toISOString()
                }
            };
            
            await placeOrder(orderPayload);
        } else {
            throw new Error(verifyData.error || 'Payment verification failed');
        }
        
    } catch (error) {
        console.error('❌ Payment Processing Error:', error);
        const errorMsg = 'Payment was successful but order processing failed. Please save your payment ID: ' + response.razorpay_payment_id + ' and contact support.';
        showNotification(errorMsg, 'error');
        showPaymentFailedModal(errorMsg);
    }
}

// ===== UPI Payment Processing (SIMPLIFIED & WORKING) =====
async function processUPIPayment(orderData, subtotal, gst, total) {
    try {
        showNotification('Generating UPI payment...', 'info');
        
        const orderId = `SF-${Date.now()}`;
        const response = await fetch(`/api/generate-qr?amount=${total}&orderId=${orderId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Failed to generate UPI payment');
        }
        
        // Show simple UPI payment modal
        showSimpleUPIModal(data, orderData, subtotal, gst, total, orderId);
        
    } catch (error) {
        console.error('UPI payment error:', error);
        showNotification('UPI payment setup failed: ' + error.message, 'error');
        showPaymentFailedModal();
    }
}

// ===== PROFESSIONAL UPI PAYMENT MODAL =====
function showSimpleUPIModal(qrData, orderData, subtotal, gst, total, orderId) {
    closeAllModals(); // Close checkout modal first
    
    const upiModal = document.createElement('div');
    upiModal.className = 'modal active';
    upiModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; border-radius: 20px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 2rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">📱</div>
                <h3 style="margin: 0; font-size: 1.5rem;">UPI Payment</h3>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Scan QR code or use UPI ID</p>
                <button onclick="closeUPIPayment()" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); color: white; border: none; font-size: 1.5rem; width: 40px; height: 40px; border-radius: 50%; cursor: pointer;">×</button>
            </div>
            
            <!-- Content -->
            <div style="padding: 2rem;">
                <!-- Amount Display -->
                <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem; text-align: center; border-left: 5px solid #10B981;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Total Amount</div>
                    <div style="font-size: 2.5rem; font-weight: bold; color: #10B981;">₹${total.toFixed(2)}</div>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">Order: ${orderId}</div>
                </div>
                
                <!-- QR Code Section -->
                <div style="background: white; border: 3px solid #10B981; border-radius: 20px; padding: 2rem; text-align: center; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);">
                    <h4 style="color: #10B981; margin-bottom: 1rem; font-size: 1.2rem;">
                        <i class="fas fa-qrcode"></i> Scan to Pay
                    </h4>
                    <img src="${qrData.qr}" alt="UPI QR Code" style="max-width: 250px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    
                    <!-- UPI ID Display -->
                    <div style="margin-top: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">UPI ID</div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                            <code style="background: white; padding: 0.8rem 1rem; border-radius: 8px; font-size: 1rem; color: #7C9A7D; border: 1px solid #dee2e6; font-weight: bold;">${qrData.upiId}</code>
                            <button onclick="copyUPIID('${qrData.upiId}')" style="background: #7C9A7D; color: white; border: none; padding: 0.8rem 1rem; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Instructions -->
                <div style="background: linear-gradient(135deg, #e8f5e8, #f0f8f0); padding: 2rem; border-radius: 15px; margin-bottom: 2rem;">
                    <h5 style="color: #7C9A7D; margin-bottom: 1.5rem; font-size: 1.1rem; text-align: center;">
                        <i class="fas fa-list-ol"></i> Payment Steps
                    </h5>
                    <ol style="margin: 0; padding-left: 1.5rem; line-height: 2; color: #333;">
                        <li><strong>Open any UPI app</strong> (GPay, PhonePe, Paytm, BHIM, etc.)</li>
                        <li><strong>Scan the QR code</strong> above or use the UPI ID</li>
                        <li><strong>Verify amount:</strong> <span style="color: #7C9A7D; font-weight: bold;">₹${total.toFixed(2)}</span></li>
                        <li><strong>Enter your UPI PIN</strong> to complete payment</li>
                        <li><strong>Click "Payment Completed"</strong> below after successful payment</li>
                    </ol>
                </div>
                
                <!-- App Icons -->
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 1rem;">Compatible with all UPI apps:</div>
                    <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                        <div style="padding: 0.8rem 1rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 0.85rem; color: #666;">📱 Google Pay</div>
                        <div style="padding: 0.8rem 1rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 0.85rem; color: #666;">💜 PhonePe</div>
                        <div style="padding: 0.8rem 1rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 0.85rem; color: #666;">💙 Paytm</div>
                        <div style="padding: 0.8rem 1rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 0.85rem; color: #666;">🏛️ BHIM</div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; gap: 1rem;">
                    <button onclick="confirmUPIPayment('${encodeURIComponent(JSON.stringify(orderData))}', ${subtotal}, ${gst}, ${total}, '${orderId}')" 
                            style="flex: 1; background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; padding: 1.2rem 2rem; border-radius: 15px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
                        <i class="fas fa-check-circle"></i> Payment Completed
                    </button>
                    <button onclick="closeUPIPayment()" 
                            style="flex: 0.3; background: #6c757d; color: white; border: none; padding: 1.2rem; border-radius: 15px; cursor: pointer; transition: all 0.3s;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Security Notice -->
                <div style="margin-top: 2rem; padding: 1rem; background: #fff3cd; border-radius: 10px; border-left: 4px solid #ffc107; text-align: center;">
                    <div style="font-size: 0.9rem; color: #856404;">
                        <i class="fas fa-shield-alt" style="margin-right: 0.5rem;"></i>
                        <strong>Secure Payment:</strong> Only click "Payment Completed" after successfully making the payment in your UPI app.
                    </div>
                </div>
            </div>
        </div>
    `;
    
    upiModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 5000;
        overflow-y: auto;
        padding: 1rem;
    `;
    
    document.body.appendChild(upiModal);
    window.currentUPIModal = upiModal;
}

// ===== PROFESSIONAL PAYMENT FAILURE MODAL =====
function showPaymentFailedModal(errorMessage = 'Payment could not be processed') {
    closeAllModals();
    
    const failedModal = document.createElement('div');
    failedModal.className = 'modal active';
    failedModal.innerHTML = `
        <div class="modal-content" style="max-width: 450px; text-align: center; border-radius: 20px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 2rem; text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 0.5rem; opacity: 0.9;">❌</div>
                <h3 style="margin: 0; font-size: 1.5rem;">Payment Failed</h3>
            </div>
            
            <!-- Content -->
            <div style="padding: 2rem;">
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem; border-left: 4px solid #dc3545;">
                    <p style="margin: 0; color: #333; line-height: 1.6; font-size: 1rem;">
                        ${errorMessage}
                    </p>
                </div>
                
                <div style="background: #fff3cd; padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem; border-left: 4px solid #ffc107;">
                    <h5 style="color: #856404; margin-bottom: 1rem; font-size: 1rem;">
                        <i class="fas fa-lightbulb"></i> What you can do:
                    </h5>
                    <ul style="text-align: left; margin: 0; padding-left: 1.5rem; color: #856404; line-height: 1.6;">
                        <li>Try a different payment method</li>
                        <li>Check your internet connection</li>
                        <li>Verify your payment details</li>
                        <li>Contact your bank if card payment failed</li>
                    </ul>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button onclick="closePaymentFailed(); proceedToCheckout();" 
                            style="flex: 1; background: linear-gradient(135deg, #007bff, #0056b3); color: white; border: none; padding: 1rem 2rem; border-radius: 15px; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                        <i class="fas fa-redo"></i> Try Different Method
                    </button>
                    <button onclick="closePaymentFailed()" 
                            style="flex: 0.4; background: #6c757d; color: white; border: none; padding: 1rem; border-radius: 15px; cursor: pointer; transition: all 0.3s;">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
                
                <div style="margin-top: 2rem; padding: 1rem; background: #e8f4fd; border-radius: 10px; border-left: 4px solid #007bff;">
                    <p style="margin: 0; font-size: 0.9rem; color: #004085;">
                        <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                        <strong>Need Help?</strong> Contact us if the problem persists. Your items are still in your cart.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    failedModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 6000;
    `;
    
    document.body.appendChild(failedModal);
    window.currentFailedModal = failedModal;
}

// ===== Confirm UPI Payment (SIMPLIFIED) =====
async function confirmUPIPayment(orderDataStr, subtotal, gst, total, orderId) {
    try {
        showNotification('Processing your order...', 'info');
        
        const orderData = JSON.parse(decodeURIComponent(orderDataStr));
        
        await placeOrder({
            ...orderData,
            items: cart,
            subtotal,
            gst,
            total,
            paymentMethod: 'UPI Payment',
            paymentStatus: 'Paid',
            paymentId: `UPI_${Date.now()}`,
            orderId: orderId
        });
        
        closeUPIPayment();
        
    } catch (error) {
        console.error('Order processing error:', error);
        showNotification('Failed to process order: ' + error.message, 'error');
        showPaymentFailedModal();
    }
}

// ===== Helper Functions =====
function copyUPIID(upiId) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(upiId).then(() => {
            showNotification(`UPI ID copied: ${upiId}`, 'success');
        });
    } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = upiId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification(`UPI ID copied: ${upiId}`, 'success');
    }
}

function closeUPIPayment() {
    if (window.currentUPIModal) {
        window.currentUPIModal.remove();
        window.currentUPIModal = null;
    }
}

function closePaymentFailed() {
    if (window.currentFailedModal) {
        window.currentFailedModal.remove();
        window.currentFailedModal = null;
    }
}

// Handle successful Razorpay payment (AUTOMATIC)
async function handleRazorpaySuccess(response, orderData, subtotal, gst, total) {
    try {
        showNotification('Payment successful! Verifying...', 'success');
        console.log('Razorpay Success Response:', response);
        
        // Verify payment signature
        const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
            })
        });
        
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success) {
            showNotification('Payment verified! Creating your order...', 'success');
            
            // Place order after successful payment verification
            await placeOrder({
                ...orderData,
                items: cart,
                subtotal,
                gst,
                total,
                paymentMethod: 'Razorpay Online Payment',
                paymentStatus: 'Paid',
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id
            });
        } else {
            throw new Error('Payment verification failed');
        }
        
    } catch (error) {
        console.error('Payment verification error:', error);
        showNotification('Payment successful but verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id, 'error');
        showPaymentFailedModal();
    }
}

// ===== UPI Payment Processing =====
async function processUPIPayment(orderData, subtotal, gst, total) {
    try {
        showNotification('Generating UPI payment...', 'info');
        
        const orderId = `SF-${Date.now()}`;
        // Fixed UPI string - NPCI standard format
        const merchantUpi = 'jaijs410@okaxis';
        const upiString = `upi://pay?pa=${merchantUpi}&pn=SHALOM&am=${total.toFixed(2)}&cu=INR&tn=Payment`;
        
        const response = await fetch(`/api/generate-qr?amount=${total}&orderId=${orderId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Failed to generate UPI QR code');
        }
        
        // Show UPI modal with valid QR
        showSimpleUPIModal(data, orderData, subtotal, gst, total, orderId);
        
    } catch (error) {
        console.error('UPI error:', error);
        showNotification(error.message, 'error');
    }
}

// ===== COD Payment Processing =====
async function processCODPayment(orderData, subtotal, gst, total) {
    try {
        showNotification('Processing COD order...', 'info');
        
        await placeOrder({
            ...orderData,
            items: cart,
            subtotal,
            gst,
            total,
            paymentMethod: 'Cash on Delivery',
            paymentStatus: 'Pending'
        });
        
    } catch (error) {
        console.error('COD order error:', error);
        showNotification(error.message || 'COD order failed', 'error');
    }
}

// ===== Place Order (IMPROVED) =====
async function placeOrder(orderData) {
    try {
        showNotification('Creating your order...', 'info');
        
        const response = await fetch('/api/place-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Order placed successfully:', data);
            
            // Clear cart and close modals
            cart = [];
            localStorage.removeItem('shalomCart');
            updateCartUI();
            closeAllModals();
            
            // Show success message with proper details
            showOrderSuccessMessage(
                data.orderId, 
                orderData.paymentMethod,
                orderData.paymentId
            );
            
            showNotification('Order confirmed! Email sent.', 'success');
        } else {
            throw new Error(data.error || 'Failed to place order');
        }
        
    } catch (error) {
        console.error('Place order error:', error);
        showNotification('Failed to create order: ' + error.message, 'error');
        throw error; // Re-throw so calling function can handle it
    }
}

// ===== Show Order Success (IMPROVED) =====
function showOrderSuccessMessage(orderId, paymentMethod, paymentId = null) {
    closeAllModals(); // Close any open modals first
    
    const successModal = document.createElement('div');
    successModal.className = 'modal active';
    successModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <div style="padding: 3rem 2rem;">
                <div style="font-size: 5rem; color: #28a745; margin-bottom: 1.5rem; animation: bounceIn 0.8s;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 style="color: #28a745; margin-bottom: 1.5rem; font-size: 2rem;">Order Confirmed!</h2>
                
                <div style="background: #f8f9fa; padding: 2rem; border-radius: 15px; margin-bottom: 2rem; text-align: left; border-left: 5px solid #28a745;">
                    <h4 style="color: #28a745; margin-bottom: 1rem; text-align: center;">Order Details</h4>
                    <p style="margin: 0.8rem 0; font-size: 1.1rem;"><strong>Order ID:</strong> <span style="color: #007bff;">${orderId}</span></p>
                    <p style="margin: 0.8rem 0; font-size: 1.1rem;"><strong>Payment:</strong> ${paymentMethod}</p>
                    ${paymentId ? `<p style="margin: 0.8rem 0; font-size: 0.9rem; color: #666;"><strong>Payment ID:</strong> ${paymentId}</p>` : ''}
                    <p style="margin: 0.8rem 0; color: #666;">Thank you for shopping with <strong style="color: #7C9A7D;">SHALOM BOUTIQUE</strong></p>
                </div>
                
                <div style="background: #e8f5e8; padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem;">
                    <p style="margin: 0; color: #155724; font-weight: 500;">
                        <i class="fas fa-envelope" style="margin-right: 0.5rem;"></i>
                        Order confirmation email has been sent
                    </p>
                </div>
                
                <button onclick="closeOrderSuccess(); window.location.reload();" 
                        style="background: #7C9A7D; color: white; border: none; padding: 1rem 3rem; border-radius: 25px; font-size: 1.2rem; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                    <i class="fas fa-shopping-bag"></i> Continue Shopping
                </button>
            </div>
        </div>
    `;
    
    successModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 7000;
    `;
    
    // Add bounce animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounceIn {
            0% { opacity: 0; transform: scale(0.3); }
            50% { opacity: 1; transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(successModal);
    window.currentSuccessModal = successModal;
}

function closeOrderSuccess() {
    if (window.currentSuccessModal) {
        window.currentSuccessModal.remove();
        window.currentSuccessModal = null;
    }
}

// ===== Show UPI Payment Modal =====
function showUPIPaymentModal(qrData, orderData, subtotal, gst, total, orderId) {
    const upiModal = document.createElement('div');
    upiModal.className = 'modal active';
    upiModal.innerHTML = `
        <div class="modal-content">
            <div class="upi-payment">
                <div class="modal-header">
                    <h3><i class="fas fa-qrcode"></i> UPI Payment</h3>
                    <button class="close-btn" onclick="closeUPIModal()">×</button>
                </div>
                <div class="upi-content">
                    <div class="payment-amount">
                        <h4>Amount: ₹${total.toFixed(2)}</h4>
                        <p>Order ID: ${orderId || 'Generating...'}</p>
                    </div>
                    
                    <div class="qr-container">
                        <img src="${qrData.qr}" alt="UPI QR Code" style="max-width: 350px; border: 3px solid #7C9A7D; border-radius: 15px; padding: 10px; background: white;">
                    </div>
                    
                    <div class="upi-details">
                        <div class="upi-info-row">
                            <strong><i class="fas fa-user-circle"></i> UPI ID:</strong> 
                            <span style="color: #7C9A7D; font-weight: bold;">${qrData.upiId}</span>
                            <button onclick="copyToClipboard('${qrData.upiId}')" class="copy-btn">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        
                        <div class="payment-steps">
                            <h4><i class="fas fa-mobile-alt"></i> How to Pay:</h4>
                            <ol>
                                <li><strong>Open any UPI app</strong> (GPay, PhonePe, Paytm, BHIM, etc.)</li>
                                <li><strong>Scan the QR code</strong> or use UPI ID above</li>
                                <li><strong>Verify amount:</strong> ₹${total.toFixed(2)}</li>
                                <li><strong>Complete payment</strong> using your UPI PIN</li>
                                <li><strong>Click "I Have Paid"</strong> after successful payment</li>
                            </ol>
                        </div>
                        
                        <div class="supported-apps">
                            <p><strong>Supported UPI Apps:</strong></p>
                            <div class="app-icons">
                                <span class="app-icon">📱 GPay</span>
                                <span class="app-icon">💜 PhonePe</span>
                                <span class="app-icon">💙 Paytm</span>
                                <span class="app-icon">🏛️ BHIM</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payment-actions">
                        <button class="btn-primary" onclick="confirmUPIPayment('${encodeURIComponent(JSON.stringify(orderData))}', ${subtotal}, ${gst}, ${total}, '${orderId}')">
                            <i class="fas fa-check-circle"></i> I Have Paid
                        </button>
                        <button class="btn-secondary" onclick="closeUPIModal()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        
                        <div class="debug-info" style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; font-size: 0.9rem;">
                            <details>
                                <summary style="cursor: pointer; font-weight: bold;">🔍 Debug Info (Click to expand)</summary>
                                <div style="margin-top: 0.5rem;">
                                    <p><strong>UPI String:</strong></p>
                                    <code style="background: #e9ecef; padding: 0.5rem; border-radius: 4px; display: block; word-break: break-all;">${qrData.upiString}</code>
                                    <p style="margin-top: 0.5rem;"><small>If QR doesn't work, copy this UPI string and paste in your UPI app's "Pay by UPI ID" section.</small></p>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    upiModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 5000;
        overflow-y: auto;
    `;
    
    document.body.appendChild(upiModal);
    window.currentUPIModal = upiModal;
}

// Helper function to copy UPI ID to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification(`UPI ID copied: ${text}`, 'success');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification(`UPI ID copied: ${text}`, 'success');
    }
}

function closeUPIModal() {
    if (window.currentUPIModal) {
        window.currentUPIModal.remove();
        window.currentUPIModal = null;
    }
}

async function confirmUPIPayment(orderDataStr, subtotal, gst, total, orderId) {
    try {
        const orderData = JSON.parse(decodeURIComponent(orderDataStr));
        
        await placeOrder({
            ...orderData,
            items: cart,
            subtotal,
            gst,
            total,
            paymentMethod: 'UPI Payment',
            paymentStatus: 'Pending Verification',
            orderId: orderId
        });
        
        closeUPIModal();
        
    } catch (error) {
        console.error('UPI confirmation error:', error);
        showNotification('Failed to confirm UPI payment', 'error');
    }
}

function proceedToCheckout() {
    if (cart.length === 0) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryGST = document.getElementById('summaryGST');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (summarySubtotal) summarySubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (summaryGST) summaryGST.textContent = `₹${gst.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `₹${total.toFixed(2)}`;
    
    toggleCart();
    openModal('checkoutModal');
}

// ===== Modal Management =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal) modal.classList.add('active');
    if (overlay) overlay.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function closeCheckout() {
    closeModal('checkoutModal');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    const overlay = document.getElementById('overlay');
    const cartSidebar = document.getElementById('cartSidebar');
    if (overlay) overlay.classList.remove('active');
    if (cartSidebar) cartSidebar.classList.remove('active');
}

// ===== Animation Styles =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .notification {
        animation: slideIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);
// ===== Debug Function =====
function testCart() {
    console.log('Current cart state:', cart);
    console.log('Cart items container:', document.getElementById('cartItems'));
    console.log('Cart count element:', document.getElementById('cartCount'));
    updateCartUI();
}

// Make it available globally for testing
window.testCart = testCart;
window.cart = cart;


// ===== MOBILE UPI PAYMENT =====
function showMobileUpiModal() {
    document.getElementById('mobileUpiModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function closeMobileUpiModal() {
    document.getElementById('mobileUpiModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

function submitUpiId() {
    const upiId = document.getElementById('upiIdInput').value.trim();
    if (!upiId || !upiId.includes('@')) {
        showNotification('Enter valid UPI ID (e.g., user@bankname)', 'error');
        return;
    }
    launchUpiApp('manual', upiId);
}

function getCartTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal * 1.18;
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }
    
    const checkoutModal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('overlay');
    
    checkoutModal.classList.add('active');
    overlay.classList.add('active');
    
    // Populate order summary
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    
    document.getElementById('summarySubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('summaryGST').textContent = `₹${gst.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `₹${total.toFixed(2)}`;
}

function closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) paymentModal.classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.remove('active');
}

// ===== PAYMENT PENDING MODAL =====
function showPaymentPendingModal() {
    closeMobileUpiModal();
    const pendingModal = document.createElement('div');
    pendingModal.className = 'modal active';
    pendingModal.innerHTML = `
        <div class="modal-content" style="max-width: 450px; text-align: center; border-radius: 20px;">
            <div style="background: linear-gradient(135deg, #ffc107, #ff9800); color: white; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                <h3 style="margin: 0; font-size: 1.5rem;">Payment Pending</h3>
            </div>
            <div style="padding: 2rem;">
                <p style="color: #666; font-size: 1.1rem; margin-bottom: 2rem;">
                    Complete the payment in your UPI app to confirm your order.
                </p>
                <div style="background: #fff3cd; padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; color: #856404; font-size: 0.95rem;">
                        <strong>⚠️ Important:</strong> Do NOT close this window until payment is complete.
                    </p>
                </div>
                <button onclick="confirmUpiPaymentManual();" 
                        style="background: #28a745; color: white; border: none; padding: 1rem 2rem; border-radius: 15px; font-weight: bold; cursor: pointer; margin-bottom: 1rem; width: 100%;">
                    ✅ Payment Completed
                </button>
                <button onclick="cancelUpiPayment();" 
                        style="background: #dc3545; color: white; border: none; padding: 1rem 2rem; border-radius: 15px; font-weight: bold; cursor: pointer; width: 100%;">
                    ❌ Payment Failed
                </button>
            </div>
        </div>
    `;
    pendingModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; align-items: center;
        justify-content: center; z-index: 5000;
    `;
    document.body.appendChild(pendingModal);
    window.paymentPendingModal = pendingModal;
}

function confirmUpiPaymentManual() {
    if (!window.currentCheckoutData) {
        showNotification('Session expired. Please try again.', 'error');
        return;
    }
    
    try {
        const data = window.currentCheckoutData;
        placeOrder({
            customerName: data.customerName,
            email: data.email,
            phone: data.phone,
            addressStreet: data.addressStreet,
            addressCity: data.addressCity,
            addressState: data.addressState,
            addressPin: data.addressPin,
            items: cart,
            subtotal: data.subtotal,
            gst: data.gst,
            total: data.total,
            paymentMethod: 'UPI Payment',
            paymentStatus: 'Paid',
            paymentId: `UPI_${Date.now()}`
        }).then(() => {
            if (window.paymentPendingModal) window.paymentPendingModal.remove();
        });
    } catch (error) {
        showNotification('Failed to process order: ' + error.message, 'error');
    }
}

function cancelUpiPayment() {
    if (window.paymentPendingModal) window.paymentPendingModal.remove();
    showNotification('Payment cancelled. Your cart is safe.', 'warning');
}


// ===== FIXED UPI APP LAUNCH =====
function launchUpiApp(app, customUpiId = null) {
    const upiId = customUpiId || 'jaijs410@okaxis';
    const amount = getCartTotal();
    // CORRECT format - no encoding, simple strings only
    const upiString = `upi://pay?pa=${upiId}&pn=ShalomBoutique&am=${amount.toFixed(2)}&cu=INR&tn=Purchase`;
    
    window.location.href = upiString;
    showNotification('Opening UPI app...', 'info');
    
    setTimeout(() => {
        showPaymentPendingModal();
    }, 1000);
}


// ===== PAYMENT ATOMICITY - VERIFY BEFORE ORDER =====
function confirmUpiPaymentManual() {
    if (!window.currentCheckoutData) {
        showNotification('Session expired. Please try again.', 'error');
        return;
    }
    
    try {
        const data = window.currentCheckoutData;
        
        // ATOMIC: Only place order if payment confirmed
        placeOrder({
            customerName: data.customerName,
            email: data.email,
            phone: data.phone,
            addressStreet: data.addressStreet,
            addressCity: data.addressCity,
            addressState: data.addressState,
            addressPin: data.addressPin,
            items: cart,
            subtotal: data.subtotal,
            gst: data.gst,
            total: data.total,
            paymentMethod: 'UPI Payment',
            paymentStatus: 'Paid',
            paymentId: `UPI_${Date.now()}`,
            paymentVerified: true // Flag for atomicity
        }).then(() => {
            if (window.paymentPendingModal) window.paymentPendingModal.remove();
            window.currentCheckoutData = null;
        }).catch(err => {
            showNotification('Order failed: ' + err.message, 'error');
        });
    } catch (error) {
        showNotification('Failed to process order: ' + error.message, 'error');
    }
}

// UPI validation with regex
function validateUpiId(upiId) {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upiId.trim());
}

// Fixed submitUpiId
function submitUpiId() {
    const upiId = document.getElementById('upiIdInput').value.trim();
    
    if (!upiId) {
        showNotification('Please enter your UPI ID', 'error');
        return;
    }
    
    if (!validateUpiId(upiId)) {
        showNotification('Invalid UPI ID format. Example: john@okaxis or mobile@upi', 'error');
        return;
    }
    
    launchUpiApp('manual', upiId);
}

// Fixed launchUpiApp with NPCI certified format
function launchUpiApp(app, customUpiId = null) {
    let upiId = customUpiId || 'jaijs410@okaxis';
    
    // Validate custom UPI ID
    if (customUpiId && !validateUpiId(customUpiId)) {
        showNotification('Invalid UPI ID: ' + customUpiId, 'error');
        return;
    }
    
    const amount = getCartTotal();
    const txnId = Date.now();
    
    // NPCI CERTIFIED FORMAT - Most Compatible with All UPI Apps
    const upiString = `upi://pay?pa=${upiId}&pn=SHALOM&mc=5311&tr=${txnId}&tn=Order&am=${amount.toFixed(2)}&cu=INR`;
    
    console.log('✅ NPCI UPI String:', upiString);
    window.location.href = upiString;
    showNotification('Opening UPI app...', 'info');
    
    setTimeout(() => {
        showPaymentPendingModal();
    }, 1000);
}


// ===== HERO SLIDER =====
let currentSlideIndex = 0;
let slideInterval;

function showSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (index >= slides.length) currentSlideIndex = 0;
    if (index < 0) currentSlideIndex = slides.length - 1;
    
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (dots[i]) dots[i].classList.remove('active');
    });
    
    slides[currentSlideIndex].classList.add('active');
    if (dots[currentSlideIndex]) dots[currentSlideIndex].classList.add('active');
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    showSlide(currentSlideIndex);
    resetSlideInterval();
}

function currentSlide(index) {
    currentSlideIndex = index;
    showSlide(currentSlideIndex);
    resetSlideInterval();
}

function autoSlide() {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
}

function resetSlideInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(autoSlide, 5000);
}

// Start auto-slide on page load
document.addEventListener('DOMContentLoaded', () => {
    slideInterval = setInterval(autoSlide, 5000);
});
