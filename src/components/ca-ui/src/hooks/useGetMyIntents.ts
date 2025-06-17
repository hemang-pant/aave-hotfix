import { useContext } from "react";
import { CAContext } from "../context";
import { useQuery } from "@tanstack/react-query";

const INTENT_LIST_KEY = "__ilk__";

const useGetMyIntents = (page = 1) => {
  const { ca, ready, address } = useContext(CAContext);
  const result = useQuery({
    queryKey: [INTENT_LIST_KEY, address, page],
    queryFn: async () => {
      if (ca && ready && address) {
        return ca.getMyIntents(page);
      }
      return [];
    },
    // FIXME: make it longer, just use mutation to refresh
    refetchInterval: 100_000,
    enabled: ready && ca !== null,
  });

  return result;
};

export { useGetMyIntents };
