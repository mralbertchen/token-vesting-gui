// VestingInterface.js

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import BN from 'bn.js';

import { getVestingContract, getTokenContract } from './contract';
import { formatTokenNum } from './utils';

import {
  Box,
  Button,
  Heading,
  Progress,
  Table,
  Tbody,
  Td,
  Tr,
  Text,
} from '@chakra-ui/react';

const TOKEN_CONTRACT_ADDRESS =
  process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS ||
  '0x9162fac403ce763fb80884822d8ae9601f0406fa';

function VestingInterface({ vestingContractAddress }) {
  const [vestingState, setVestingState] = useState({});
  const [isClaiming, setIsClaiming] = useState(false);

  console.log(vestingState);

  const metamask = window.ethereum;

  const getData = async () => {
    const vestingContract = await getVestingContract(
      metamask,
      vestingContractAddress
    );

    const tokenContract = await getTokenContract(
      metamask,
      TOKEN_CONTRACT_ADDRESS
    );

    const symbol = await tokenContract.symbol();

    const start = (await vestingContract.start()).toNumber();
    const duration = (await vestingContract.duration()).toNumber();
    const cliff = (await vestingContract.cliff()).toNumber();

    const released = await vestingContract.released(TOKEN_CONTRACT_ADDRESS);

    const balance = await tokenContract.balanceOf(vestingContractAddress);

    const total = released.add(balance);

    const vested = await vestingContract.vestedAmount(TOKEN_CONTRACT_ADDRESS);

    const remaining = total.sub(vested);

    const releasable = vested.sub(released);

    setVestingState({
      start,
      duration,
      released,
      vested,
      balance,
      releasable,
      symbol,
      cliff,
      total,
      remaining,
    });
  };

  useEffect(() => {
    getData();
    const interval = setInterval(getData, 5000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const claimTokens = async () => {
    setIsClaiming(true);

    try {
      const vestingContract = await getVestingContract(
        metamask,
        vestingContractAddress
      );

      const data = vestingContract.contract.methods
        .release(TOKEN_CONTRACT_ADDRESS)
        .encodeABI();

      const transactionParameters = {
        gas: '0x30D40', // customizable by user during MetaMask confirmation.
        to: vestingContractAddress, // Required except during contract publications.
        from: metamask.selectedAddress, // must match user's active address.
        value: '0x00', // Only required to send ether to the recipient from the initiating external account.
        data,
      };

      // txHash is a hex string
      // As with any RPC call, it may throw an error
      await metamask.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
    } catch (err) {
      console.error(err);
    }

    setIsClaiming(false);
  };

  return (
    <Box>
      <Heading size="md" mb={5}>
        Vesting Details
      </Heading>

      <Box mb={5}>
        {vestingState.vested ? (
          <>
            <Progress
              value={vestingState.vested
                .mul(new BN(100))
                .div(vestingState.total)
                .toNumber()}
            />
            <Text align="center">
              {formatTokenNum(vestingState.vested, vestingState.symbol)} /{' '}
              {formatTokenNum(vestingState.total, vestingState.symbol)}
            </Text>
          </>
        ) : (
          ''
        )}
      </Box>
      <Table
        variant="simple"
        size="md"
        borderRadius="12px"
        borderWidth="1px"
        style={{ borderCollapse: 'initial' }}
      >
        <Tbody>
          <Tr>
            <Td>
              <strong>Contract Address</strong>
            </Td>
            <Td>{vestingContractAddress}</Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Start date</strong>
            </Td>
            <Td>
              {vestingState.cliff
                ? moment(vestingState.cliff * 1000).format('YYYY/MM/DD HH:mm')
                : 'loading...'}
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>End date</strong>
            </Td>
            <Td>
              {vestingState.cliff
                ? moment(
                    (vestingState.cliff + vestingState.duration) * 1000
                  ).format('YYYY/MM/DD HH:mm')
                : 'loading...'}
            </Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Total tokens</strong>
            </Td>
            <Td>{formatTokenNum(vestingState.total, vestingState.symbol)}</Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Already vested</strong>
            </Td>
            <Td>{formatTokenNum(vestingState.vested, vestingState.symbol)}</Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Remaining to vest</strong>
            </Td>
            <Td>
              {formatTokenNum(vestingState.remaining, vestingState.symbol)}
            </Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Already claimed</strong>
            </Td>
            <Td>
              {formatTokenNum(vestingState.released, vestingState.symbol)}
            </Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Releasable</strong>
            </Td>
            <Td>
              {formatTokenNum(vestingState.releasable, vestingState.symbol)}{' '}
              <Button
                onClick={claimTokens}
                colorScheme="green"
                ml={5}
                isDisabled={isClaiming}
              >
                Claim
              </Button>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
}

export default VestingInterface;
