import * as Daybreak from './daybreak';

import Alpine from 'alpinejs/src';

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
      `<booster-wrapper id='bgs-aov-app' class='flex p-2 tracking-wide leading-6 text-black border-2 border-red-600 border-dashed focus:shadow-none list-outside gap-2 items-center mb-2'>`,
      `<input type='checkbox' class='inline-block flex-shrink-0 p-0 my-0 mr-1 ml-0 !w-4 h-6 text-blue-600 align-middle bg-white rounded-none border border-gray-600 border-solid cursor-default select-none box-border focus:border-transparent focus:shadow-none hover:border-transparent text-xl' id='bgs-checkmark' value='${upsell.pid}'/>`,
      `<div class='leading-6 focus:shadow-none'>`,
      `<label for='bgs-checkmark' id='priority_order_sms'>${upsell.text}</label> <a href='#view' class='text-black underline cursor-pointer focus:shadow-none'>${upsell.viewtext}</a>`,
      `</div>`,
      `<booster-modal class='hidden overflow-auto fixed top-0 left-0 pt-12 w-full h-full leading-6 bg-gray-500 focus:shadow-none z-50'><div
      class="relative p-5 m-auto w-11/12 text-black bg-white border border-gray-600 border-solid box-border focus:shadow-none max-w-2xl"
    ><span
    class="float-right absolute text-4xl font-bold text-red-700 focus:shadow-none focus:text-black focus:no-underline hover:text-black hover:no-underline py-4 px-8 top-0 right-0"
    >&times;</span><img src='${upsell.img}' class="block w-full max-w-full h-auto align-middle focus:shadow-none"/></div></booster-modal>`,
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

  let inCart = isInCart(upsell.pid);

  let upsellNode = upsellDisplay(upsell);

  DEBUG_ON && console.log(upsellNode);

  if (!upsell.img) upsellNode.querySelector('a').style.display = 'none';

  if (!upsell.viewtext) upsellNode.querySelector('a').style.display = 'none';

  upsellNode.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    upsellNode.querySelector('booster-modal').style.display = 'block';
  });
  upsellNode.querySelectorAll('booster-modal > span, booster-modal').forEach((el) => el.addEventListener('click', (e) => (upsellNode.querySelector('booster-modal').style.display = 'none')));

  upsellNode.querySelector('#bgs-checkmark').addEventListener('change', async ({ target }) => {
    if (target.checked) return Daybreak.addToCart(upsell.pid,1,Alpine.store('cart').items);
    return Alpine.store('cart').items = await Daybreak.changeCart(upsell.pid,0,Alpine.store('cart').items);
  });

  [inCart] = await Promise.all([inCart]);
  DEBUG_ON && console.log(inCart);
  if (inCart) return;

  addToCart.parentNode.insertBefore(upsellNode, addToCart);
  DEBUG_ON && console.timeEnd('AOV_BOOSTER')
}