export default function (Alpine) {
  Alpine.persistedStore('recentlyViewed', {
    items: [],
    next: {},
    init() {
      if (!this.next.id) return;
      if (this.items.some((i) => i.id == this.next.id)) return;
      let items = this.items.slice(Math.max(this.items.length - 3, 0));
      items.push(this.next);
      this.next = {};
      this.items = items;
    },
    add(item) {
      if (!item.id) return;
      if (this.items.some((i) => i.id == item.id)) return;
      this.next = item;
    }
  });
}
