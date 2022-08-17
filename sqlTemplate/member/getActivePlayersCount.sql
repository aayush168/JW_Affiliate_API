SELECT COUNT(DISTINCT(MemberId)) AS TotalCount
FROM SummaryMemberBetDaily
WHERE AgentCode LIKE ?
AND AccountingDate >= ? AND AccountingDate <= ?
