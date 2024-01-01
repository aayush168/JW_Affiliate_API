SELECT COUNT(DISTINCT(MemberId)) AS TotalCount
FROM SummaryMemberBetDaily
WHERE AgentCode = ?
AND AccountingDate >= ? AND AccountingDate <= ?
