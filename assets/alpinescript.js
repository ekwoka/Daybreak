console.log(`
 ____              _                    _    
|  _ \\  __ _ _   _| |__  _ __ ___  __ _| | __
| | | |/ _\` | | | | '_ \\| '__/ _ \\/ _\` | |/ /
| |_| | (_| | |_| | |_) | | |  __/ (_| |   < 
|____/ \\__,_|\\__, |_.__/|_|  \\___|\\__,_|_|\\_\\
             |___/                           
                                    by Eric Kwoka
             `);


console.log('Registering alpine:init Listener');
document.addEventListener('alpine:init', () => {  

    /* Alpine Plugins */
    console.log('Registering Storage');
    window.__daybreaks = {}
    Alpine.persistedStore = function (name, value, storage = localStorage) {
        let stored = storage.getItem(`__daybreak_${name}`)
        
        if (![null, undefined].includes(stored)) {
            const storedValue = JSON.parse(stored)
            
            const diff = Object.entries(value).reduce((acc, [key, value]) => {
                if (storedValue.hasOwnProperty(key)) return acc
                acc[key] = value
                return acc
            }, {})

            value = Object.assign(storedValue, diff)
        }

        Alpine.store(name, value)

        window.__daybreaks[name] = Alpine.effect(() => {
            const json = JSON.stringify(
                Alpine.store(name)
            )

            storage.setItem(`__daybreak_${name}`, json)
        })
    };

    /* Alpine Stores */
    console.log('Registering Stores');
    Alpine.persistedStore('cart', {
        value: 0
    })
    Alpine.persistedStore('subscribed', false);

    Alpine.persistedStore('storage','local');
    Alpine.persistedStore('storage2','session',sessionStorage);

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
});

/* Daybreak Functions */
console.log('Registering Daybreak');
Daybreak = {
    async addToCart(id,q) {
        console.log(`Adding ${q} products of id: ${id} to Cart`);
        return 'Added to Cart';
    }
};

/* Prototypes */
window.Element.prototype._x_intersectEnter = function (callback, modifiers) {
    this._x_intersect((entry, observer) => {
        if (entry.intersectionRatio > 0) {
            
            callback()
            
            modifiers.includes('once') && observer.unobserve(this)
            
            
        }
        setTimeout(() => {
        }, 100);
    })
}

window.Element.prototype._x_intersect = function (callback) {
    let observer = new IntersectionObserver(entries => {
        entries.forEach(entry => callback(entry, observer))
    }, {
        // threshold: 1,
    })
    observer.observe(this);
    return observer
}