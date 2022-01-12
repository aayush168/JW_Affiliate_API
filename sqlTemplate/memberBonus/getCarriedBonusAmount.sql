SELECT DATE_FORMAT(AddDate, '%Y-%m') AS Date, IFNULL(SUM(TotalAmount), 0) AS TotalAmount
FROM (
  SELECT DATE(AddTime) AS AddDate, IFNULL(SUM(TotalCashback), 0) AS TotalAmount
  FROM CashbackReport
  WHERE 
    Username IN (?)
    AND AddTime <= ?
  GROUP BY DATE(AddTime)
  UNION
  SELECT DATE(UpdateTime) AS AddDate, IFNULL(SUM(CashbackAmount), 0) AS TotalAmount
  FROM CashbackEarlyClaim
  WHERE
    Username IN (?)
    AND UpdateTime <= ?
  GROUP BY DATE(UpdateTime)
  UNION
  SELECT DATE(UpdateTime) AS AddDate, IFNULL(SUM(Credits), 0) AS TotalAmount
  FROM LoyaltyRedeemLog
  WHERE
    Username IN (?)
    AND UpdateTime <= ?
  GROUP BY DATE(UpdateTime)
  UNION
  SELECT DATE(UpdateTime) AS AddDate, IFNULL(SUM(Amount), 0) AS TotalAmount
  FROM ReferralTicket
  WHERE
    Username IN (?)
    AND UpdateTime <= ?
    AND Status != 0
  GROUP BY DATE(UpdateTime)
  UNION
  -- SELECT DATE(UpdateTime) AS AddDate, IFNULL(SUM(Reward), 0) AS TotalAmount
  -- FROM TournamentRewardLog
  -- WHERE
  --   Username IN (?)
  --   AND UpdateTime <= ?
  --   AND Type = "Credits"
  -- GROUP BY DATE(UpdateTime)
  -- UNION
  SELECT DATE(UpdateTime) AS AddDate, IFNULL(SUM(GiftQuantity), 0) AS TotalAmount
  FROM LuckyWheel_Ticket
  WHERE
    Username IN (?)
    AND UpdateTime <= ?
    AND Status = 2
    AND (GiftName = "Free Credit" || GiftName = "Free Credits")
  GROUP BY DATE(UpdateTime)
) AS r
GROUP BY DATE_FORMAT(AddDate, '%Y-%m')