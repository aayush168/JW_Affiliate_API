SELECT a.Name, f.Date, f.Promotion
FROM (
  SELECT r.AgentId, r.Date, IFNULL(SUM(r.Amount), 0) AS Promotion
  FROM (
    SELECT (REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1))) AS AgentId, DATE_FORMAT(mt.SuccessTime, '%Y-%m') AS Date, IFNULL(SUM(mt.Money), 0) AS Amount
  FROM MemberAccTransfer AS mt
  JOIN Member AS m ON m.Id = mt.MemberId
  WHERE
      m.Status != 2
      AND REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) != ''
      AND mt.SuccessTime < ?
      AND mt.Status = 1
      AND mt.Type = 7
  GROUP BY REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) , DATE_FORMAT(mt.SuccessTime, '%Y-%m')
  UNION ALL
  SELECT (REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1))) AS AgentId, DATE_FORMAT(CreateTime, '%Y-%m') AS Date, IFNULL(SUM(pwt.Amount), 0) AS Amount
  FROM PromotionWalletTrans AS pwt
  JOIN Member AS m ON m.Id = pwt.MemberId
  WHERE
    m.Status != 2
    AND REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) != ''
    AND CreateTime < ?
    AND pwt.Status = 1
    AND pwt.Type = 7
  GROUP BY REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) , DATE_FORMAT(CreateTime, '%Y-%m')
  UNION ALL
  SELECT (REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1))) AS AgentId, DATE_FORMAT(CreateTime, '%Y-%m') AS Date, IFNULL(SUM(pwt.Amount) * - 1, 0) AS Amount
  FROM PromotionWalletTrans AS pwt
  JOIN Member AS m ON m.Id = pwt.MemberId
  WHERE
    m.Status != 2
    AND REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) != ''
    AND CreateTime < ?
    AND pwt.Status = 1
    AND pwt.Type IN (19 , 20)
  GROUP BY REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) , DATE_FORMAT(CreateTime, '%Y-%m')
  ) AS r
  GROUP BY r.AgentId, r.Date
) AS f
JOIN AgentChannel AS a ON a.Id = f.AgentId
WHERE a.AgentId = ?
