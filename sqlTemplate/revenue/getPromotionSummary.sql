SELECT 
     r.Date, IFNULL( SUM( r.Amount ), 0 ) AS Promotion 
FROM (
        SELECT DATE_FORMAT( mt.SuccessTime, '%Y-%m' ) AS Date,
        IFNULL( SUM( mt.Money ), 0 ) AS Amount 
        FROM MemberAccTransfer AS mt
        JOIN Member AS m ON m.Id = mt.MemberId 
        WHERE m.STATUS in (0, 1,4)
         AND mt.AgentCode = ?
         AND mt.SuccessTime < ?
         AND mt.STATUS = 1 
         AND mt.Type = 7 
         AND m.Username LIKE ?
        GROUP BY DATE_FORMAT( mt.SuccessTime, '%Y-%m' ) 
 UNION ALL
        SELECT DATE_FORMAT( CreateTime, '%Y-%m' ) AS Date,
        IFNULL( SUM( pwt.Amount ), 0 ) AS Amount 
        FROM PromotionWalletTrans AS pwt
    JOIN (SELECT Id as MemberId FROM Member AS m WHERE m.STATUS in (0, 1,4) AND m.AgentCode = ? AND m.Username LIKE ?) as Member using (`MemberId`)
        WHERE CreateTime < ? 
         AND pwt.STATUS = 1 
         AND pwt.Type = 7 
        GROUP BY DATE_FORMAT( CreateTime, '%Y-%m' ) 
 UNION ALL
         SELECT DATE_FORMAT( CreateTime, '%Y-%m' ) AS Date,
         IFNULL( SUM( pwt.Amount ) * - 1, 0 ) AS Amount 
         FROM PromotionWalletTrans AS pwt
     JOIN (SELECT 19 as Type union SELECT 20) as Type using (`Type`)
     JOIN (SELECT Id as MemberId FROM Member AS m WHERE m.STATUS in (0, 1,4) AND m.AgentCode = ? AND m.Username LIKE ?) as Member using (`MemberId`)
         WHERE CreateTime < ? 
         AND pwt.STATUS = 1 
         GROUP BY DATE_FORMAT( CreateTime, '%Y-%m' ) 
) AS r GROUP BY r.Date;
