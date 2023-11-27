import jwt from "jsonwebtoken";
import axios, { AxiosError } from "axios";

/// Unique user identifier
export type UserId = number;

/**
 *  Sigpair Admin class
 *  This class is used to perform admin actions, i.e create users and generate user tokens.
 */
export class SigpairAdmin {
  adminToken: Buffer;
  baseUrl: string;

  /**
   * Create a SigpairAdmin instance
   * @param adminToken Admin token in hex format. Same admin token used in the Sigpair node. Must be 32 bytes long (64 chars). Supports token with or without 0x prefix.
   * @param baseUrl Base url of the Sigpair server
   */
  constructor(adminToken: string, baseUrl: string) {
    if (adminToken.startsWith("0x")) {
      adminToken = adminToken.slice(2);
    }

    this.adminToken = Buffer.from(adminToken, "hex");
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new user, with a given name
   * @param userName Name of the user to create
   * @returns UserId of the created user
   */
  async createUser(userName: string): Promise<UserId> {
    let iat = Math.floor(Date.now() / 1000);
    let claim: CreateUserRequest = {
      name: userName,
      iat,
      exp: iat + 5 * 60,
    };
    const token = jwt.sign(claim, this.adminToken);
    try {
      const res = await axios.post(
        `${this.baseUrl}/v1/create-user`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data.user_id;
    } catch (e) {
      if (e instanceof AxiosError) {
        console.log(e.message);
      } else {
        console.log(e);
      }
      throw e;
    }
  }

  /**
   * Generate a user token for a given user id and public key. This token can be used to perform all user actions.
   * @param userId UserId of the user to generate token for
   * @param userPubkey Signing public key (ed25519, 32 bytes) of the user as hex string. Supports key with or without 0x prefix.
   * @param lifetime Lifetime of the token in seconds. Default is 1 hour.
   * @returns Generated token, that can be used for all user actions.
   */
  genUserToken(
    userId: UserId,
    userPubkey: string,
    lifetime: number = 60 * 60
  ): string {
    if (userPubkey.startsWith("0x")) {
      userPubkey = userPubkey.slice(2);
    }
    let iat = Math.floor(Date.now() / 1000);
    let claim: UserTokenRequest = {
      user_id: userId,
      iat,
      exp: iat + lifetime,
      public_key: userPubkey,
    };

    const token = jwt.sign(claim, this.adminToken);
    return token;
  }
}

/**
 * Create user request
 */
export type CreateUserRequest = {
  /**
   * Name of the user to create
   */
  name: string;
  /**
   * Issued at timestamp
   */
  iat: number;
  /**
   * Expiry timestamp
   */
  exp: number;
};

/**
 * User token request
 */
export type UserTokenRequest = {
  /**
   * User id
   */
  user_id: number;
  /**
   * Issued at timestamp
   */
  iat: number;
  /**
   * Expiry timestamp
   */
  exp: number;
  /**
   * User public key
   */
  public_key: string;
};
