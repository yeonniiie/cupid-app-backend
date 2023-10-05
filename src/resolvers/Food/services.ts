


//////////////////////////////////////////////////////////////////////////////

// sex, age, weight, height, excersize
let human1 = ['man', 23, 70, 176, 'B'] ;// 인간1의 신체
let food1 = 
[
    [
        ["떡볶이", "초가공식품", 900, 60, 80, 70], 
        ["케이크","초가공식품", 200, 50, 40, 60], 
        ["김치", "건강식품", 260, 80, 40, 20]
    ], 
    [], 
    [
        ["탕수육", "가공식품", 700, 30, 50, 80]], [["초콜릿", "초가공식품", 50, 9, 8, 2]
    ]
] // 식사
// evaluate(food1, human1);

//////////////////////////////////////////////////////////////////////////////



export const consume= (human) => {
    var sex : string = human[0];
    var age = human[1];
    var weight = human[2];
    var height = human[3];
    var excersize = human[4];
    var baseMetabolic; // 기초 대사량
    var activityMetabolic; // 활동 대사량
    var dailyMetabolic; // 일일 소비 칼로리

    if (sex.toLowerCase() == 'male'){        baseMetabolic = 66.47 + (13.75*weight) + (5*height) - (6.76*age)    }
    else{        baseMetabolic = 655.1 + (9.56*weight) + 1.85*height - 4.68*age    }

    switch(excersize){
        case "A": activityMetabolic = baseMetabolic*0.2; break;		// 주로 앉아서 일을 하면서 운동을 하지 않는 경우 (사무직, 활동 거의 안함)
		case "B": activityMetabolic = baseMetabolic*0.375; break;		// 가벼운 운동(사무직, 걷기 등 가벼운 활동)
		case "C": activityMetabolic = baseMetabolic*0.555; break;		// 보통 이상의 활동 (약간의 신체 활동, 주말의 여가시간에 운동)
		case "D": activityMetabolic = baseMetabolic*0.725; break;		// 적극적인 활동 및 운동 (일주일 기준 3~4회 이상의 헬스 등의 활동적인 운동)
		case "E": activityMetabolic = baseMetabolic*0.9; break;		// 매우 적극적인 활동으로, 운동선수 등
	}
    dailyMetabolic = baseMetabolic + activityMetabolic; // 일일 소비 칼로리 계산 완료
    return dailyMetabolic;
}
// food2[0] name 
// food2[1] 식품타입
// food2[2]   kcal 
// food2[3] carb
// food2[4] protein
// food2[5] province

export const calculate = (food) => { // 섭취 - 소비 = 남은 칼로리
    console.log('food... ', food);
    var daily : any[]= [];

    for (var i=0; i<food.length; i++){
        var food1 = food[i];
        var count = 0;        
        var kcal = 0;
        var carbohydrate = 0;        
        var protein = 0;        
        var province = 0;        
        var processed : any[]= [];

        for (var j=0; j<food1.length; j++){
            var food2 = food1[j];
            kcal += food2[2];
            carbohydrate += food2[3];
            protein += food2[4];
            province += food2[5];

            if (food2[1]=='초가공식품'){
                count+= 1;
                processed.push(food2[0]);       
            }
        }
        var dailyone = [kcal, carbohydrate, protein, province, count, processed]
        daily.push(dailyone);
    }

    return daily;
    
}




export const future = (w, h, kcal, day) => { 
    var futureWeight = w + kcal*0.00014285714 * day; 
    var bmi = futureWeight / ((h/100)^2);
    let expect = ""; 
    if ( bmi < 18.5) expect = "저체중"; 
    else if ( bmi >=18.5 && bmi < 25) expect = "표준"; 
    else if ( bmi >=25 && bmi < 30) expect = "과체중"; 
    else if ( bmi >=30 && bmi < 35) expect = "비만";
    else expect = "고도비만";

    return { 
        future_weight : futureWeight, 
        future_bmi : bmi,
        future_expect : expect
    };
}


export const  evaluate=(food, human, day) => {
    var daily = calculate(food);
    var dailyMetabolic = consume(human);
    var foodProcessed : any[] = [];

    console.log("오늘 식사: ");
    console.log(daily);
    console.log("오늘 소비한 칼로리: "+dailyMetabolic);
    var totalCalories = 0;    var totalCarbohydrate = 0;    
    var totalProtein = 0;    
    var totalProvince = 0;    
    var totalCount = 0;
    var b_eval = "적당히"; 
    var l_eval = "적당히"; 
    var d_eval = "적당히"; 
    var t_eval = "적당히"; 
    var eat_much = false; 

    for (let i = 0; i < daily.length; i++){
        totalCalories += daily[i][0];
        totalCarbohydrate += daily[i][1];
        totalProtein += daily[i][2];
        totalProvince += daily[i][3];
        totalCount += daily[i][4];
        for (let j in daily[i][5]){            foodProcessed.push(daily[i][5][j]);        }

        if (daily[i][0] <= 200) {
            switch(i){
                case 0: console.log("아침을 결식했어요."); b_eval = "결식"; break;
				case 1: console.log("점심을 결식했어요."); l_eval= "결식"; break;
				case 2: console.log("저녁을 결식했어요."); d_eval ="결식"; break;
				case 3: break;
            }
        }
        if (daily[i][0] >= 1200) {
            switch(i){
                case 0: console.log("아침을 과식했어요."); b_eval = "과식"; break;
				case 1: console.log("점심을 과식했어요."); l_eval = "과식"; break;
				case 2: console.log("저녁을 과식했어요."); d_eval = "과식"; break;
				case 3: break;
            }
        }
    }
    // 초가공식품 평가
    if (totalCount >= 3){
        console.log("오늘 초가공식품을 너무 많이 먹었어요.. ㅠㅠ");
        eat_much = true; 
        console.log(foodProcessed);
    }
    // 총 소모 칼로리 평가
    console.log('총섭취 : ' + totalCalories );
    if (totalCalories >= 0.75*dailyMetabolic && totalCalories <= 1.25*dailyMetabolic){
        t_eval = "적당히";
        console.log("오늘은 적당한 양의 음식을 먹었어요.");
    }

    else if (totalCalories < 0.75*dailyMetabolic){
        t_eval = "적게";
        console.log("오늘은 음식을 너무 적게 먹었어요..");
    }
    else {
        t_eval = "너무 많이";
        console.log("오늘은 음식을 너무 많이 먹었어요..");
    }

    var ratio_all = totalCarbohydrate + totalProtein + totalProvince; // 탄단지 비율 평가
	var ratio_carbohydrate = totalCarbohydrate / ratio_all * 100;
	var ratio_protein = totalProtein / ratio_all * 100;
	var ratio_province = totalProvince / ratio_all * 100;

    console.log(ratio_carbohydrate+" "+ratio_protein+" "+ratio_province);
    const futures = future(human[2], human[3], totalCalories-dailyMetabolic, day);

    return { 
        food_names : foodProcessed, //  초가공식품명
        breakfast : b_eval, 
        lunch : l_eval, 
        dinner : d_eval, 
        eat_much : eat_much, 
        eval : t_eval, 
        ratio_carb : ratio_carbohydrate, 
        ratio_protein : ratio_protein, 
        ratio_province : ratio_province, 
        future_weight : futures.future_weight, 
        future_bmi : futures.future_bmi, 
        future_expect : futures.future_expect,
        over_kcal : totalCalories - dailyMetabolic,
    };
}
