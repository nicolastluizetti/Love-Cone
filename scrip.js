const orderForm = document.getElementById('orderForm');
const whatsappNumber = '5511971830218';
const dateInput = document.getElementById('date');
const streetInput = document.getElementById('street');
const cepInput = document.getElementById('cep');
const numberInput = document.getElementById('number');
const complementInput = document.getElementById('complement');
const districtInput = document.getElementById('district');
const cityInput = document.getElementById('city');
const stateInput = document.getElementById('state');
const deliveryOptionInputs = document.querySelectorAll('input[name="deliveryOption"]');
const productTotalSpan = document.getElementById('productTotal');
const orderTotalSpan = document.getElementById('orderTotal');
const productOptionsContainer = document.getElementById('productOptions');
const cartItemsContainer = document.getElementById('cartItems');
const cartEmptyState = document.getElementById('cartEmpty');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartDelivery = document.getElementById('cartDelivery');
const cartTotal = document.getElementById('cartTotal');
const cartCountBadge = document.querySelector('[data-cart-count]');

function getCart() {
    try {
        return JSON.parse(localStorage.getItem('lovecone-cart') || '[]');
    } catch {
        return [];
    }
}

function saveCart(items) {
    localStorage.setItem('lovecone-cart', JSON.stringify(items));
}

function addToCart(item) {
    const cart = getCart();
    const existingIndex = cart.findIndex(entry => entry.product === item.product && entry.flavor === item.flavor);

    if (existingIndex >= 0) {
        cart[existingIndex].quantity += item.quantity;
    } else {
        cart.push(item);
    }

    saveCart(cart);
    renderCartPage();
}

function removeFromCart(product, flavor) {
    const cart = getCart().filter(entry => !(entry.product === product && entry.flavor === flavor));
    saveCart(cart);
    renderCartPage();
}

function syncCartBadge() {
    const countBadges = document.querySelectorAll('[data-cart-nav-count]');
    const totalItems = getCart().reduce((sum, item) => sum + Number(item.quantity), 0);
    countBadges.forEach(badge => {
        badge.textContent = String(totalItems);
    });
}

function renderCartPage() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const delivery = subtotal > 99 ? 0 : 15;
    const total = subtotal + delivery;
    syncCartBadge();

    if (cartItemsContainer) {
        if (!cart.length) {
            cartItemsContainer.innerHTML = '';
            if (cartEmptyState) cartEmptyState.hidden = false;
        } else {
            if (cartEmptyState) cartEmptyState.hidden = true;
            cartItemsContainer.innerHTML = cart.map((item) => `
                <article class="cart-item">
                    <div>
                        <h4>${item.product}</h4>
                        <div class="cart-item-meta">
                            <span>Sabor: ${item.flavor}</span>
                            <span>Quantidade: ${item.quantity}</span>
                            <span>Valor unitário: R$ ${formatCurrency(item.price)}</span>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <span class="cart-item-total">R$ ${formatCurrency(Number(item.price) * Number(item.quantity))}</span>
                        <button class="item-remove" type="button" aria-label="Remover item" data-remove-product="${item.product}" data-remove-flavor="${item.flavor}">×</button>
                    </div>
                </article>
            `).join('');
        }
    }

    if (cartSubtotal) cartSubtotal.textContent = `R$ ${formatCurrency(subtotal)}`;
    if (cartDelivery) cartDelivery.textContent = `R$ ${formatCurrency(delivery)}`;
    if (cartTotal) cartTotal.textContent = `R$ ${formatCurrency(total)}`;
    if (cartCountBadge) cartCountBadge.textContent = String(cart.reduce((sum, item) => sum + Number(item.quantity), 0));

    document.querySelectorAll('[data-remove-product]').forEach(button => {
        button.addEventListener('click', () => {
            const product = button.getAttribute('data-remove-product');
            const flavor = button.getAttribute('data-remove-flavor');
            removeFromCart(product, flavor);
        });
    });
}

const orderProducts = [
    {
        name: 'Oreo Surprise',
        flavors: [
            { label: 'Doce de leite', value: 'Doce de leite', price: 10 },
            { label: 'Creme de Avelã', value: 'Creme de Avelã', price: 10 }
        ]
    },
    {
        name: 'Cápsula Artesanal de Café',
        flavors: [
            { label: 'Chocolate Quente Alpino', value: 'Chocolate Quente Alpino', price: 7 },
            { label: 'Cappucino Alpino', value: 'Cappucino Alpino', price: 7 },
            { label: 'Latte Alpino', value: 'Latte Alpino', price: 7 }
        ]
    }
];

let productCheckboxes = [];
let flavorSelects = [];
let quantityInputs = [];
let quantityFields = [];

function initAutocomplete() {
    if (!window.google?.maps?.places || !streetInput) return;
    const addressAutocomplete = new google.maps.places.Autocomplete(streetInput, {
        types: ['address'],
        componentRestrictions: { country: 'br' }
    });
    addressAutocomplete.addListener('place_changed', () => {
        const place = addressAutocomplete.getPlace();
        if (place.formatted_address) {
            streetInput.value = place.formatted_address;
            updateOrderTotals();
        }
    });
}

function getCustomerAddress() {
    const street = streetInput.value.trim();
    const number = numberInput.value.trim();
    const complement = complementInput.value.trim();
    const district = districtInput.value.trim();
    const city = cityInput.value.trim();
    const state = stateInput.value.trim();
    const cep = cepInput.value.trim();

    return `${street}${number ? `, ${number}` : ''}${complement ? `, ${complement}` : ''}${district ? `, ${district}` : ''}${city ? `, ${city}` : ''}${state ? ` - ${state}` : ''}${cep ? `, CEP ${cep}` : ''}`.trim();
}

function isDeliverySelected() {
    return Array.from(deliveryOptionInputs).some(i => i.checked && i.value === 'delivery');
}

function formatCurrency(value) {
    return Number(value || 0).toFixed(2).replace('.', ',');
}

function slugify(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function getFlavorDetails(productName, flavorIndex = 0) {
    const product = orderProducts.find(item => item.name === productName);
    const flavorSelect = document.querySelector(`.flavor-select[data-product="${productName}"][data-flavor-index="${flavorIndex}"]`);
    const selectedOption = flavorSelect?.selectedOptions[0];

    return {
        value: selectedOption?.value || product?.flavors[0]?.value || 'Sem sabor',
        label: selectedOption?.textContent?.replace(/\s*-\s*R\$\s*[\d.,]+$/, '').trim() || product?.flavors[0]?.label || 'Sem sabor',
        price: Number(selectedOption?.dataset.price || product?.flavors[0]?.price || 0)
    };
}

function getSelectedFlavorDetails(productName) {
    return Array.from(document.querySelectorAll(`.flavor-entry[data-product="${productName}"]`))
        .map(entry => {
            const flavorIndex = Number(entry.dataset.flavorIndex);
            const quantity = parseInt(entry.querySelector('.quantity-input')?.value, 10) || 0;
            return { ...getFlavorDetails(productName, flavorIndex), quantity };
        })
        .filter(flavor => flavor.quantity > 0);
}

function getProductTotalValue() {
    return Array.from(productCheckboxes)
        .filter(cb => cb.checked)
        .reduce((sum, cb) => {
            const productName = cb.value;
            return sum + getSelectedFlavorDetails(productName)
                .reduce((productSum, flavor) => productSum + (flavor.price * flavor.quantity), 0);
        }, 0);
}

function updateCartSummary() {
    const cartList = document.getElementById('cartSummaryList');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartList || !cartCount || !cartTotal) return;

    const selectedProducts = Array.from(productCheckboxes || [])
        .filter(cb => cb.checked)
        .map(cb => {
            const productName = cb.value;
            const details = getSelectedFlavorDetails(productName);
            const itemTotal = details.reduce((sum, flavor) => sum + (flavor.price * flavor.quantity), 0);
            const quantity = details.reduce((sum, flavor) => sum + flavor.quantity, 0);
            return {
                name: productName,
                quantity,
                total: itemTotal,
                details: details
            };
        })
        .filter(item => item.quantity > 0);

    cartCount.textContent = String(selectedProducts.reduce((sum, item) => sum + item.quantity, 0));
    cartTotal.textContent = `R$ ${formatCurrency(selectedProducts.reduce((sum, item) => sum + item.total, 0))}`;

    if (!selectedProducts.length) {
        cartList.innerHTML = '<li class="cart-empty">Seu carrinho está vazio.</li>';
        return;
    }

    cartList.innerHTML = selectedProducts.map(item => `
        <li class="cart-summary-item">
            <div>
                <strong>${item.name}</strong>
                <small>${item.quantity} unidade(s)</small>
            </div>
            <strong>R$ ${formatCurrency(item.total)}</strong>
        </li>
    `).join('');
}

function updateOrderTotals() {
    if (!productTotalSpan || !orderTotalSpan) return;

    const productTotal = getProductTotalValue();
    productTotalSpan.textContent = formatCurrency(productTotal);
    orderTotalSpan.textContent = formatCurrency(productTotal);
    updateCartSummary();
}

function calculatePrice(productName) {
    const priceDisplay = document.querySelector(`.price-display[data-product="${productName}"]`);
    if (!priceDisplay) return 0;

    const total = getSelectedFlavorDetails(productName)
        .reduce((sum, flavor) => sum + (flavor.price * flavor.quantity), 0);
    priceDisplay.innerHTML = `Preço: <strong>R$ ${formatCurrency(total)}</strong>`;
    return total;
}

function renderProductOptions() {
    if (!productOptionsContainer) return;

    productOptionsContainer.innerHTML = orderProducts.map((product) => {
        const slug = slugify(product.name);
        const flavorOptions = product.flavors.map((flavor, index) => `
            <option value="${flavor.value}" data-price="${flavor.price.toFixed(2)}" ${index === 0 ? 'selected' : ''}>
                ${flavor.label} - R$ ${formatCurrency(flavor.price)}
            </option>
        `).join('');

        const flavorFields = [0, 1].map(flavorIndex => `
            <div class="flavor-entry" data-product="${product.name}" data-flavor-index="${flavorIndex}">
                <label for="flavor-${slug}-${flavorIndex}">${flavorIndex === 0 ? 'Escolha o Sabor:' : 'Segundo Sabor:'}</label>
                <select id="flavor-${slug}-${flavorIndex}" name="flavor-${slug}-${flavorIndex}" class="flavor-select" data-product="${product.name}" data-flavor-index="${flavorIndex}">
                    ${flavorOptions}
                </select>

                <label for="quantity-${slug}-${flavorIndex}">Quantidade:</label>
                <input type="number" id="quantity-${slug}-${flavorIndex}" name="quantity-${slug}-${flavorIndex}" min="${flavorIndex === 0 ? '1' : '0'}" value="${flavorIndex === 0 ? '1' : '0'}" class="quantity-input" data-product="${product.name}" data-flavor-index="${flavorIndex}">
            </div>
        `).join('');

        return `
            <div class="product-line">
                <label class="checkbox-option">
                    <input type="checkbox" name="products" value="${product.name}" data-product="${product.name}">
                    ${product.name}
                </label>
                <div class="quantity-field" data-for="${product.name}" style="display: none;">
                    ${flavorFields}

                    <p class="price-display" data-product="${product.name}">Preço: <strong>R$ ${formatCurrency(product.flavors[0].price)}</strong></p>
                </div>
            </div>
        `;
    }).join('');

    bindProductEvents();
    updateOrderTotals();
}

function bindProductEvents() {
    productCheckboxes = document.querySelectorAll('input[name="products"]');
    flavorSelects = document.querySelectorAll('.flavor-select');
    quantityInputs = document.querySelectorAll('.quantity-input');
    quantityFields = document.querySelectorAll('.quantity-field');

    productCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const productName = cb.getAttribute('data-product');
            const field = document.querySelector(`.quantity-field[data-for="${productName}"]`);
            if (field) field.style.display = cb.checked ? 'block' : 'none';
            if (cb.checked) calculatePrice(productName);
            updateOrderTotals();
        });
    });

    document.querySelectorAll('.product-line input[name="products"]').forEach(cb => {
        cb.addEventListener('change', updateCartSummary);
    });

    flavorSelects.forEach(select => {
        select.addEventListener('change', () => {
            const productName = select.getAttribute('data-product');
            calculatePrice(productName);
            updateOrderTotals();
        });
    });

    quantityInputs.forEach(input => {
        input.addEventListener('input', () => {
            const productName = input.getAttribute('data-product');
            calculatePrice(productName);
            updateOrderTotals();
        });
    });
}

// Date limits
if (dateInput) {
    const today = new Date();
    const min = new Date(today); min.setDate(today.getDate() + 7);
    const max = new Date(today); max.setMonth(today.getMonth() + 3);
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    dateInput.min = fmt(min);
    dateInput.max = fmt(max);
}

orderForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const fullAddress = getCustomerAddress();
    const deliveryOption = isDeliverySelected() ? 'Entrega' : 'Retirada';
    updateOrderTotals();
    const productTotal = productTotalSpan.textContent;

    const selectedItems = Array.from(productCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => {
            const productName = cb.value;
            const flavors = getSelectedFlavorDetails(productName);
            flavors.forEach(flavor => {
                addToCart({
                    product: productName,
                    flavor: flavor.label,
                    quantity: flavor.quantity,
                    price: flavor.price
                });
            });
            const flavorLines = flavors.map(flavor => {
                const total = (flavor.price * flavor.quantity).toFixed(2).replace('.', ',');
                return `  - Sabor: ${flavor.label}\n  - Quantidade: ${flavor.quantity}\n  - Preço Total: R$ ${total}`;
            });
            return `${productName}\n${flavorLines.join('\n')}`;
        });

    const productsText = selectedItems.length ? selectedItems.join('\n\n') : 'Nenhum produto selecionado';
    const date = dateInput.value;
    const message = document.getElementById('message').value.trim() || 'Nenhuma mensagem adicional.';

    const messageText = `Olá! Gostaria de solicitar um orçamento.\n\nNome: ${name}\nEndereço: ${fullAddress}\nOpção: ${deliveryOption}\nTotal dos produtos: R$ ${productTotal}\n\nItens selecionados:\n${productsText}\n\nData desejada: ${date}\nMensagem: ${message}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    window.location.href = 'cart.html';
});

// Contact form handler (kept)
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    const messageText = `Olá! Recebi uma mensagem de contato.\n\n*Dados do Contato:*\nNome: ${name}\nEmail: ${email}\n\n*Assunto:* ${subject}\n\n*Mensagem:*\n${message}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
});

// CEP helpers (ViaCEP)
function mascaraCEP(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 5) v = v.substring(0,5) + '-' + v.substring(5,8);
    e.target.value = v;
}

async function consultarCEP() {
    const valor = cepInput.value.replace(/\D/g, '');
    if (valor.length !== 8) return;
    try {
        const resp = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
        const json = await resp.json();
        if (json.erro) {
            alert('CEP não encontrado.');
            return;
        }
        streetInput.value = json.logradouro || '';
        districtInput.value = json.bairro || '';
        cityInput.value = json.localidade || '';
        stateInput.value = json.uf || '';
        updateOrderTotals();
    } catch {
        alert('Erro ao consultar o CEP.');
    }
}

cepInput?.addEventListener('input', mascaraCEP);
cepInput?.addEventListener('blur', consultarCEP);
numberInput?.addEventListener('blur', updateOrderTotals);
streetInput?.addEventListener('blur', updateOrderTotals);
cityInput?.addEventListener('blur', updateOrderTotals);
stateInput?.addEventListener('blur', updateOrderTotals);

// click sound removido para evitar erros em páginas sem áudio disponível

if (productOptionsContainer) {
    renderProductOptions();
}

if (document.body.dataset.page === 'cart') {
    renderCartPage();
} else {
    syncCartBadge();
}

updateOrderTotals();
// init autocomplete if API loaded
