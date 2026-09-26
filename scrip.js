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
        image: 'assets/oreosurprise.jpeg',
        description: 'Crocância, cremosidade e o sabor irresistível do Oreo em uma apresentação premium.',
        tag: 'Mais pedido',
        price: 39,
        flavors: [
            { label: 'Chocolate', value: 'Chocolate', price: 39 },
            { label: 'Doce de leite', value: 'Doce de leite', price: 39 },
            { label: 'Creme de avelã', value: 'Creme de avelã', price: 39 }
        ]
    },
    {
        name: 'Brownie',
        image: 'assets/brownie.jpeg',
        description: 'Textura macia e sabor intenso para presentear, celebrar ou surpreender.',
        tag: 'Clássico',
        price: 32,
        flavors: [
            { label: 'Chocolate intenso', value: 'Chocolate intenso', price: 32 },
            { label: 'Prestígio', value: 'Prestígio', price: 32 },
            { label: 'Ninho', value: 'Ninho', price: 32 }
        ]
    },
    {
        name: 'Cápsula Artesanal de Café',
        image: 'assets/capsula-de-cafe.png',
        description: 'Uma experiência gourmet para quem aprecia café com personalidade e sofisticação.',
        tag: 'Especial',
        price: 28,
        flavors: [
            { label: 'Chocolate Quente Alpino', value: 'Chocolate Quente Alpino', price: 28 },
            { label: 'Cappucino Alpino', value: 'Cappucino Alpino', price: 28 },
            { label: 'Latte Alpino', value: 'Latte Alpino', price: 28 }
        ]
    },
    {
        name: 'Bolo de Pote',
        image: 'assets/bolodepote.png',
        description: 'Porção cremosa, visual elegante e sabor marcante para presentear em qualquer ocasião.',
        tag: 'Personalizado',
        price: 25,
        flavors: [
            { label: 'Morango', value: 'Morango', price: 25 },
            { label: 'Chocolate', value: 'Chocolate', price: 25 },
            { label: 'Doce de leite', value: 'Doce de leite', price: 25 },
            { label: 'Ninho', value: 'Ninho', price: 25 }
        ]
    },
    {
        name: 'Copo da Felicidade',
        image: 'assets/copo_da_felicidade.png',
        description: 'Uma sobremesa moderna, prática e irresistível para entregar mais alegria.',
        tag: 'Gostinho especial',
        price: 22,
        flavors: [
            { label: 'Oreo', value: 'Oreo', price: 22 },
            { label: 'Chocolate', value: 'Chocolate', price: 22 },
            { label: 'Morango', value: 'Morango', price: 22 },
            { label: 'Leite ninho', value: 'Leite ninho', price: 22 }
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

function getFlavorOptionsMarkup(product) {
    return product.flavors.map((flavor) => `
        <option value="${flavor.value}" data-price="${flavor.price.toFixed(2)}">
            ${flavor.label} - R$ ${formatCurrency(flavor.price)}
        </option>
    `).join('');
}

function createFlavorRow(productName, rowIndex = 0) {
    const product = orderProducts.find(item => item.name === productName);
    if (!product) return '';

    return `
        <div class="flavor-row" data-product="${productName}" data-row-index="${rowIndex}">
            <div class="field-group">
                <label>Sabor</label>
                <select class="flavor-select" data-product="${productName}" data-row-index="${rowIndex}">
                    ${getFlavorOptionsMarkup(product)}
                </select>
            </div>

            <div class="field-group narrow">
                <label>Qtd.</label>
                <input type="number" class="quantity-input" data-product="${productName}" data-row-index="${rowIndex}" min="1" value="1">
            </div>

            <button type="button" class="remove-flavor-row" data-product="${productName}" data-row-index="${rowIndex}" aria-label="Remover sabor">×</button>
        </div>
    `;
}

function getSelectedFlavorDetails(productName) {
    const product = orderProducts.find(item => item.name === productName);
    const checkbox = document.querySelector(`input[name="products"][value="${productName}"]`);
    if (!checkbox || !checkbox.checked || !product) return [];

    return Array.from(document.querySelectorAll(`.flavor-row[data-product="${productName}"]`))
        .map((row) => {
            const select = row.querySelector('.flavor-select');
            const input = row.querySelector('.quantity-input');
            const selectedOption = select?.selectedOptions[0];
            const quantity = Number(input?.value || 0);

            if (!quantity) return null;

            return {
                value: selectedOption?.value || product.flavors[0].value,
                label: selectedOption?.textContent?.replace(/\s*-\s*R\$\s*[\d.,]+$/, '').trim() || product.flavors[0].label,
                price: Number(selectedOption?.dataset.price || product.flavors[0].price || 0),
                quantity
            };
        })
        .filter(Boolean);
}

function getProductTotalValue() {
    return Array.from(productCheckboxes)
        .filter(cb => cb.checked)
        .reduce((sum, cb) => {
            const productName = cb.value;
            const details = getSelectedFlavorDetails(productName);
            return sum + details.reduce((productSum, flavor) => productSum + (flavor.price * flavor.quantity), 0);
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
            const quantity = details.reduce((sum, flavor) => sum + flavor.quantity, 0);
            const total = details.reduce((sum, flavor) => sum + (flavor.price * flavor.quantity), 0);
            return {
                name: productName,
                quantity,
                total,
                details
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
    const total = getSelectedFlavorDetails(productName)
        .reduce((sum, flavor) => sum + (flavor.price * flavor.quantity), 0);
    const priceDisplay = document.querySelector(`.product-price[data-product="${productName}"]`);
    if (priceDisplay) {
        priceDisplay.textContent = `R$ ${formatCurrency(total)}`;
    }
    return total;
}

function renderProductOptions() {
    if (!productOptionsContainer) return;

    productOptionsContainer.innerHTML = orderProducts.map((product) => {
        const slug = slugify(product.name);

        return `
            <article class="product-card-option">
                <div class="product-card-media">
                    <img src="${product.image}" alt="${product.name}">
                </div>

                <div class="product-card-body">
                    <div class="product-card-header">
                        <div>
                            <span class="product-card-tag">${product.tag}</span>
                            <h4>${product.name}</h4>
                        </div>
                        <strong class="product-price" data-product="${product.name}">R$ ${formatCurrency(product.price)}</strong>
                    </div>

                    <p>${product.description}</p>

                    <label class="product-select-toggle">
                        <input type="checkbox" name="products" value="${product.name}" data-product="${product.name}">
                        Selecionar este doce
                    </label>

                    <div class="flavor-list" data-product="${product.name}">
                        ${createFlavorRow(product.name, 0)}
                    </div>

                    <button type="button" class="add-flavor-row" data-product="${product.name}">+ Adicionar mais um sabor</button>
                </div>
            </article>
        `;
    }).join('');

    bindProductEvents();
    updateOrderTotals();
}

function bindProductEvents() {
    productCheckboxes = document.querySelectorAll('input[name="products"]');
    flavorSelects = document.querySelectorAll('.flavor-select');
    quantityInputs = document.querySelectorAll('.quantity-input');

    productCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            updateOrderTotals();
        });
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

    document.querySelectorAll('.add-flavor-row').forEach(button => {
        button.addEventListener('click', () => {
            const productName = button.getAttribute('data-product');
            const list = document.querySelector(`.flavor-list[data-product="${productName}"]`);
            const rows = list?.querySelectorAll('.flavor-row') || [];
            list?.insertAdjacentHTML('beforeend', createFlavorRow(productName, rows.length));
            bindProductEvents();
        });
    });

    document.querySelectorAll('.remove-flavor-row').forEach(button => {
        button.addEventListener('click', () => {
            const productName = button.getAttribute('data-product');
            const row = button.closest('.flavor-row');
            const list = document.querySelector(`.flavor-list[data-product="${productName}"]`);
            const rows = list?.querySelectorAll('.flavor-row') || [];

            if (rows.length > 1) {
                row?.remove();
            }

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
