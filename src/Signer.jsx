import React, { useCallback, useState } from 'react';
import { VStack, Button, Input } from '@chakra-ui/react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { FormControl, FormLabel } from '@chakra-ui/react';
import nacl from 'tweetnacl';

export function Signer() {
  const wallet = useWallet();
  const { connection } = useConnection();

  const sign = useCallback(
    async message => {
      //   let messageToSign = `
      //         Vtopia wants you to sign in with your Solana account:
      //         solana:mainnet:FYpB58cLw5cwiN763ayB2sFT8HLF2MRUBbbyRgHYiRpK
      //         Click Sign or Approve only means you have proved this wallet is owned by you.
      //         URI: https://magiceden.io
      //         Version: 1
      //         Chain ID: solana:mainnet
      //         Nonce: bZQJ0SL6gJ
      //         Issued At: 2022-10-25T16:52:02.748Z
      //         Resources:
      //         - https://foo.com
      //         - https://bar.com`;
      const data = new TextEncoder().encode(message);
      const signature = await wallet.signMessage(data);
      const signatureBase64 = Buffer.from(signature).toString('base64');
      console.log('Signature: ' + signatureBase64);
      return signatureBase64;
    },
    [connection, wallet]
  );

  const check = useCallback(
    async (signature, message) => {
      const signatureUint8 = new Uint8Array(
        atob(signature)
          .split('')
          .map(c => c.charCodeAt(0))
      );
      const messageUint8 = new TextEncoder().encode(message);
      const pubKeyUint8 = wallet.publicKey.toBytes(); // base58.decode(publicKeyAsString)
      const result = nacl.sign.detached.verify(
        messageUint8,
        signatureUint8,
        pubKeyUint8
      ); // true or false
      console.log('Check result: ' + result);
      return result;
    },
    [connection, wallet]
  );

  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [checkResult, setCheckResult] = useState(undefined);

  return (
    <>
      <VStack width="full" spacing={8} borderRadius={10} borderWidth={2} p={10}>
        <FormControl id="send">
          <FormLabel>Sign arbitrary message</FormLabel>
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
          ></Input>
        </FormControl>
        <Button
          onClick={async () => {
            setSignature(await sign(message));
          }}
        >
          Sign
        </Button>
        {signature && (
          <>
            <FormControl>
              <FormLabel>Signature</FormLabel>
              {signature}
            </FormControl>
            <Button
              onClick={async () => {
                setCheckResult(await check(signature, message));
              }}
            >
              Check signature
            </Button>
            <FormControl>
              {checkResult === false && 'Signature INCORRECT!'}
              {checkResult === true && 'Signature correct!'}
            </FormControl>
          </>
        )}
      </VStack>
    </>
  );
}
