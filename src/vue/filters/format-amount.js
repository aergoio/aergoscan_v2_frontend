const BigNumber = require('bignumber.js');

//문자열 프로토타입으로 입력 길이만큼 앞에 pad 문자로 채운 문자열 반환
String.prototype.fillPadStart = function(width, pad){
    return this.length >= width ? this : new Array(width-this.length+1).join(pad)+this;//남는 길이만큼 pad로 앞을 채움
}

//문자열 프로토타입으로 입력 길이만큼 앞에 pad 문자로 채운 문자열 반환
String.prototype.fillPadEnd = function(width, pad){
    return this.length >= width ? this : this + new Array(width-this.length+1).join(pad);//남는 길이만큼 pad로 뒤를 채움
}

export  function formatBigNumAmount(amount = "0", decimalPoint = 6, pointPos = 18) {
    if(amount === "0") return `0.000<span class="aergo">000</span>`;

    let strOrgAmt = amount;
    if(amount.length <= pointPos) {
        strOrgAmt = amount.fillPadStart(pointPos+1, "0");
    }

    const strPoint = strOrgAmt.slice(0, strOrgAmt.length - pointPos) + "." + strOrgAmt.slice(-pointPos, strOrgAmt.length);

    const bigAmount = new BigNumber(strPoint);
    const decimalBigAmt = bigAmount.dp(decimalPoint, 1);
    const strFixedAmt = decimalBigAmt.toFixed(decimalPoint).toString();

    if(bigAmount.isLessThanOrEqualTo(decimalBigAmt)) {
        return strFixedAmt.slice(0, strFixedAmt.length - 3) + `<span class="aergo">` + strFixedAmt.slice(-3) + `</span>`;
    }

    // console.log(strFixedAmt)
    return strFixedAmt;
}
