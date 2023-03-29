import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { Alchemy, Network, Utils } from "alchemy-sdk";
import { ethers } from "ethers";
import { useState } from "react";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  async function connect() {
    if (window.ethereum) {
      // Create a new Web3Provider with the injected provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Request access to the user's wallet
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Get the signer from the provider, which is used to sign transactions
      const signer = provider.getSigner();

      // Use the signer to interact with the blockchain
      setUserAddress(await signer.getAddress());

      console.log("userAddress: ", userAddress.toString());
    } else {
      console.log("No web3 provider detected");
    }
  }
  // main();

  async function getTokenBalance() {
    try {
      const config = {
        apiKey: import.meta.env.REACT_APP_ALCHEMY_API_KEY,
        network: Network.ETH_MAINNET,
      };

      const alchemy = new Alchemy(config);
      const provider = alchemy.config.getProvider();
      const data = await alchemy.core.getTokenBalances(userAddress);

      setResults(data);
      setIsLoading(true);

      const tokenDataPromises = [];

      for (let i = 0; i < data.tokenBalances.length; i++) {
        const tokenData = alchemy.core.getTokenMetadata(
          data.tokenBalances[i].contractAddress
        );
        tokenDataPromises.push(tokenData);
      }

      setTokenDataObjects(await Promise.all(tokenDataPromises));
      setHasQueried(true);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }
  return (
    <Box w="100vw">
      <Flex
        w="100%"
        h="100px"
        bg="blue"
        pos="absolute"
        top="0"
        color="white"
        alignItems="center"
        justifyContent="center"
      >
        <Heading fontSize={36}>ERC-20 Token Indexer</Heading>
        <Button
          fontSize={20}
          onClick={connect}
          mt={36}
          bgColor="blue"
          ml={36}
          right="20"
          top="0"
          position="absolute"
        >
          Connect Wallet
        </Button>
      </Flex>
      <Center>
        <Flex
          alignItems={"center"}
          justifyContent="center"
          flexDirection={"column"}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={"center"}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        {/* <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        /> */}
        {userAddress ? <Text>{userAddress}</Text> : ""}

        {isLoading ? "Loading..." : "Please make a query! "}
        <Button fontSize={20} onClick={getTokenBalance} mt={36} bgColor="blue">
          Check ERC-20 Token Balances
        </Button>

        <Heading my={36}>ERC-20 token balances:</Heading>

        {hasQueried ? (
          <SimpleGrid w={"90vw"} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={"column"}
                  color="white"
                  bg="blue"
                  w={"20vw"}
                  key={e.id}
                >
                  <Box>
                    <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {parseFloat(
                      Utils.formatUnits(
                        e.tokenBalance,
                        tokenDataObjects[i].decimals
                      )
                    ).toFixed(2)}
                  </Box>
                  <Center>
                    <Image
                      borderRadius="full"
                      boxSize="50px"
                      src={tokenDataObjects[i].logo}
                    />
                  </Center>
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          ""
        )}
      </Flex>
    </Box>
  );
}

export default App;
