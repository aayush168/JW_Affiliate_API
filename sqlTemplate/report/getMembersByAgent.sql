SELECT Id AS MemberId, Username
FROM Member
WHERE AgentCode = ?
AND (1 = ? OR Username LIKE ?)
ORDER BY Username
