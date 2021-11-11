import { fetchCart } from '../../daybreak'

export default function (Alpine) {
  Alpine.persistedStore(
    'cart',
    {
      items: [],
      isOpen: false,
      get value() {
        let v = 0;
        this.items.forEach((item) => (v += item.final_price * item.quantity || 0));
        return v;
      },
      get quantity() {
        let q = 0;
        this.items.forEach((item) => (q += item.quantity || 0));
        return q;
      },
      async init() {
        this.isOpen = false;
        this.items = await fetchCart();
      },
      open() {
        this.isOpen = true;
      }
    },
    sessionStorage
  );
}
