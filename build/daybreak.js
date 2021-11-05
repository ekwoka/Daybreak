console.log(`
 ____              _                    _    
|  _ \\  __ _ _   _| |__  _ __ ___  __ _| | __
| | | |/ _\` | | | | '_ \\| '__/ _ \\/ _\` | |/ /
| |_| | (_| | |_| | |_) | | |  __/ (_| |   < 
|____/ \\__,_|\\__, |_.__/|_|  \\___|\\__,_|_|\\_\\
             |___/                           
                                    by Eric Kwoka
             `);

/* Daybreak Functions */
DEBUG_ON && console.log("Registering Daybreak");

export async function addToCart(id, q, items) {
  let response, item;
  let body = JSON.stringify({ id, q });
  try {
    response = await fetch(routes.cart_add_url, {
      ...fetchConfig("javascript"),
      body
    });
    item = await response.json();
    if(item.status == 'bad_request' || item.status == 404) throw item.description
  } catch (e) {
    console.log(e);
    Alpine.store('toast').addToast(e,'error')
    return items;
  }
  if (Array.isArray(item)) return fetchCart();
  let index = items.findIndex((e) => e.id == id);
  (index >= 0 && items[index]?.removed) && items.splice(index,1) && (index = -1);
  (index >= 0) ? items[index] = item : items.unshift(item)
  Alpine.store('toast').addToast(`${item.product_title} Added to Cart`,'success')
  return items;
}

export async function addToCartFromForm(body,items) {
  let response, item;
  try {
    response = await fetch(routes.cart_add_url, {...fetchConfig('javascript'), body});
    item = await response.json();
    if(item.status == 'bad_request' || item.status == '404') throw item.description
  } catch (e) {
    console.log(e);
    Alpine.store('toast').addToast(e,'error')
    return items;
  }
  if (Array.isArray(item)) return fetchCart();
  let id = item.id
  let index = items.findIndex((e) => e.id == id);
  index >= 0 ? (items[index] = item) : items.unshift(item)
  Alpine.store('toast').addToast(`${item.product_title} Added to Cart`,'success')
  document.querySelector('sticky-header').reveal()
  return items;
}

export async function changeCart(line, quantity, items) {
  let response, cart;
  let body = JSON.stringify({ line, quantity });
  try {
    response = await fetch(routes.cart_change_url, {
      ...fetchConfig("javascript"),
      body
    });
    cart = await response.json();
  } catch (e) {
    console.log(e);
    return fetchCart()
  }
  if(quantity==0) {
    items[line-1].removed = true
    items.push(items.splice(line-1,1)[0])
    return items;
  }
  items = cart.items;
  return items;
}

export async function fetchCart() {
  let response, cart;
  try {
    response = await fetch(routes.cart_update_url, {
      ...fetchConfig("javascript")
    });
    cart = await response.json();
  } catch (e) {
    console.log(e);
  }
  return cart.items
}

export const currency = new Intl.NumberFormat([Shopify.locale + '-'+ Shopify.country], { style: 'currency', currency: Shopify?.currency?.active || 'USD' }) || new Intl.NumberFormat([en-US], { style: 'currency', currency: USD })

export const RIAS = {
  updateSize(el) {
    let sizes = el.offsetWidth;
    let parent = el.parentNode;
    while (sizes < 100 && parent) {
      sizes = parent.offsetWidth;
      parent = parent.parentNode;
    }
    sizes += "px";
    el.setAttribute("sizes", sizes);
  },
  updateSizes(el = document) {
    DEBUG_ON && console.log('Updating Auto Sizes')
    el
      .querySelectorAll('img[data-sizes="auto"')
      .forEach((el) => this.updateSize(el));
  },
  start() {
    this.updateSizes();
    const config = { attribute: true, childList: true, subtree: true };
    const cb = (mutationsList) => {
      let crawler = (el) => {
        if (el.nodeName == "IMG") return this.updateSize(el)
        if (el.nodeType!=Node.ELEMENT_NODE) return
        el.querySelectorAll('img').forEach(el => this.updateSize(el))
      }
      mutationsList.forEach((m) => {
        m.addedNodes.forEach((el) => {
          crawler(el)
        });
      });
    };

    const observer = new MutationObserver(cb);
    observer.observe(document.body, config);
  }
};

/* Prototypes */
window.Element.prototype._x_intersectEnter = function (callback, modifiers) {
  this._x_intersect((entry, observer) => {
    if (entry.intersectionRatio > 0) {
      callback();

      modifiers.includes("once") && observer.unobserve(this);
    }
    setTimeout(() => {}, 100);
  });
};

window.Element.prototype._x_intersect = function (callback) {
  let observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => callback(entry, observer));
    },
    {
      // threshold: 1,
    }
  );
  observer.observe(this);
  return observer;
};
