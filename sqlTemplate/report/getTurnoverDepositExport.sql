SELECT 
    smid.MemberId,
    m.Username,
    IFNULL(smbd.TotalTurnover, 0) AS TotalTurnover,
    IFNULL(smid.TotalDeposit, 0) AS TotalDeposit
FROM (
    SELECT 
        MemberId,
        SUM(IFNULL(Deposit, 0) + IFNULL(HandDeposit, 0) + IFNULL(OnlineDeposit, 0)) AS TotalDeposit
    FROM SummaryMemberInfoDaily
    WHERE AccountingDate >= ? 
      AND AccountingDate <= ?
      AND AgentCode = ?
    GROUP BY MemberId
) smid
LEFT JOIN (
    SELECT 
        MemberId,
        SUM(IFNULL(BetAmount, 0)) AS TotalTurnover
    FROM SummaryMemberBetDaily
    WHERE AccountingDate >= ? 
      AND AccountingDate <= ?
      AND AgentCode = ?
    GROUP BY MemberId
) smbd ON smbd.MemberId = smid.MemberId
JOIN Member m ON m.Id = smid.MemberId
