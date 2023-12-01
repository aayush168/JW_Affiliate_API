SELECT IFNULL(SUM(w.Money), 0) AS Amount
FROM Withdraw AS w
JOIN Member AS m ON m.Id = w.MemberId
WHERE w.AgentCode LIKE ?
AND w.AddTime >= ? AND w.AddTime <= ?
AND w.Status = 1
AND (1 = ? OR w.MemberUserName LIKE ?)
