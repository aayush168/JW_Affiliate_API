SELECT Id AS MemberId, Username, AgentCode
FROM Member
WHERE Status != 2 AND AgentCode LIKE ? AND (1 = ? OR Username LIKE ?)