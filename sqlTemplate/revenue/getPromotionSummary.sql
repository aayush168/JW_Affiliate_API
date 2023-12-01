SELECT 
     r.Date, IFNULL( SUM( r.Amount ), 0 ) AS Promotion 
FROM (
	SELECT DATE_FORMAT( mt.SuccessTime, '%Y-%m' ) AS `Date`,
	IFNULL( SUM( mt.Money ), 0 ) AS Amount 
	FROM MemberAccTransfer AS mt
	LEFT JOIN `Member` AS `m` ON `m`.`Id` = `mt`.`MemberId` 
	WHERE mt.`AgentCode` = ?
	 AND mt.`SuccessTime` < ?
	 AND mt.`Status` = 1 
	 AND mt.`Type` = 7
   AND m.Username LIKE ?
	GROUP BY DATE_FORMAT( mt.SuccessTime, '%Y-%m' ) 
	UNION ALL
	-- Conduct a consolidated computation for Type In (7, 19, 20) and employ a Case condition to identify which Types should have their Amounts treated as negative.
	SELECT 
			DATE_FORMAT( CreateTime, '%Y-%m' ) AS Date,
	    IFNULL( SUM( CASE WHEN `Type` = 7 THEN pwt.Amount ELSE pwt.Amount*-1 END ), 0 ) AS Amount 
	FROM PromotionWalletTrans AS pwt
	JOIN (
		SELECT Id as MemberId 
		FROM Member AS m 
		WHERE m.AgentCode = ?
    AND m.Username LIKE ?
	) as `Member` USING (`MemberId`)
	JOIN (SELECT 7 AS `Type` UNION SELECT 19 UNION SELECT 20) AS `t` USING (`Type`)
	WHERE CreateTime < ?
	AND pwt.`Status` = 1 
	GROUP BY DATE_FORMAT( CreateTime, '%Y-%m' ) 
) `r` GROUP BY r.Date;