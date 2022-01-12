SELECT r.Username, SUM(r.Amount) AS Amount, SUM(r.LoyaltyPoint) AS LoyaltyPoint
FROM
(
SELECT mt.Username, mt.Money AS Amount, mt.RewardPoint AS LoyaltyPoint
FROM MemberAccTransfer AS mt
JOIN Member AS m ON m.Id = mt.MemberId
WHERE m.Status != 2 AND mt.AgentCode LIKE ?
AND mt.SuccessTime >= ? AND mt.SuccessTime <= ?
AND mt.Status = 1
AND mt.Type = 7
AND (1 = ? OR mt.Username LIKE ?)
UNION ALL
SELECT m.Username, pwt.Amount AS Amount, 0 AS LoyaltyPoint
FROM PromotionWalletTrans AS pwt
JOIN Member AS m ON m.Id = pwt.MemberId
WHERE m.Status != 2 AND m.AgentCode LIKE ?
AND pwt.CreateTime >= ? AND pwt.CreateTime <= ?
AND pwt.Status = 1
AND pwt.Type = 7
AND (1 = ? OR m.Username LIKE ?)
UNION ALL
SELECT m.Username, (pwt.Amount * -1) AS Amount, 0 AS LoyaltyPoint
FROM PromotionWalletTrans AS pwt
JOIN Member AS m ON m.Id = pwt.MemberId
WHERE m.Status != 2 AND m.AgentCode LIKE ?
AND pwt.CreateTime >= ? AND pwt.CreateTime <= ?
AND pwt.Status = 1
AND pwt.Type IN (19, 20)
AND (1 = ? OR m.Username LIKE ?)
) AS r
GROUP BY r.Username
ORDER BY r.Username
