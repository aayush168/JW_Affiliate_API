SELECT IFNULL(ma.FirstDepositAmount, 0) AS Deposit, m.Username
FROM MemberAccount AS ma
JOIN Member AS m ON m.Id = ma.MemberId
WHERE ma.AgentCode = ?
AND ma.FirstDepositTime >= ? AND ma.FirstDepositTime <= ?

