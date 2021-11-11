import { addToCartFromForm } from "../../daybreak";

export default function (Alpine) {
  Alpine.data('productForm', ({ title } = {}) => ({
    form: false,
    sending: false,
    title: title || 'product',
    async addToCart() {
      this.sending = true;
      let formData = JSON.stringify({
        ...JSON.parse(serializeForm(this.form)),
        sections: ['cart-icon-bubble'],
        sections_url: window.location.pathname
      });
      this.$store.cart.items = await addToCartFromForm(formData, this.$store.cart.items);
      this.sending = false;
    }
  }));
}
