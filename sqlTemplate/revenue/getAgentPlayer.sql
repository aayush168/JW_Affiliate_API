SELECT Username, AgentCode
FROM Member
WHERE AgentCode LIKE ? AND Status != 2 AND Username LIKE ?