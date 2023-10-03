import { intArg, list, nonNull, queryField, stringArg } from "nexus";


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
                    search : `${txt}`
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
            where : { 
                name : { 
                    // search contains txt1 or txt2 
                    // Mysql : txt1 txt2
                    // psql : txt1 | txt2 
                    search : searchText
                }

            }
        });

    }
})