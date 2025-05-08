export const getTextFromStep = (status: string, done: boolean): string => {
  switch (status) {
    case "INTENT_SUBMITTED":
      return done ? "Intent Verified" : "Verifing Intent";
    case "INTENT_DEPOSITS_CONFIRMED":
      return done
        ? "Deposited on Source Chains"
        : "Depositing on Source Chains";
    case "INTENT_COLLECTION_COMPLETE":
      return done
        ? "Collected on Source Chains"
        : "Collecting on Source Chains";
    case "INTENT_FULFILLED":
      return done ? "Intent Fulfilled" : "Fulfilling Intent";
    case "MANUAL_STEP_1":
      return done ? "User Approved Transaction" : "Pending Transaction Approval from User";
    case "MANUAL_STEP_2":
      return done ? "Transaction Succcessful" : "Mining Transaction";
    default:
      return "Unknown status. Please contact support.";
  }
};
