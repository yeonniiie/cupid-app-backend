import {floatArg, intArg, mutationField, nonNull, stringArg} from 'nexus';

import {assert} from '../../utils/assert';

export const createDiet = mutationField('createDiet', {
  type: 'Diet',
  args: {
    title: nonNull(stringArg()),
    content: stringArg(),
    date : nonNull('DateTime'), 
    breakfastKcal : floatArg(), 
    breakfastId : nonNull(stringArg()), 
    lunchKcal : floatArg(), 
    lunchId : nonNull(stringArg()), 
    dinnerId : nonNull(stringArg()), 
    dinnerKcal : floatArg(), 

  },
  resolve: async (parent, args, {prisma, userId}) => {
    assert(userId, 'Not authorized');
    const { title, content, breakfastId, breakfastKcal, 
            lunchId, lunchKcal, dinnerId, dinnerKcal , date} = args; 
    return await prisma.tb_diet.create({
      data: {
        title,
        content,
        breakfast_tot_kcal : breakfastKcal ?? 0, 
        breakfast_id : breakfastId, 
        lunch_id : lunchId, 
        lunch_tot_kcal : lunchKcal ?? 0, 
        dinner_id : dinnerId, 
        dinner_tot_kcal  : dinnerKcal ?? 0,
        
        user : {
          connect : {
            id : userId
          }
        },
        date : date
      },
    });
  },
});

export const editDiet = mutationField('editDiet', {
  type: 'Diet',
  args: {
    id : nonNull(intArg()),
    title: nonNull(stringArg()),
    content: stringArg(),
    // date : nonNull('DateTime'), 
    breakfastKcal : floatArg(), 
    breakfastId : nonNull(stringArg()), 
    lunchKcal : floatArg(), 
    lunchId : nonNull(stringArg()), 
    dinnerId : nonNull(stringArg()), 
    dinnerKcal : floatArg(), 

  },
  resolve: async (parent, args, {prisma, userId}) => {
    assert(userId, 'Not authorized');
    const { title, content, breakfastId, breakfastKcal, 
            lunchId, lunchKcal, dinnerId, dinnerKcal , id} = args; 
    return await prisma.tb_diet.update({
      where : { 
        id : id, 
      },
      data: {
        title,
        content,
        breakfast_tot_kcal : breakfastKcal??0, 
        breakfast_id : breakfastId, 
        lunch_id : lunchId, 
        lunch_tot_kcal : lunchKcal ?? 0, 
        dinner_id : dinnerId, 
        dinner_tot_kcal  : dinnerKcal??0,
        
        // date : date
      },
    });
  },
});
export const deleteDiet = mutationField('deleteDiet', {
  type : 'Diet', 
  args : { 
    id : nonNull(intArg()), 
  }
  ,resolve : async ( _, {id}, {prisma, userId}) => {
    assert(userId, 'Not authorized');
    const _data = await prisma.tb_diet.findUnique({
      where : {
        id : id
      }
    });
    if ( _data?.userId === userId) {
      return await prisma.tb_diet.delete({
        where : { 
          id : id
        }
      });
    }
    return null; 
  }
});




export const createSnack = mutationField('createSnack', {
  type: 'Diet',
  args: {
    dietId : nonNull(intArg()), 
    snackId : nonNull(stringArg()), 
    snackKcal : floatArg(), 
    date : nonNull( 'DateTime' ), 
    time : nonNull(intArg()), 
  },
  resolve: async (parent, args, {prisma, userId}) => {
    assert(userId, 'Not authorized');
    const { date, time, snackKcal, snackId, dietId} = args; 
    return await prisma.tb_diet_snack.create({
      data: {
        date : date, 
        time : time, 
        snack_id : snackId, 
        snack_tot_kcal : snackKcal ?? 0, 
        diet_id : dietId, 
        userId : userId, 
      },
    });
  },
});

/**
 * @description 간식 수정, 시간, 간식명만 변경 가능. 
 */
export const editSnack = mutationField('editSnack', {
  type: 'Diet',
  args: {
    id : nonNull(intArg()),
    snackId : nonNull(stringArg()), 
    snackKcal : floatArg(), 
    time : nonNull(intArg()), 
  },
  resolve: async (parent, args, {prisma, userId}) => {
    assert(userId, 'Not authorized');
    const { id, time, snackKcal, snackId} = args; 
    return await prisma.tb_diet_snack.update({
      where : { id : id}, 
      data: {
        time : time, 
        snack_id : snackId, 
        snack_tot_kcal : snackKcal ?? 0, 
        userId : userId, 
      },
    });
  },
});