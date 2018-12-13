import { Apis } from 'bitsharesjs-ws';
import { ChainTypes } from 'bitsharesjs';

let cacheParameters = false;

export const getParameters = async () => {
  if (cacheParameters) {
    return cacheParameters;
  }

  const [{ parameters }] = await Apis.instance().db_api().exec('get_objects', [['2.0.0']]);
  cacheParameters = parameters;
  return cacheParameters;
};

export const getCachedComissions = () => {
  const { current_fees: { parameters: fees, scale } } = cacheParameters;
  return { fees, scale };
};

export const getComissions = async () => {
  if (cacheParameters) {
    return getCachedComissions();
  }

  const { current_fees: { parameters: fees, scale } } = await getParameters();
  return { fees, scale };
};

export const getComissionByType = async (type) => {
  const commisions = await getComissions();

  const operations = Object.keys(ChainTypes.operations);
  const typeIdx = operations.indexOf(type);

  if (typeIdx) return commisions.fees[typeIdx][1];

  return false;
};

export default { getParameters, getComissions, getCachedComissions, getComissionByType };
