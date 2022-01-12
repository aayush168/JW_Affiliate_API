SELECT IFNULL(SUM(TotalAmount), 0) AS TotalAmount
FROM (
  SELECT IFNULL(SUM(TotalCashback), 0) AS TotalAmount
  FROM CashbackReport
  WHERE 
    Username IN (?)
    AND AddTime >= ? AND AddTime <= ?
  UNION
  SELECT IFNULL(SUM(CashbackAmount), 0) AS TotalAmount
  FROM CashbackEarlyClaim
  WHERE
    Username IN (?)
    AND UpdateTime >= ? AND UpdateTime <= ?
  UNION
  SELECT IFNULL(SUM(Credits), 0) AS TotalAmount
  FROM LoyaltyRedeemLog
  WHERE
    Username IN (?)
    AND UpdateTime >= ? AND UpdateTime <= ?
  UNION
  SELECT IFNULL(SUM(Amount), 0) AS TotalAmount
  FROM ReferralTicket
  WHERE
    Username IN (?)
    AND UpdateTime >= ? AND UpdateTime <= ?
    AND Status != 0
  UNION
  -- SELECT IFNULL(SUM(Reward), 0) AS TotalAmount
  -- FROM TournamentRewardLog
  -- WHERE
  --   Username IN (?)
  --   AND UpdateTime >= ? AND UpdateTime <= ?
  --   AND Type = "Credits"
  -- UNION
  SELECT IFNULL(SUM(GiftQuantity), 0) AS TotalAmount
  FROM LuckyWheel_Ticket
  WHERE
    Username IN (?)
    AND UpdateTime >= ? AND UpdateTime <= ?
    AND Status = 2
    AND (GiftName = "Free Credit" || GiftName = "Free Credits")
) AS r