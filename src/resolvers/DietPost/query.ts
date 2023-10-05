import {intArg, list, nonNull, queryField, stringArg} from 'nexus';
import { connectionFromArray} from 'graphql-relay';
import { assert } from '../../utils/assert';
import { DateTime } from '../../models';


export const getDietDetail = queryField('getDietDetail', { 
  type : 'Diet', 
  args : { 
    id : nonNull(intArg()),
  },
  resolve : async ( _, {id}, {prisma, userId}) => {
    return prisma.tb_diet.findUnique({
      where : {
        id : id
      } 
    });
  }
});

export const getDietList = queryField('getDietList', { 
  type : list('Diet'), 
  args : { 
    startDate : nonNull('DateTime'), 
    endDate : nonNull('DateTime'), 
  },
  resolve : async ( _, {startDate, endDate}, {prisma, userId} ) => { 
    assert(userId, 'Not Authorized'); 
    return await prisma.tb_diet.findMany({
      where : { 
        userId : userId, 
        date : {
          gte : startDate, 
          lte : endDate
        }
      }, 
      include : {
        snacks : true
      },
      orderBy : {
        date : 'asc',
      }
    });
  } 
});

export const getDietRelay = queryField( (t) => {
  t.connectionField('getDietRelay', { 
    type : 'Diet', 
    additionalArgs : { 
      date : nonNull('DateTime'), 
    },
    resolve : async ( _, args, ctx) =>  { 
      assert(ctx.userId, 'Not Authorized'); 

      const result = await ctx.prisma.tb_diet.findMany({
        where : {
          userId : ctx.userId, 
        },
        include : { 
          snacks : true
        },
        orderBy : {
          date : 'asc'
        }
      })
      return connectionFromArray(result, args);
    }
  })
})