import contract from '@truffle/contract';

const TokenVestingJSON = require('./contracts/TokenVesting.json');
const RefinableTokenJSON = require('./contracts/RefinableToken.json');
const TokenVestingFactoryJSON = require('./contracts/TokenVestingFactory.json');

export function getVestingContract(provider, address) {
  const TokenVesting = contract(TokenVestingJSON);

  if (provider) {
    TokenVesting.setProvider(provider);
    return TokenVesting.at(address);
  }

  return null;
}

export function getTokenContract(provider, address) {
  const RefinableToken = contract(RefinableTokenJSON);

  if (provider) {
    RefinableToken.setProvider(provider);
    return RefinableToken.at(address);
  }

  return null;
}

export function getVestingFactoryContract(provider, address) {
  const TokenVestingFactory = contract(TokenVestingFactoryJSON);

  if (provider) {
    TokenVestingFactory.setProvider(provider);
    return TokenVestingFactory.at(address);
  }

  return null;
}
