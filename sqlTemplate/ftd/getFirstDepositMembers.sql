SELECT m.Username, ma.FirstDepositAmount as Amount, ma.FirstDepositTime
FROM Member AS m
JOIN MemberAccount AS ma
ON m.Id = ma.MemberId
${StartDate}
${EndDate}
${AgentCode}
ORDER BY ma.FirstDepositTime DESC
LIMIT ?,?