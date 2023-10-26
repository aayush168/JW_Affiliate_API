SELECT Id AS MemberId, Username, AgentCode
FROM Member
WHERE AgentCode = ? AND Status != 2 AND Username LIKE ?