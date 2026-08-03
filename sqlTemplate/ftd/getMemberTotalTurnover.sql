SELECT MemberId, SUM(IFNULL(BetAmount, 0)) AS TotalTurnover
FROM SummaryMemberBetDaily
Where MemberId IN (?)
GROUP BY MemberId