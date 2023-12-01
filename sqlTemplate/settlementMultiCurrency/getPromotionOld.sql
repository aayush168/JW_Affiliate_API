SELECT a.Name, r.Amount
FROM
(
SELECT rr.AgentId, SUM(rr.Amount) AS Amount
FROM
  (
  SELECT REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(mt.AgentCode, '-', 2)), '-', 1)) AS AgentId, IFNULL(mt.Money, 0) AS Amount
  FROM MemberAccTransfer AS mt
  JOIN Member AS m ON m.Id = mt.MemberId
  WHERE mt.SuccessTime >= ? AND mt.SuccessTime <= ? AND
  mt.Status = 1 AND
  mt.Type = 7 AND
  REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(mt.AgentCode, '-', 2)), '-', 1)) != ''
  UNION ALL
  SELECT REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) AS AgentId, u.Amount
  FROM PromotionWalletTrans u
  JOIN Member AS m ON m.Id = u.MemberId
  WHERE u.CreateTime >= ? AND u.CreateTime <= ? AND u.Type=7 AND u.Status = 1
  AND REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) != ''
  UNION ALL
  SELECT REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) AS AgentId, (u.Amount * -1) AS Amount
  FROM PromotionWalletTrans u
  JOIN Member AS m ON m.Id = u.MemberId
  WHERE u.CreateTime >= ? AND u.CreateTime <= ? AND u.Type IN (19, 20) AND u.Status = 1
  AND REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) != ''
) AS rr
GROUP BY rr.AgentId
) AS r
JOIN AgentChannel AS a ON a.Id = r.AgentId
