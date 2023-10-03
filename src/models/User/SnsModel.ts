
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

export interface KakaoLoginRefreshTokenSuccessResponse {
    access_token: string;
    token_type: "bearer";
    refresh_token: string;
    refresh_token_expires_in: number;
    expires_in: number;
  }
  
  export interface KakaoLoginUserInformationSuccessResponse {
    id: number;
    kakao_account: {
      profile: {
        nickname: string;
        profile_image_url: string;
        thumbnail_image_url: string;
        profile_needs_agreement: boolean;
        is_default_image: boolean;
      };
      email: string;
      email_needs_agreement: boolean;
      is_email_valid: boolean;
      is_email_verified: boolean;
      age_range: string;
      age_range_needs_agreement: boolean;
      birthday: string;
      birthday_needs_agreement: boolean;
      birthday_type: string;
      gender: string;
      gender_needs_agreement: boolean;
      phone_number: string;
      phone_number_needs_agreement: boolean;
      ci: string;
      ci_needs_agreement: boolean;
      ci_authenticated_at: string;
    };
  }

  export interface AppleJwtTokenPayload {
    iss: string;
    aud: string;
    exp: number;
    iat: number;
    sub: string;
    nonce: string;
    c_hash: string;
    email?: string;
    email_verified?: string;
    is_private_email?: string;
    auth_time: number;
    nonce_supported: boolean;
  }

  
  
  export const  verifyAppleToken = async (appleIdToken: string): Promise<AppleJwtTokenPayload> => {
    const decodedToken = jwt.decode(appleIdToken, { complete: true }) as {
      header: { kid: string; alg: jwt.Algorithm };
      payload: { sub: string };
    };
    const keyIdFromToken = decodedToken.header.kid;
  
    const applePublicKeyUrl = 'https://appleid.apple.com/auth/keys';
  
    const jwksClient = new JwksClient({ jwksUri: applePublicKeyUrl });
  
    const key = await jwksClient.getSigningKey(keyIdFromToken);
    const publicKey = key.getPublicKey();
  
    const verifiedDecodedToken: AppleJwtTokenPayload = jwt.verify(appleIdToken, publicKey, {
      algorithms: [decodedToken.header.alg]
    }) as AppleJwtTokenPayload;
  
    return verifiedDecodedToken;
  }
