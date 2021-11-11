export default function (Alpine) {
  Alpine.store('toast', {
    items: [],
    addToast(msg, type, title) {
      let newToast = {
        type: type || 'success',
        title: title || type || 'success',
        msg: msg || false,
        show: false
      };
      this.items.push(newToast);
    }
  });
}
