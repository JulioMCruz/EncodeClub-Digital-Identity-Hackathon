import {
  DIDWithKeys,
  EthrDIDMethod,
  JWTService,
  KeyDIDMethod,
} from "@jpmorganchase/onyx-ssi-sdk";
import { camelCase, includes } from "lodash";
import path from "path";
import {
  // HOLDER_EDDSA_PRIVATE_KEY,
  // ISSUER_EDDSA_PRIVATE_KEY,
  ISSUER_ES256K_PRIVATE_KEY,
  VC,
  VC_DIR_PATH,
  ethrProvider,
} from "../../config";
import { privateKeyBufferFromString } from "../utils/convertions";
import { writeToFile } from "../utils/writer";

const { verifyJWT } = require('@jpmorganchase/onyx-ssi-sdk');

const didKey = new KeyDIDMethod();
const jwtService = new JWTService();

const signVc = async (issuerDidWithKeys: DIDWithKeys, vc: any) => {
  return jwtService.signVC(issuerDidWithKeys, vc);
};

const main = async () => {
  if (VC_DIR_PATH && VC) {
    console.log("\nReading an existing verifiable credential\n");

    const vc = require(path.resolve(VC_DIR_PATH, VC));
    console.log(JSON.stringify(vc, null, 2));

    if (includes(vc.id, "ethr")) {
      console.log("VC did method: did:ethr");

      const didEthr = new EthrDIDMethod(ethrProvider);
      const didWithKeys = await didEthr.generateFromPrivateKey(
        ISSUER_ES256K_PRIVATE_KEY
      );

      if (didWithKeys.did === vc.issuer.id) {
        console.log("\nSigning the VC\n");
        const jwt = await signVc(didWithKeys, vc);
        console.log(jwt);

        writeToFile(
          path.resolve(VC_DIR_PATH, `${camelCase(vc.type[1])}.jwt`),
          jwt
        );  
      } else {
        console.log("ISSUER_ES256K_PRIVATE_KEY cannot sign this verifiable credential\n");
      }
    } else if (includes(vc.id, "key")) {
      console.log("\nVC did method: did:key\n");

    } else {
      console.log("\nVC DID method not found");
    }
  } else {
    console.log("\nVC DID method not found");
  }
};

main();