SELECT Username, IFNULL(SUM(TotalCashback), 0) AS Amount
FROM CashbackReport
WHERE 
  Username IN (?)
  AND AddTime >= ? AND AddTime <= ?
GROUP BY Username
UNION
SELECT Username, IFNULL(SUM(CashbackAmount), 0) AS Amount
FROM CashbackEarlyClaim
WHERE
  Username IN (?)
  AND UpdateTime >= ? AND UpdateTime <= ?
GROUP BY Username
UNION
SELECT Username, IFNULL(SUM(Credits), 0) AS Amount
FROM LoyaltyRedeemLog
WHERE
  Username IN (?)
  AND UpdateTime >= ? AND UpdateTime <= ?
GROUP BY Username
UNION
SELECT Username, IFNULL(SUM(Amount), 0) AS Amount
FROM ReferralTicket
WHERE
  Username IN (?)
  AND UpdateTime >= ? AND UpdateTime <= ?
  AND Status != 0
GROUP BY Username
UNION
-- SELECT Username, IFNULL(SUM(Reward), 0) AS Amount
-- FROM TournamentRewardLog
-- WHERE
--   Username IN (?)
--   AND UpdateTime >= ? AND UpdateTime <= ?
--   AND Type = "Credits"
-- GROUP BY Username
-- UNION
SELECT Username, IFNULL(SUM(GiftQuantity), 0) AS Amount
FROM LuckyWheel_Ticket
WHERE
  Username IN (?)
  AND UpdateTime >= ? AND UpdateTime <= ?
  AND Status = 2
  AND (GiftName = "Free Credit" || GiftName = "Free Credits")
GROUP BY Username