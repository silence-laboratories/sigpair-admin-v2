# sigpair-admin-v2

This is the Admin SDK for Sigpair. The admin acts as the interface between the Sigpair node and the Sigpair client. The admin SDK is used to create and register new users, and to generate user tokens for existing users.

Admin actions: 
- Create and register a new user with the sigpair node.
- Generate a user token for a user, which can be used (by the user) to authenticate with the sigpair node.


## Usage example

```typescript
import * as ed from "@noble/ed25519";
import { SigpairAdmin } from "sigpair-admin-v2";
async function main() {
  const adminToken =
    "1ec3804afc23258f767b9d38825dc7ab0a2ea44ef4adf3254e4d7c6059c3b55a";
  const admin = new SigpairAdmin(
    adminToken,
    // Base url of the sigpair node
    "http://localhost:8080"
  );

  // Create a new user with the sigpair node
  const userId = await admin.createUser("user-name");
  console.log(userId);

  // Generate a new signing key pair for the user
  // In a real application, the user keys should be generated on the client side by the user.
  const sk = ed.utils.randomPrivateKey();

  // Get the public key from the private key
  const pk = await ed.getPublicKeyAsync(sk);

  const token = admin.genUserToken(18, ed.etc.bytesToHex(pk));
  console.log(token);
}

main();


```


