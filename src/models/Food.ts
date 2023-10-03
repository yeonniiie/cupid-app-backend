import { objectType } from "nexus";

export const tb_food = objectType({
    name : "Food", 
    definition(t) {
        t.string('id');
        t.string('name');
        t.string('main_category');
        t.string('sub_category');
        t.string('data_cd');
        t.string('data_cd_name');
        t.string('data_type');
        t.int('kcal');
        t.string('kcal_unit');
        t.float('ash');
        t.float('moisture');
        t.float('carbs');
        t.float('fat');
        t.float('protein');
        t.float('fiber');
        t.float('calcium');
        t.float('magnesium');
        t.float('iron');
        t.float('sugar');
        t.float('potassium');
        t.float('sodium');
        t.float('vitaminA');
        t.float('vitaminC');
        t.float('vitaminD');

        t.float('retinol');
        t.float('beta_carotene');
        t.float('riboflavin');
        t.float('niacin');
        t.float('cholesterol');
        t.float('saturated_fat');
        t.float('trans_fat');

    }
})

export const tb_user = objectType({
    name : "User", 
    definition(t) {
        t.string('id');
        t.string('email');
        t.string('password');
        t.string('name');
        t.string('nickname');
        t.string('thumbURL');
        t.string('photoURL');
        t.date('birthDay');
        t.string('gender');
        t.string('phone');
        t.string('social_id');
        t.string('social_type');


    }
})



export const Diet = objectType({
    name : "Diet", 
    definition(t) {
        t.int('id');
        t.string('title');
        t.string('content');
        t.boolean('published');
        t.string('breakfast_id');
        t.float('breakfast_tot_kcal');
        t.string('lunch_id');
        t.float('lunch_tot_kcal');
        t.string('dinner_id');
        t.float('dinner_tot_kcal');
        t.int('snack_id');
        t.list.field('snacks', {
            type : "DietSnack",
            resolve :async (_, args, ctx) => {
                if ( _.id!) return null;

                return ctx.prisma.tb_diet_snack.findMany({
                    where : {
                        diet_id : Number(_.id)
                    }
                })
            }
        });

        t.date('createdAt');
        t.date('updatedAt');
        t.date('deletedAt');
        //t.snacks  tb_diet_snack[]
        t.string('userId');
        //t.user   tb_user
        t.field('user',{
            type : "User",
            resolve : async (_, args, ctx) => {
                return ctx.prisma.tb_user.findUnique({
                    where : {
                        id : String(_.userId)
                    }
                });

            }

        });
    }
})

export const tb_diet_snack = objectType({
    name : 'DietSnack', 
    definition(t) {
        t.int('id'); 
        t.int('diet_id'); 
        t.field('diet', {
            type :'Diet',
            resolve :async (_, args, ctx) =>{
                return ctx.prisma.tb_diet.findUnique({
                    where : {
                        id : Number(_.diet_id)
                    }
                })
            }
        });

        t.string('snack_id');
        t.float('snack_tot_kcal');

        t.date('date');
        t.int('time');

        t.string('userId');

        t.date('createdAt');
        t.date('updatedAt');
        t.date('deletedAt');

    }

});

     