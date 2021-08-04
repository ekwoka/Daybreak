export default function (Alpine) {  
    console.log('Registering Storage');
    window.__daybreaks = {}
    Alpine.persistedStore = function (name, value, storage = localStorage) {
        let stored = storage.getItem(`__daybreak_${name}`)

        
        if (![null, undefined].includes(stored)) {
            const storedValue = JSON.parse(stored)

            if (typeof storedValue == 'boolean') value = storedValue
            
            const diff = Object.entries(storedValue).reduce((acc, [key, val]) => {
                if (!storedValue.hasOwnProperty(key) || Object.getOwnPropertyDescriptor(value, key).get) return acc
                acc[key] = val
                return acc
            }, {})

            value = Object.assign(value, diff)

        }

        Alpine.store(name, value)

        window.__daybreaks[name] = Alpine.effect(() => {
            const json = JSON.stringify(
                Alpine.store(name)
            )

            storage.setItem(`__daybreak_${name}`, json)
        })
    };

    console.log('Registering RIAS');
    Alpine.directive('rias', (el, { expression }, { evaluate, effect }) => {
        effect(() => {
        
        let imgBase = evaluate(expression);
        if (!imgBase) return;
        let width = [180, 360, 540, 720, 900, 1080, 1296, 1512, 1728, 1944, 2160, 2376, 2592, 2808, 3024];

        let imgSrc = imgBase.replaceAll('{width}', width[0]);
        let setArray = [];
        width.forEach(w => setArray.push(`${imgBase.replaceAll('{width}', w)} ${w}w`));
        let imgSet = setArray.join(',');

        el.setAttribute('loading', el.getAttribute('loading')||'lazy');
        el.setAttribute('src', imgSrc);
        el.setAttribute('srcset', imgSet);
        });
    });

    /* Alpine Stores */
    console.log('Registering Stores');
    Alpine.persistedStore('cart', {
        items: [],
        get value() {
            let v = 0
            this.items.forEach(item => v += item.line_price || 0)
            return v
        },
        get quantity() {
            let q = 0
            this.items.forEach(item => q += item.quantity || 0)
            return q
        }
    }, sessionStorage)
    Alpine.persistedStore('subscribed', false)

    /* Alpine Data */
    console.log('Registering Alpine Data Objects');
    Alpine.data('emailCapture',({
        provider,
        listID,
        code
    } = {}) => ({
        provider: provider || false,
        url: 'https://manage.kmail-lists.com/ajax/subscriptions/subscribe',
        listID: listID || false,
        code: code || false,
        fetchData(data) {
            return {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: data
            }
        },
        get subscribed() {
            return this.$store.subscribed;
        },
        email:'',
        open: false,
        sending: false,
        sent: false,
        success: false,
        error: false,
        existed: false,
        errorReason: '',
        fetchCoupon() {
            if(this.code) return fetch(`/discount/${code}`);
        },
        async submitEmail() {
            this.sending = true;
            data = new URLSearchParams();
            data.set('g', this.listID);
            data.set('email',this.email);
            response = await fetch(this.url,this.fetchData(data.toString()));
            if(response.ok) {
                this.sending = false;
                this.sent = true;
            };
            data = await response?.json();
            if(!data?.success) {
                this.error = true;
                return this.errorReason = data?.errors[0];
            };
            this.$store.subscribed = true;
            if(data?.data?.is_subscribed) return this.existed = true;
            this.success = true;
            this.fetchCoupon();
        },
        init() {
            if (this.subscribed == false) this.open = true;
            console.log(`initializing email capture...subscribed: ${this.subscribed}, open: ${this.open}`);
        }
    }));

    Alpine.data('productForm',({} = {}) => ({
        form: false,
        sending: false,
        async addToCart(){
            this.sending=true
            let formData = JSON.stringify({
                ...JSON.parse(serializeForm(this.form)),
                sections: ['cart-icon-bubble'],
                sections_url: window.location.pathname
              })
              console.log(formData)
            this.$store.cart = await Daybreak.addToCartFromForm(formData,this.$store.cart)
            this.sending=false
        }
    }))

    /* Alpine.data('themeAlpine', () => ({
        menuOpen: false,
        cartOpen: false,
        cart: {
            "items": [],
            "items_subtotal_price": 0,
        },
        get subtotalPrice() {
            return this.cart.items_subtotal_price
        },
        get discountValue() {
            if (this.discountIndex != -1) return this.subtotalPrice * (1 - this.discounts[discountIndex].multiplier);
            return 0;
        },
        shippingCost(showShippingThreshold) {
            if (this.totalPriceWithoutShipping >= this.themeSettings.freeShippingThreshold && showShippingThreshold) return 0;
            return this.themeSettings.estimatedShipping;
        },
        get totalPriceWithoutShipping() {
            if (this.discountIndex != -1) return this.cart.items_subtotal_price;
            return this.cart.items_subtotal_price - this.discountValue;
        },
        themeSettings: {
            "freeShippingThreshold": {{ settings.freeShippingThreshold }},
            "estimatedShipping": {{ settings.estimatedShipping }}
        },
        cartMessage: "Cart",
        productAdded: false,
        storeUrl: "kwoka-test-theme.myshopify.com",
        get discountCode() { return getCookie("discount_code"); },
        discounts: [
            {%- if settings.displayDiscounts -%}
                {%- assign discounts = settings.discountCodes | split: "," -%}
                {%- for discount in discounts -%}
                    {%- assign code = discount | split: ':' | first -%}
                    {%- assign multiplier = discount | split: ':' | last %}
            {
                "code":"{{code}}",
                "multiplier": {{multiplier}}
            },
                {%- endfor -%}
            {%- endif %}
        ],
        cartText(showEstimatedShipping, showShippingThreshold) {
            var lines = [];
            if (this.subtotalPrice == 0) return [{ 'label': 'Total', 'value': this.formatCurrency(0) }];
            if (this.discountIndex != -1 || showEstimatedShipping) lines.push({ 'label': 'Subtotal', 'value': this.formatCurrency(this.subtotalPrice) });
            if (this.discountIndex != -1) lines.push({ 'label': 'Discount', 'value': this.formatCurrency(0 - this.discountValue) });
            if (showEstimatedShipping) lines.push({ 'label': 'Estimated Shipping', 'value': this.formatCurrency(this.shippingCost(showShippingThreshold)) });
            lines.push({ 'label': 'Total', 'value': this.totalPriceFormatted(showEstimatedShipping, showShippingThreshold) });

            return lines;
        },
        get shippingThresholdMessage() {
            var valueRemaining = this.themeSettings.freeShippingThreshold - this.totalPriceWithoutShipping;
            if (valueRemaining <= 0) return 'Congratulations, you qualify for FREE shipping!';
            return `Add ${this.formatCurrency(valueRemaining)} to your cart to qualify for FREE Shipping`;
        },
        get discountIndex() {
            return this.discounts.findIndex(x => x.code.toLowerCase() === this.discountCode.toLowerCase())
        },
        init() {
            console.log('Initializing themeAlpine');
            this.fetchCart();
        },
        async fetchCart() {
            var response = await fetch(`https://${this.storeUrl}/cart.js`);
            var data = await response.json();
            this.cart = data;
        },
        async updateCart(line, quantity) {
            var formData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'line': line,
                    'quantity': quantity,
                })
            };
            var response = await fetch(`https://${this.storeUrl}/cart/change.js`, formData);
            if (!response.ok) return this.fetchCart();
            var data = await response.json();
            this.cart.items_subtotal_price = data.items_subtotal_price;
        },
        async addCart(index, id, quantity) {
            var formData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'id': id,
                    'quantity': quantity,
                })
            };
            var response = await fetch(`https://${this.storeUrl}/cart/add.js`, formData);
            this.fetchCart();
        },
        dataImg(url) {
            if (url.includes(".jpg")) return url.replace(".jpg", "_{width}x.jpg");
            if (url.includes(".png")) return url.replace(".png", "_{width}x.png");
            return url;
        },
        formatCurrency(price) {
            var formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            });

            return formatter.format(price / 100);
        },
        discountPrice(price) {
            if (this.discountIndex == -1) return "null";
            var newPrice = price * (1 - this.discounts[this.discountIndex].multiplier);
            return this.formatCurrency(newPrice);
        },
        totalPriceFormatted(showEstimatedShipping, showShippingThreshold) {
            if (showEstimatedShipping) return this.formatCurrency(this.totalPriceWithoutShipping + this.shippingCost(showShippingThreshold));
            return this.formatCurrency(this.totalPriceWithoutShipping);
        },
        savings(price) {
            if (this.discountIndex == -1) return "null";
            var newPrice = price * this.discounts[this.discountIndex].multiplier;
            return '-' + this.formatCurrency(newPrice);
        }
    })); */
};