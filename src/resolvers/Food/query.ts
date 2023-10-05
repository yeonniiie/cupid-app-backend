import { intArg, list, nonNull, queryField, stringArg } from "nexus";
import { evaluate } from "./services";


export const getFoodList = queryField('getFoodList', { 
    type : list('Food'),
    args : { 
        food : nonNull(list(nonNull(stringArg()))), 
    },
    resolve : async ( _, {food}, {prisma}) => {
        const result = await prisma.tb_food.findMany({
            where : {
                name : {
                    in : food
                }
            }
        });
        return result;
    }
});

export const getFoodByName  = queryField('getFoodByName', {
    type : 'Food', 
    args : { 
        food : nonNull(stringArg()), 
    },
    resolve : async ( _, {food}, {prisma} ) => {
        return await prisma.tb_food.findFirst({
            where : {
                name : food
            }
        });
    }
});

export const getFoodById = queryField('getFoodById', {
    type : 'Food', 
    args : { 
        foodId : nonNull( stringArg() ), 
    },
    resolve : async ( _, {foodId}, {prisma} ) => {
        return await prisma.tb_food.findUnique({
            where : {
                id : foodId
            }
        });
    }
});


export const getSearchList = queryField('getSearchList', { 
    type : list('Food'), 
    args : { 
        txt : stringArg(), 
    },
    resolve : async ( _, {txt}, {prisma, userId}) => {
        return await prisma.tb_food.findMany({
            where : { 
                name : { 
                    // search contains txt1 or txt2 
                    // Mysql : txt1 txt2
                    // psql : txt1 | txt2 
                    search : `*${txt}*`
                } 
            },
            orderBy : { 
                name : 'asc', 
            }
        });

    }

});

export const getSearchNLP = queryField('getSearchNLP', {
    type : list('Food'), 
    args : { 
        txt : stringArg(), 
    },
    resolve : async ( _, {txt}, {prisma, userId}) => {
        const txtList = String(txt).split(',');
        let searchText = "";
        txtList.forEach( (val, idx) => { 
            if ( txtList.length != (idx+1)) {
                searchText += val + ' ';
            }
            else {
                searchText += val;
            }
        })
        return await prisma.tb_food.findMany({
            skip : Math.floor(Math.random() * 1001),
            take :10
        });
        
        // return await prisma.tb_food.findMany({
        //     where : { 
        //         name : { 
        //             // search contains txt1 or txt2 
        //             // Mysql : txt1 txt2
        //             // psql : txt1 | txt2 
        //             search : searchText
        //         }

        //     }
        // });

    }
});

export const getEvaluationToday = queryField('getEvaluationToday', { 
    type : 'Evaluation', 
    args : { 
        date : "DateTime", 
        day : nonNull(intArg()), 
    }, 
    resolve : async ( _, {date,day}, {userId, prisma}) => {
        const user = await prisma.tb_user.findUnique({
            where : { 
                id : userId
            }
        });
        
        const diet = await prisma.tb_diet.findFirst({
            where : { 
                userId : userId, 
            }, 
            orderBy : { 
                date : 'desc'
            }
        });
        console.log(diet);
        if ( diet == null ) {
            return { 

            }
        }

        // evaluate 
        let me = [user?.gender ?? "male", user?.age ?? 23, user?.weight ?? 70, user?.height ?? 176, user?.excersize ?? 'B' ];
        const breakfast = await prisma.tb_food.findMany({
            where : { 
                id : {
                    in : diet.breakfast_id?.split(',')
                }
            }
        });
        const lunch = await prisma.tb_food.findMany({
            where : { 
                id : {
                    in : diet.lunch_id?.split(',')
                }
            }
        });
        const dinner = await prisma.tb_food.findMany({
            where : { 
                id : {
                    in : diet.dinner_id?.split(',')
                }
            }
        });

        const _snack = await prisma.tb_diet_snack.findFirst({
            where : { 
                diet_id : diet.id,
                userId : userId,
            }
        });
        const snack = await prisma.tb_food.findMany({
            where : { 
                id : { 
                    in : _snack?.snack_id?.split(',')
                }
            }
        });



        let breakfast_food : any[] = [];
        let lunch_food : any[] = [];
        let dinner_food : any[] = [];
        breakfast.forEach( ( item ) => { 
            breakfast_food.push( [item.name, item.data_type, item.kcal, item.carbs, item.protein, item.fat ]);
        });

        lunch.forEach( ( item ) => { 
            lunch_food.push( [item.name, item.data_type, item.kcal, item.carbs, item.protein, item.fat ]);
        });

        dinner.forEach( ( item ) => { 
            dinner_food.push( [item.name, item.data_type, item.kcal, item.carbs, item.protein, item.fat ]);
        });
        let data = [breakfast_food, lunch_food, dinner_food];
        console.log('data... ', data);
        return evaluate(data, me, day);
    
    }
})