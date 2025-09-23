SELECT COUNT(m.Id) as Count
FROM Member AS m
JOIN MemberAccount AS ma
ON m.Id = ma.MemberId
JOIN AgentChannel AS a ON a.Code = ma.AgentCode
${StartDate}
${EndDate}
${AgentCode}