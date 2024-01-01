SELECT Id AS MemberId, Username, AgentCode
FROM Member
WHERE Status != 2 AND AgentCode = ? AND (1 = ? OR Username LIKE ?)