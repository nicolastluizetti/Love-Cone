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

function updateOrderTotals() {
    const productTotal = getProductTotalValue();
    productTotalSpan.textContent = formatCurrency(productTotal);
    orderTotalSpan.textContent = formatCurrency(productTotal);
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
            const flavorLines = getSelectedFlavorDetails(productName).map(flavor => {
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

// click sound
const clickSound = new Audio('assets/click.mp3');
clickSound.preload = 'auto'; clickSound.volume = 0.35;
function playClickSound(){ clickSound.currentTime=0; clickSound.play().catch(()=>{}); }
document.addEventListener('click', (event)=>{ const control = event.target.closest('button, a'); if (control && !control.disabled) playClickSound(); });

renderProductOptions();
updateOrderTotals();
// init autocomplete if API loaded
