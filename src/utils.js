import Web3 from 'web3';

const web3 = new Web3();

export function formatTokenNum(x, symbol) {
  if (!x) return 'loading...';
  return parseFloat(web3.utils.fromWei(x, 'ether')).toFixed(2) + ` ${symbol}`;
}

export function abbreviateAddress(address) {
  return address.substr(0, 6) + '...' + address.substr(address.length - 4, 4);
}
