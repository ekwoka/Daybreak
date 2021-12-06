import RIAS from '@ekwoka/x-rias';
import persistedStore from '@ekwoka/persistedstore';
import trap from '@alpinejs/trap/src';

RIASConfig = {
  shopify: true,
  autoSize: true,
  maxSize: 400
};

export default plugins = [RIAS(RIASConfig), persistedStore, trap];
