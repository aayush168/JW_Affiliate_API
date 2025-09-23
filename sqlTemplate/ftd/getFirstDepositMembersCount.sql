SELECT COUNT(MemberId) as Count
FROM Member AS m
JOIN MemberAccount AS ma
ON m.Id = ma.MemberId
${StartDate}
${EndDate}
${AgentCode}