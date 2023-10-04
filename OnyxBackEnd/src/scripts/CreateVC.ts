import {
    JsonSchema,
    KeyDIDMethod,
    EthrDIDMethod,
    SchemaManager,
    createCredentialFromSchema,
  } from "@jpmorganchase/onyx-ssi-sdk";
  
  import {ethrProvider } from "../../config";
  
  import { camelCase } from "lodash";
  import path from "path";
  import {
    ISSUER_ES256K_PRIVATE_KEY,
    HOLDER_ES256K_PRIVATE_KEY,
    VC_DIR_PATH,
    VC_SCHEMA_URL,
  } from "../../config";
  
  import { privateKeyBufferFromString } from "../utils/convertions";
  import { writeToFile } from "../utils/writer";

  import userData from "./../data/userData.json";
  
  // add ethers library
  const ethers = require('ethers');
  
  const createVcWithAdditonalParams = async (VC_SCHEMA_URL: string) => {
    // const didKey = new KeyDIDMethod();
    // const ethrDID = new EthrDIDMethod({
      const didEthr = new EthrDIDMethod(ethrProvider);

    // replace didKey with didEthr
  
    const issuerDidWithKeys = await didEthr.generateFromPrivateKey(
      // privateKeyBufferFromString(ISSUER_EDDSA_PRIVATE_KEY)

      // looks like it generates a issuer DID from private key
      (ISSUER_ES256K_PRIVATE_KEY)
    );
    
    console.log('Issuer DID:', issuerDidWithKeys)

    console.log('Issuer DID:', issuerDidWithKeys.did)
  
    const holderDidWithKeys = await didEthr.generateFromPrivateKey(
      // privateKeyBufferFromString(HOLDER_EDDSA_PRIVATE_KEY)
      (HOLDER_ES256K_PRIVATE_KEY)
    );

     // looks like it generates a holder DID from private key
    console.log('Holder DID:', holderDidWithKeys)
    console.log('Holder DID:', holderDidWithKeys.did)


    // looks like it creates a DID for the VC
    const vcDidKey = (await didEthr.create()).did;
  
    const credentialType = "PROOF_OF_ADDRESS";
  
    const subjectData = userData;


    //Setting an expiration data parameter for the VC
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(new Date().getFullYear() + 1);
  
    const expirationDate = oneYearFromNow.toISOString();
  
    const additionalParams = {
      id: vcDidKey,
      expirationDate: expirationDate,
    };
  
    //Schema validation
    const proofOfAddressSchema = await SchemaManager.getSchemaRemote(
      VC_SCHEMA_URL
    );
  
    const validation: any = await SchemaManager.validateCredentialSubject(
      subjectData,
      proofOfAddressSchema as JsonSchema
    );
  
    if (validation) {
      console.log(
        `\nGenerating Verifiable Credential of type ${credentialType}\n`
      );
  

      // looks like it creates a VC officially here.
      const vc = await createCredentialFromSchema(
        VC_SCHEMA_URL,
        issuerDidWithKeys.did,
        holderDidWithKeys.did,
        subjectData,
        credentialType,
        additionalParams
      );
  
      console.log(JSON.stringify(vc, null, 2));
  
        // added for splitting signature if there is a signature.
        if (vc.proof && vc.proof.signature) {
          const { v, r, s } = ethers.utils.splitSignature(vc.proof.signature);
          console.log('V:', v);
          console.log('R:', r);
          console.log('S:', s);
        } else {
          console.log('No signature found in the Verifiable Credential.');
        }
  
        
      writeToFile(
        path.resolve(VC_DIR_PATH, `${camelCase(credentialType)}.json`),
        JSON.stringify(vc, null, 2)
      );
    } else {
      console.log(validation.errors);
    }
  };
  
  const main = () => {
    VC_SCHEMA_URL
      ? createVcWithAdditonalParams(VC_SCHEMA_URL)
      : console.log(
          "Could not find a remote URL for the VC Schema, please review the VC_SCHEMA_URL field in your .env file"
        );
  };
  main();
  