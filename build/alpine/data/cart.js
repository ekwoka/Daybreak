import { addToCart, changeCart } from '../../daybreak'

export default function (Alpine) {
  Alpine.data('cart', ({} = {}) => ({
    async updateCart(i, q) {
      if (this.updating) return;
      let time = (this.time = Date.now());
      let item = this.$store.cart.items[i];
      this.updating = true;
      let response;
      response = item.removed ? await addToCart(item.id, q, this.$store.cart.items) : await changeCart(i + 1, q, this.$store.cart.items);
      this.$store.cart.items = time == this.time ? response : this.$store.cart.items;
      this.updating = false;
    },
    time: 0,
    updating: false
  }));
}
