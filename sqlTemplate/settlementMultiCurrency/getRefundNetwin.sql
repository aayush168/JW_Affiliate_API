SELECT 
    ac.`Name` AS Name,
    `AccountingDate`,
    IFNULL(SUM(t.RefundNetWin), 0) AS TotalRefundNetWin
FROM
    (SELECT 
        SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(smid.AgentCode, 'C', '-')), '-', 2)), '-', 1) AS chGroupId,
            DATE_FORMAT(smid.AccountingDate, '%Y-%m') AS `AccountingDate`,
            SUM(smid.RefundNetWin) AS `RefundNetWin`
    FROM
        SummaryMemberInfoDaily AS smid FORCE INDEX (IDX_ACCOUNTINGDATE)
    WHERE
        smid.AccountingDate >= ?
            AND smid.AccountingDate <= ?
            AND smid.AgentCode IN (SELECT 
                Code
            FROM
                AgentChannel)
    GROUP BY DATE_FORMAT(smid.AccountingDate, '%Y-%m') , SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(smid.AgentCode, 'C', '-')), '-', 2)), '-', 1)) AS t
        LEFT JOIN
    AgentChannel AS ac ON ac.Id = t.chGroupId
WHERE
    ac.AgentId = ?
GROUP BY t.chGroupId , `AccountingDate`;
