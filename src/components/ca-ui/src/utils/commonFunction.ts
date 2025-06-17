import Decimal from "decimal.js";

const formatNumber = (val: number) => {
  return Intl.NumberFormat().format(val);
};

const asyncIntervals: Array<boolean> = [];

const runAsyncInterval = async (
  cb: () => Promise<void>,
  interval: number,
  intervalIndex: number
) => {
  if (asyncIntervals[intervalIndex]) {
    await cb();
    setTimeout(() => runAsyncInterval(cb, interval, intervalIndex), interval);
  }
};

const setAsyncInterval = (cb: () => Promise<void>, interval: number) => {
  if (cb && typeof cb === "function") {
    const intervalIndex = asyncIntervals.length;
    asyncIntervals.push(true);
    setTimeout(() => runAsyncInterval(cb, interval, intervalIndex), interval);
    return intervalIndex;
  } else {
    throw new Error("Callback must be a function");
  }
};

const clearAsyncInterval = (intervalIndex: number) => {
  if (asyncIntervals[intervalIndex]) {
    asyncIntervals[intervalIndex] = false;
  }
};

const THRESHOLD_AMOUNT = new Decimal(1).mul(Decimal.pow(10, -6));

const getReadableNumber = (input: string) => {
  const n = new Decimal(input);
  if (n.isZero()) {
    return "0";
  }
  if (n.lessThan(THRESHOLD_AMOUNT)) {
    return `~${THRESHOLD_AMOUNT.toFixed()}`;
  }
  return n.toFixed(6);
};

export {
  getReadableNumber,
  setAsyncInterval,
  clearAsyncInterval,
  formatNumber,
};
