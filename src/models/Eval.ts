import { objectType } from "nexus";

export const Evaluation = objectType({
    name : "Evaluation", 
    definition(t) {
        t.list.string('food_names'); 
        t.string('breakfast'); 
        t.string('lunch'); 
        t.string('dinner'); 
        t.boolean('eat_much'); 
        t.string('eval'); 
        t.string('ratio_carb');
        t.string('ratio_protein'); 
        t.string('ratio_province'); 
        
        t.string('future_weight'); 
        t.string('future_bmi'); 
        t.string('future_expect'); 

    },
})