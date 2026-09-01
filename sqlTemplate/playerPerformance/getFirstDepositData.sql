SELECT IFNULL(COUNT(ma.MemberId), 0) AS Count, IFNULL(SUM(ma.FirstDepositAmount), 0) AS Deposit
FROM MemberAccount AS ma
WHERE ma.AgentCode = ?
AND ma.FirstDepositTime >= ? AND ma.FirstDepositTime <= ?
AND (1 = ? OR ma.MemberId NOT IN (?))

