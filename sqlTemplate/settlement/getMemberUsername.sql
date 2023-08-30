SELECT
	a.NAME,
	r.Username,
	r.MemberId 
FROM
	(
	SELECT
	IF
		( a.ParentId != 0, a.ParentId, m.AgentId ) AS AgentId,
		m.Username,
		m.Id AS MemberId 
	FROM
		Member AS m
		JOIN Agent AS a ON m.AgentId = a.Id 
	WHERE
		m.AgentId != 0 
		AND m.STATUS != 2 
		AND m.AddTime <= ?
	) AS r
	JOIN Agent AS a ON r.AgentId = a.Id