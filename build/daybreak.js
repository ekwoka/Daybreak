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
console.log("Registering Daybreak");

export async function addToCart(id, q, cart) {
  let response, item;
  let body = JSON.stringify({ id, q });
  try {
    response = await fetch(routes.cart_add_url, {
      ...fetchConfig("javascript"),
      body
    });
    item = await response.json();
  } catch (e) {
    console.log(e);
  }
  let index = cart.items.findIndex((e) => e.id == id);
  index >= 0 ? (cart.items[index] = item) : cart.items.push(item);
  return cart;
}

export async function addToCartFromForm(body,cart) {
  let response, item;
  try {
    response = await fetch(routes.cart_add_url, {...fetchConfig('javascript'), body});
    item = await response.json();
    if(item.status == 'bad_request') throw item.description
  } catch (e) {
    console.log(e);
    return cart;
  }
  let id = item.id
  let index = cart.items.findIndex((e) => e.id == id);
  index >= 0 ? (cart.items[index] = item) : cart.items.push(item);
  return cart;
}

export async function changeCart(i, q, cart) {
  let response, item;
  let body = JSON.stringify({ i, q });
  try {
    response = await fetch(routes.cart_change_url, {
      ...fetchConfig("javascript"),
      body
    });
    item = await response.json();
  } catch (e) {
    console.log(e);
  }
  let index = cart.items.findIndex((e) => e.id == item.id);
  index >= 0 ? (cart.items[index] = item) : cart.items.push(item);
  return cart;
}

export const currency = new Intl.NumberFormat([Shopify.locale + '-'+ Shopify.country], { style: 'currency', currency: Shopify.currency.active }) || new Intl.NumberFormat([en-US], { style: 'currency', currency: USD })

export const RIAS = {
  updateSize(el) {
    let sizes = el.offsetWidth;
    let parent = el.parentNode;
    while (sizes < 100 && parent) {
      width = parent.offsetWidth;
      parent = parent.parentNode;
    }
    sizes += "px";
    el.setAttribute("sizes", sizes);
  },
  updateSizes() {
    document
      .querySelectorAll('img[data-sizes="auto"')
      .forEach((el) => this.updateSize(el));
  },
  start() {
    this.updateSizes();
    const config = { attribute: false, childList: true, subtree: true };
    const cb = (mutationsList) => {
      mutationsList.forEach((m) => {
        m.addedNodes.forEach((el) => {
          if (el.nodeName == "IMG") this.updateSize(el);
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
