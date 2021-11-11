export default function (Alpine) {
  Alpine.data('emailCapture', ({ provider, listID, code } = {}) => ({
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
      };
    },
    get subscribed() {
      return this.$store.subscribed;
    },
    email: '',
    open: false,
    sending: false,
    sent: false,
    success: false,
    error: false,
    existed: false,
    errorReason: '',
    fetchCoupon() {
      if (this.code) return fetch(`/discount/${code}`);
    },
    async submitEmail() {
      if (!this.email) return;
      this.sending = true;
      data = new URLSearchParams();
      data.set('g', this.listID);
      data.set('email', this.email);
      response = await fetch(this.url, this.fetchData(data.toString()));
      if (response.ok) {
        this.sending = false;
        this.sent = true;
      }
      data = await response?.json();
      if (!data?.success) {
        this.error = true;
        this.$store.toast.addToast(`${data?.errors[0]}`, 'error', 'Something went wrong');
        return (this.errorReason = data?.errors[0]);
      }
      this.$store.subscribed = true;
      if (data?.data?.is_subscribed) return (this.existed = true);
      this.success = true;
      let msg = code ? 'Enjoy your coupon' : 'Welcome to the Legion';
      this.$store.toast.addToast(msg, 'success', 'Thank You');
      this.fetchCoupon();
    },
    init() {
      this.open = !this.subscribed;
      DEBUG_ON && console.log(`Initializing Email Capture...Subscribed: ${this.subscribed}, Open: ${this.open}`);
    }
  }));
}
