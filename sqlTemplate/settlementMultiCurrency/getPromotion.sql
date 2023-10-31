SELECT a.Name, r.Amount
FROM
(
SELECT rr.AgentId, SUM(rr.Amount) AS Amount
FROM
  (
  SELECT SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(mt.AgentCode, 'C', '-')), '-', 2)), '-', 1) AS AgentId, IFNULL(mt.Money, 0) AS Amount
  FROM MemberAccTransfer AS mt
  JOIN Member AS m ON m.Id = mt.MemberId
  WHERE m.Status != 2 AND mt.SuccessTime >= ? AND mt.SuccessTime <= ? AND
  mt.Status = 1 AND
  mt.Type = 7
) AS rr
GROUP BY rr.AgentId
) AS r
JOIN AgentChannel AS a ON a.Id = r.AgentId
WHERE a.AgentId = ?
