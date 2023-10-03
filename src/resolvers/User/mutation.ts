import {compare, hash} from 'bcryptjs';
import {sign} from 'jsonwebtoken';
import {inputObjectType, mutationField, nonNull, stringArg} from 'nexus';

import {assert} from '../../utils/assert';
import {APP_SECRET} from '../../utils/auth';
import { AppleJwtTokenPayload, KakaoLoginUserInformationSuccessResponse, verifyAppleToken } from '../../models/User/SnsModel';
import { ErrorString } from '../../utils/error';
import { PrismaClient } from '@prisma/client';
import { NexusGenRootTypes } from '../../generated/nexus';


const {KAKAO_LOGIN_API_URL, KAKAO_LOGIN_OAUTH_URL } = process.env; 


interface createUserInput {
  email : string ,
  name? : string | null,
  nickname? : string | null,
  password? : string | null, 
  phone? : string | null, 
  thumbURL? : string | null, 
  photoURL? : string | null, 
  gender? : string | null, 
  verified? : boolean, 
  user_social : {
      socialType : string, 
      socialId : string, 
      accessToken : string, 
      refreshToken? : string | null, 
      identityToken? : string  | null
  }
}

/**
 * @description If user is already signed-up, it returns existing user. otherwise, it creates user and returns new user info. 
 * @param prisma prisma client 
 * @param data create user Input 
 * @returns AuthPayload
 * @author kook
  */
const createuser = async ( prisma : PrismaClient, data : createUserInput) :  Promise<NexusGenRootTypes['AuthPayload']> => {

  const sns = data.user_social; 
  const isUser = await prisma.tb_user_social.findFirst({
    where : { 
      socialId : sns.socialId, 
      socialType : sns.socialType
    }, 
    include : { 
      user : true, 
    },
  });
  if ( isUser !== null ) {
    await prisma.tb_user_social.update({
      where : { 
        id : isUser.id
      },
      data : {
        accessToken : sns.accessToken, 
      }
    });

    return {
      token : sign({userId : isUser.id}, APP_SECRET),
      user : isUser.user
    };
  }

  const user = await prisma.tb_user.create({
    data : { 
      email : data?.email, 
      name : data?.name ?? null, 
      nickname : data?.nickname, 
      password : data?.password, 
      phone : data?.phone, 
      // verified : data?.verified,
      user_social : { 
        create : {
          socialId : sns.socialId, 
          socialType : sns.socialType, 
          accessToken : sns.accessToken, 
          identityToken : sns.identityToken, 
          refreshToken : sns.refreshToken
        }
      },    
    }
  });

  return {
    token : sign({userId : user.id}, APP_SECRET),
    user : user
  };
}

// pubsub.publish({
//   topic: USER_SIGNED_IN,
//   payload: user,
// });

export const SignInSNS = mutationField('SignInSNS', { 
  type : "AuthPayload", 
  args : { 
    accessToken : stringArg(), 
    refreshToken : stringArg(), 
    identityToken : stringArg(), 
    service : nonNull(stringArg())
  }, 
  resolve : async ( _, args, {prisma}) => {
    // const log = logger.child({label : "SignInSNS"});
    const { service, accessToken, refreshToken, identityToken } = args; 
    assert(accessToken, ErrorString.ACCESS_TOKEN_INVALID)
    if ( service === "KAKAO") {
      const response = await fetch(`${KAKAO_LOGIN_API_URL}/v2/user/me`, {
        method : 'GET',
        headers : {
            "content-type" : "application/x-www-form-url-encoded",
            Authorization : `Bearer ${accessToken}`
        }
      });

      if ( response.ok) {
       
        const kakaoRes = (await response.json()) as KakaoLoginUserInformationSuccessResponse;
        const email = kakaoRes.kakao_account.email ??  kakaoRes.id.toString();
        const name = kakaoRes.kakao_account.profile.nickname;
        const socialId = kakaoRes.id.toString();
        const hashedPassword = await hash(socialId, 10);

        const createData : createUserInput = { 
          email : email, 
          name : name, 
          nickname : kakaoRes.kakao_account.profile.nickname,
          thumbURL : kakaoRes.kakao_account.profile.thumbnail_image_url,
          photoURL : kakaoRes.kakao_account.profile.profile_image_url,
          password : hashedPassword, 
          phone : kakaoRes.kakao_account.phone_number ?? null, 
          gender : kakaoRes.kakao_account.gender ?? null,
          verified : true,
          user_social : {
              accessToken : accessToken , 
              identityToken : identityToken ?? undefined, 
              refreshToken : refreshToken ?? undefined, 
              socialType : service, 
              socialId : socialId,
          },
        };

        return await createuser(prisma, createData);  
      }
      else {
        throw new Error('Kakao login not success. response : ' + response.json());
      }

    }
    else if ( service === "NAVER") { 
      const response = await fetch(`https://openapi.naver.com/v1/nid/me`, {
        method : 'GET', 
        headers : {
            Authorization : `Bearer ${accessToken}`
        }
      });
      const responseJson = await response.json(); 
      if ( responseJson.message === 'success') {
        const _user = responseJson.response; 
        const socialId = _user.id.toString(); 
        const hashedPassword = await hash(socialId, 10);
        const createData : createUserInput = {
          email : _user.email ?? socialId, 
          name : _user.nickname ?? "",
          nickname : _user.nickname ?? "", 
          gender : _user.gender ?? null, 
          password : hashedPassword, 
          phone : _user.phone ?? null, 
          photoURL : _user.photoURL ?? null, 
          thumbURL : _user.thumbURL ?? null, 
          verified : false , 
          user_social : {
              accessToken : accessToken ?? undefined, 
              identityToken : identityToken ?? undefined, 
              refreshToken : refreshToken ?? undefined, 
              socialId : socialId, 
              socialType : "NAVER"
          }
        };

        return await createuser(prisma, createData);  
        
      }
      else {
        throw new Error('Naver login not success. response : ' + responseJson);
      }


    }
    else if ( service === "GOOGLE") {

      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${args.accessToken}` },
        }
      );
      const user = await response.json();
      const email = user.email ;
      const name = user.given_name ?? user.name; 
      const socialId = user.id; 

      const hashedPassword = await hash(socialId, 10);
      const pic = user.picture ?? null;

      const createData : createUserInput = { 
        email : email, 
        name : name, 
        nickname : name, 
        password : hashedPassword, 
        phone : null, 
        photoURL : null , 
        thumbURL : null , 
        verified : false, 
        user_social : { 
            accessToken : accessToken ?? undefined, 
            identityToken : identityToken ?? undefined, 
            refreshToken : refreshToken ?? undefined, 
            socialId : socialId, 
            socialType : "GOOGLE", 
        }

      }
      return await createuser(prisma, createData);

    }
    else if ( service === "APPLE") {
      assert(identityToken, ErrorString.ACCESS_TOKEN_INVALID);
      let response : AppleJwtTokenPayload  | null = null;
      try {
        response = await verifyAppleToken(identityToken as string) ; 
      } catch( err) {
        // log.error('AppleJwtTokenPayload not verified : ' , err);
        throw new Error(ErrorString.ACCESS_TOKEN_INVALID);
      }
      if ( !response ) {
        // log.error('AppleJwtTokenPayload is null');
        throw new Error('AppleJwtTokenPayload is null');
      }

      // log.info('apple token verifed. response : ', response, {label : "signUp"});
      const socialId = response.sub; 
      const hashedPassword = await hash(socialId, 10);
      const createData : createUserInput = {
        email : response.email_verified ? response.email ? response.email : response.sub : response.sub, 
        password : hashedPassword, 
        verified : true, 
        user_social : {
            socialId : socialId, 
            socialType : "APPLE",
            accessToken : accessToken ?? undefined, 
            identityToken : identityToken ?? undefined, 
            refreshToken : refreshToken ?? undefined, 
        }
      }
      return await createuser(prisma, createData);  
    }
    else {
      throw new Error(ErrorString.SIGN_SNS_TYPE_UNDEFIEND);
    }
  }
});

export const SignUpEmail = mutationField("SignUpEmail", { 
  type : "AuthPayload", 
  args : { 
    email : nonNull(stringArg()), 
    password : nonNull(stringArg()), 
    name : stringArg(), 
    nickname : stringArg(), 
  },
  resolve : async ( _, args, {prisma}) => {
    const {name, email, password, nickname } = args;
    const hashedPassword = await hash(password, 10);
    const created = await prisma.tb_user.create({
      data: {
        name,
        nickname,
        email,
        password: hashedPassword,
      },
    });

    
    return {
      token: sign({userId: created.id}, APP_SECRET),
      user: created,
    };

  }
});

export const SignInEmail = mutationField("SignInEmail", { 
  type : 'AuthPayload', 
  args : {
    email : nonNull(stringArg()), 
    password : nonNull(stringArg()),     
  }, 
  resolve : async ( _, { email, password}, {prisma, request}) => {
    const user = await prisma.tb_user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new Error(`No user found for email: ${email}`);
    }

    const passwordValid = (await compare(password, user.password || '')) || false;
    if (!passwordValid) {
      throw new Error('Invalid password');
    }


    return {
      token: sign({userId: user.id}, APP_SECRET),
      user
    };
  }
});

export const UpdateProfile = mutationField("UpdateProfile" , { 
  type : "User", 
  args : {
    nickname : stringArg(), 
    password : stringArg(), 
  },

  resolve : async ( _, args, ctx) => { 
    const { prisma , userId } = ctx ; 
    const {nickname, password } = args; 
    assert(userId, ErrorString.UserNotSignedIn) ;
    const hashedPassword = await hash(password ?? "default", 10);
    const updated = await prisma.tb_user.update ( { 
      where : { 
        id : userId ,
      },
      data : { 
        nickname, 
        password : hashedPassword, 
      }
    });



    return updated; 
  }
});

export const FindMyID = mutationField("FindMyId",{
  type : "User",
  resolve : async (_, args, ctx) => {
    return null; 
  } 

});

export const FindMyPassword = mutationField("FindMyPassword", { 
  type : "User",
  resolve : async (_, args, ctx) => { 
    return null; 
  }
});