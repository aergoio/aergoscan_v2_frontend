import BigNumber from "bignumber.js";

export function formatPercentageText(balance, totalSupply) {
    let percentage = new BigNumber(balance + "00").div(new BigNumber(totalSupply));

    if (percentage.lte(new BigNumber(0.001))) {
        return new BigNumber(0.001);
    }

    return percentage.dp(3, BigNumber.ROUND_DOWN);// new BigNumber(balance + "00").div(new BigNumber(totalSupply)) .toFixed(3)
}
