SELECT a.Username AS AgentUsername, r.Username AS MemberUsername, r.Amount, r.FirstDepositTime
FROM
(
SELECT ma.AgentCode, m.Username, ma.FirstDepositAmount AS Amount, ma.FirstDepositTime
FROM Member AS m
JOIN MemberAccount AS ma
ON m.Id = ma.MemberId
${StartDate}
${EndDate}
) AS r
JOIN AgentChannel AS a ON a.Code = r.AgentCode
${AgentCode}
ORDER BY r.FirstDepositTime DESC
LIMIT ?,?