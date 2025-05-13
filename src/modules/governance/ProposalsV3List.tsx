import { Paper } from '@mui/material';
import { useState } from 'react';
import { Proposal, useProposals } from 'src/hooks/governance/useProposals';
import { useProposalsSearch } from 'src/hooks/governance/useProposalsSearch';

import { stringToState } from './StateBadge';

export const ProposalsV3List = () => {
  const [proposalFilter] = useState<string>('all');
  const filterState = stringToState(proposalFilter);

  const [searchTerm] = useState<string>('');

  const { results: searchResults } = useProposalsSearch(searchTerm);

  const { data } = useProposals();

  let listItems: Proposal[] = [];
  if (searchTerm && searchResults.length > 0) {
    listItems = searchResults;
  }

  if (!searchTerm && data) {
    data.pages.forEach((page) => listItems.push(...page.proposals));
  }

  if (proposalFilter !== 'all') {
    listItems = listItems.filter((proposal) => proposal.badgeState === filterState);
  }

  return <Paper></Paper>;
};
