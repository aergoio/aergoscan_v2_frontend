const BigNumber = require('bignumber.js');

//문자열 프로토타입으로 입력 길이만큼 앞에 pad 문자로 채운 문자열 반환
String.prototype.fillPadStart = function(width, pad){
    return this.length >= width ? this : new Array(width-this.length+1).join(pad)+this;//남는 길이만큼 pad로 앞을 채움
}

//문자열 프로토타입으로 입력 길이만큼 앞에 pad 문자로 채운 문자열 반환
String.prototype.fillPadEnd = function(width, pad){
    return this.length >= width ? this : this + new Array(width-this.length+1).join(pad);//남는 길이만큼 pad로 뒤를 채움
}

export  function formatBigNumAmount(amount = "0", unLimitDecimalPoint = false, decimalPoint = 6, pointPos = 18) {
    if(amount === "0") return `<span class="aergo">0.000000</span>`;

    let strOrgAmt = amount;
    if(amount.length <= pointPos) {
        strOrgAmt = amount.fillPadStart(pointPos+1, "0");
    }

    const strIntValue = strOrgAmt.slice(0, strOrgAmt.length - pointPos);
    const strDecimalValue = strOrgAmt.slice(-pointPos, strOrgAmt.length);
    const strPoint = strIntValue + "." + strDecimalValue;
    const bigAmount = new BigNumber(strPoint);

    let calcDecimalPoint = decimalPoint;
    if (unLimitDecimalPoint) {
        let i = strDecimalValue.length-1;
        while(true) {
            let unit = strDecimalValue[--i];
            if(i < 0 || unit !=="0") {
                calcDecimalPoint = i+2;
                break;
            }
        }
    }

    const decimalBigAmt = bigAmount.dp(calcDecimalPoint, 1);
    let strFixedAmt = decimalBigAmt.toFixed(calcDecimalPoint).toString();
    if(bigAmount.isInteger() && unLimitDecimalPoint) {
        // strFixedAmt = decimalBigAmt.toFixed(decimalPoint).toString();
    }

    // 정수 여부
    if(bigAmount.isInteger()) {
        const arrayFixedAmt = strFixedAmt.split(".");
        return arrayFixedAmt[0] +`.`+ `<span class="aergo">` + arrayFixedAmt[1] + `</span>`;
    }

    if(bigAmount.isLessThanOrEqualTo(decimalBigAmt)) {
        const arrayFixedAmt = strFixedAmt.split(".");
        let foundIndex = 0;
        let i = calcDecimalPoint;
        while(true) {
            let unit = arrayFixedAmt[1][--i];
            if(i < 0 || unit !=="0") {
                foundIndex = i+1;
                break;
            }
        }
        if (foundIndex !== calcDecimalPoint) {
            return arrayFixedAmt[0] +`.` + arrayFixedAmt[1].substr(0, foundIndex) + `<span class="aergo">` + arrayFixedAmt[1].substr(foundIndex, arrayFixedAmt[1].length-foundIndex) + `</span>`
        }
        return strFixedAmt;
    }

    // console.log(strFixedAmt)
    return strFixedAmt;
}
