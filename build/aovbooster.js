import * as Daybreak from './daybreak';

import Alpine from './alpine';

const AOVBOOSTER_ENABLED = true;

const upsells = {
  'pitcher-upsell': {
    pid: 40651784552623,
    text: 'Check box to add a two pack replacement filter for only $43.99',
    viewtext: 'View',
    img: 'https://cdn.shopify.com/s/files/1/0561/2427/6911/products/2pack_2000x.png?v=1624367883'
  },
  'shower-upsell': {
    pid: 40075585847471,
    text: 'Check box to add a third replacement filter for only $39.99 and have filtered water in your shower for up to 18 months!',
    viewtext: 'View',
    img: 'https://cdn.shopify.com/s/files/1/0561/2427/6911/products/Replacement1_2000x.jpg?v=1619537358'
  },
  default: {
    pid: 39969695236271,
    text: 'Check Box To Add Priority Processing For $6.99!',
    viewtext: 'View ',
    img: 'https://cdn.shopify.com/s/files/1/0561/2427/6911/files/Image_from_iOS_2.jpg?v=1622737677'
  }
};

const DOM = new DOMParser();

function upsellDisplay(upsell) {
  let upsellNode = DOM.parseFromString(
    [
      `<booster-wrapper style='border:3px dashed #FE3223;padding:9px;'   id='bgs-aov-app' class='bgs-row-app'>`,
      `<div class='bgs-col-1'>`,
      `<input type='checkbox' class='bgs-checkmark'  id='bgs-checkmark' value='${upsell.pid}'/>`,
      `</div>`,
      `<div class='bgs-col-2' style='color:#000000;'>`,
      `<label for='bgs-checkmark' id='priority_order_sms'>${upsell.text}</label> <a href='#view' style='color:#000000;' class='modal-bgs-link'>${upsell.viewtext}</a>`,
      `</div>`,
      `<booster-modal class='modal-bgs-app-order'><div class='modal-content-bgs-app-order'><span class='close-bgs-app-order'>&times;</span><img src='${upsell.img}' class='bgs-popup-modal-image' /></div></booster-modal>`,
      `</booster-wrapper>`
    ].join(''),
    'text/html'
  ).body.firstChild;

  return upsellNode;
}

const addToCart =
  document.querySelector('form[action="/cart/add"] input[name="add"]:nth-of-type(1)') ||
  document.querySelector('form[action="/cart/add"] button[name="add"]:nth-of-type(1)') ||
  document.querySelector('form[action="/cart/add"] button[type="submit"]:nth-of-type(1),form[action="/cart/add"] input[type="submit"]:nth-of-type(1)');

DEBUG_ON && console.log(addToCart);

async function isInCart(pid) {
  return new Promise(async (resolve, reject) => {
    let items = Alpine.store('cart').items || await Daybreak.fetchCart();
    resolve(items.some((item) => item.variant_id === pid));
  });
}

function loadCSS() {
  document.head.appendChild(DOM.parseFromString('<link rel="stylesheet" href="https://revenuebump.com/PriorityOrderApp/frontview/bgspriroityappcss?shop=the-water-filters-store.myshopify.com" />', 'text/html').head.firstChild);
}

export default async function () {
  DEBUG_ON && console.time('AOV_BOOSTER')
  if (!AOVBOOSTER_ENABLED) return;
  if (!window.location.pathname.includes('products')) return;
  if (!addToCart) return;

  const tags = (await (await fetch(`${window.location.pathname}.json`)).json()).product.tags.split(', ');
  DEBUG_ON && console.log(tags);

  if (!tags.length) return;

  let upsell = upsells[tags.find((tag) => upsells.hasOwnProperty(tag))] || upsells.default;
  DEBUG_ON && console.log(upsell);
  if (!upsell) return;

  loadCSS();
  let inCart = isInCart(upsell.pid);

  let upsellNode = upsellDisplay(upsell);

  DEBUG_ON && console.log(upsellNode);

  if (!upsell.img) upsellNode.querySelector('.modal-bgs-link').style.display = 'none';

  if (!upsell.viewtext) upsellNode.querySelector('.modal-bgs-link').style.display = 'none';

  upsellNode.querySelector('.modal-bgs-link').addEventListener('click', (e) => {
    e.preventDefault();
    upsellNode.querySelector('.modal-bgs-app-order').style.display = 'block';
  });
  upsellNode.querySelectorAll('.close-bgs-app-order, .modal-bgs-app-order').forEach((el) => el.addEventListener('click', (e) => (upsellNode.querySelector('.modal-bgs-app-order').style.display = 'none')));

  upsellNode.querySelector('.bgs-checkmark').addEventListener('change', async ({ target }) => {
    if (target.checked) return Daybreak.addToCart(upsell.pid,1,Alpine.store('cart').items);
    return Alpine.store('cart').items = await Daybreak.changeCart(upsell.pid,0,Alpine.store('cart').items);
  });

  [inCart] = await Promise.all([inCart]);
  DEBUG_ON && console.log(inCart);
  if (inCart) return;

  addToCart.parentNode.insertBefore(upsellNode, addToCart);
  DEBUG_ON && console.timeEnd('AOV_BOOSTER')
}