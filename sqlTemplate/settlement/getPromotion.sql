SELECT a.Name, r.Amount
FROM
(
SELECT rr.AgentId, SUM(rr.Amount) AS Amount
FROM
  (
  SELECT REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(mt.AgentCode, '-', 2)), '-', 1)) AS AgentId, IFNULL(mt.Money, 0) AS Amount
  FROM MemberAccTransfer AS mt
  JOIN Member AS m ON m.Id = mt.MemberId
  WHERE m.Status != 2 AND mt.SuccessTime >= ? AND mt.SuccessTime <= ? AND
  mt.Status = 1 AND
  mt.Type = 7 AND
  REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(mt.AgentCode, '-', 2)), '-', 1)) != ''
) AS rr
GROUP BY rr.AgentId
) AS r
JOIN Agent AS a ON a.Id = r.AgentId
