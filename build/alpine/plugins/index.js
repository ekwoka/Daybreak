import RIAS from '@ekwoka/x-rias';
import persistedStore from '@ekwoka/persistedstore';

RIASConfig = {
  shopify: true,
  autoSize: true,
  maxSize: 400
};

export default plugins = [RIAS(RIASConfig), persistedStore];
