export default function (Alpine) {  
    console.log('Registering Storage');
    window.__daybreaks = {}
    Alpine.persistedStore = function (name, value, storage = localStorage) {
        let stored = storage.getItem(`__daybreak_${name}`)

        
        if (![null, undefined].includes(stored)) {
            const storedValue = JSON.parse(stored)
            
            const diff = Object.entries(storedValue).reduce((acc, [key, val]) => {
                if (!storedValue.hasOwnProperty(key) || Object.getOwnPropertyDescriptor(value, key).get) return acc
                acc[key] = val
                return acc
            }, {})

            value = Object.assign(value, diff)
            if (typeof storedValue == 'boolean') value = storedValue
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
        if (!imgBase.includes('{width}')) imgBase = imgBase.replace(/.jpg|.png/g,(m) => {
            return `_{width}x${m}`
        })
        let width = [180, 360, 540, 720, 900, 1080, 1296, 1512, 1728, 1944, 2160, 2376, 2592, 2808, 3024];
        let imgSrc = imgBase.replaceAll('{width}', width[1]);
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
        isOpen: false,
        get value() {
            let v = 0
            this.items.forEach(item => v += item.final_price * item.quantity || 0)
            return v
        },
        get quantity() {
            let q = 0
            this.items.forEach(item => q += item.quantity || 0)
            return q
        },
        async init(){
            this.isOpen = false
            this.items = await Daybreak.fetchCart();
        },
        open(){
            this.isOpen=true
        }
    }, sessionStorage)

    Alpine.persistedStore('subscribed', false)

    Alpine.persistedStore('recentlyViewed',{
        items: [],
        next: {},
        init(){
            if(!this.next.id) return
            if(this.items.some(i=>i.id==this.next.id)) return
            let items = this.items.slice(Math.max(this.items.length-3,0))
            items.push(this.next)
            this.next = {}
            this.items = items
        },
        add(item){
            if(!item.id) return
            if(this.items.some(i=>i.id==item.id)) return
            this.next = item
        }
    })

    Alpine.store('toast',{
        items: [],
        addToast(msg,type,title){
            let newToast = {
                type: type || 'success',
                title: title || type || 'success',
                msg: msg || false,
                show: false
            }
            this.items.push(newToast)
        }
    })

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
            if(!this.email) return
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
                this.$store.toast.addToast(`${data?.errors[0]}`,'error','Something went wrong');
                return this.errorReason = data?.errors[0];
            };
            this.$store.subscribed = true;
            if(data?.data?.is_subscribed) return this.existed = true;
            this.success = true;
            let msg = code ? 'Enjoy your coupon':'Welcome to the Legion'
            this.$store.toast.addToast(msg,'success','Thank You')
            this.fetchCoupon();
        },
        init() {
            this.open = !this.subscribed;
            console.log(`initializing email capture...subscribed: ${this.subscribed}, open: ${this.open}`);
        }
    }));

    Alpine.data('productForm',({title} = {}) => ({
        form: false,
        sending: false,
        title: title || 'product',
        async addToCart(){
            this.sending=true
            let formData = JSON.stringify({
                ...JSON.parse(serializeForm(this.form)),
                sections: ['cart-icon-bubble'],
                sections_url: window.location.pathname
              })
            this.$store.cart.items = await Daybreak.addToCartFromForm(formData,this.$store.cart.items)
            this.sending=false
        }
    }));

    Alpine.data('cart',({} = {}) => ({
        async updateCart(i,q) {
            if(this.updating) return
            let time = this.time = Date.now()
            let item = this.$store.cart.items[i]
            this.updating=true
            let response
            response = item.removed ? await Daybreak.addToCart(item.id,q,this.$store.cart.items) : await Daybreak.changeCart(i+1,q,this.$store.cart.items)
            this.$store.cart.items = time==this.time ? response : this.$store.cart.items
            this.updating=false
        },
        time: 0,
        updating: false
    }))
};