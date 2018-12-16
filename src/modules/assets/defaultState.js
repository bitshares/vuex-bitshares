import defaultAssets from '../../../assets';
import { arrayToObject } from '../../utils';

export const getDefaultState = () => {
  return {
    defaultAssetsIds: Object.keys(arrayToObject(defaultAssets)),
    assets: {},
    assetsByName: {},
    hiddenAssetsIds: [],
    pending: false
  };
};
