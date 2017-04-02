SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Michael Rubin
-- Create date: 4/2/2017
-- Description:	
--
-- EXEC dbo.[edges_by_nonentity] '2013-12-01', 12163258
--
-- =============================================
ALTER PROCEDURE dbo.[edges_by_nonentity] (
	@d DATE,
	@node_id INT,
	@incl_entity BIT = 1,
	@incl_officer BIT = 1,
	@incl_intermediary BIT = 1
)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @i INT = 1
	DECLARE @max_iterations INT = 15
	DECLARE @max_rows INT = 1000

	DECLARE @t TABLE (
		[date] DATE,
		[node_id1] INT, 
		[node_type_1] VARCHAR( 20 ), 
		[country_code_1] CHAR( 3 ),
		[node_id2] INT, 
		[node_type_2] VARCHAR( 20 ), 
		[country_code_2] CHAR( 3 ),
		[includes_entity] BIT, 
		[includes_officer] BIT, 
		[includes_intermediary] BIT, 
		[weight] INT
	)

	INSERT @t
	SELECT 
		[date],
		[node_id1], 
		[node_type_1], 
		COALESCE( [country_code_1a], [country_code_1b], [country_code_1c] )[country_code_1],
		[node_id2], 
		[node_type_2], 
		COALESCE( [country_code_2a], [country_code_2b], [country_code_2c] )[country_code_2],
		[includes_entity], 
		[includes_officer], 
		[includes_intermediary], 
		[weight]
	FROM [Date_Edge] 
	WHERE
		[date] = @d 
	AND [node_type_1] != 'entity' 
	AND	[node_id1] = @node_id

	DECLARE @row_count INT
	WHILE( 1 = 1 )
		BEGIN
		INSERT @t
		SELECT 
			de.[date],
			de.[node_id1], 
			de.[node_type_1], 
			COALESCE( de.[country_code_1a], de.[country_code_1b], de.[country_code_1c] )[country_code_1],
			de.[node_id2], 
			de.[node_type_2], 
			COALESCE( de.[country_code_2a], de.[country_code_2b], de.[country_code_2c] )[country_code_2],
			de.[includes_entity], 
			de.[includes_officer], 
			de.[includes_intermediary], 
			de.[weight]
		FROM [Date_Edge] de JOIN @t t ON( de.[node_id1] = t.node_id2 AND de.[date] = t.[date] )
		WHERE
			de.[includes_entity] <= @incl_entity
		AND	de.[includes_officer] <= @incl_officer
		AND	de.[includes_intermediary] <= @incl_intermediary
		AND NOT EXISTS( SELECT NULL FROM @t t1 WHERE t1.[node_id1] = de.[node_id1] AND t1.[node_id2] = de.[node_id2] )
		--AND	t.[node_type_2] != 'entity'

		SET @row_count = @@ROWCOUNT

		INSERT @t
		SELECT 
			de.[date],
			de.[node_id1], 
			de.[node_type_1], 
			COALESCE( de.[country_code_1a], de.[country_code_1b], de.[country_code_1c] )[country_code_1],
			de.[node_id2], 
			de.[node_type_2], 
			COALESCE( de.[country_code_2a], de.[country_code_2b], de.[country_code_2c] )[country_code_2],
			de.[includes_entity], 
			de.[includes_officer], 
			de.[includes_intermediary], 
			de.[weight]
		FROM [Date_Edge] de JOIN @t t ON( de.[node_id2] = t.node_id2 AND de.[date] = t.[date] )
		WHERE
			de.[includes_entity] <= @incl_entity
		AND	de.[includes_officer] <= @incl_officer
		AND	de.[includes_intermediary] <= @incl_intermediary
		AND NOT EXISTS( SELECT NULL FROM @t t1 WHERE t1.[node_id1] = de.[node_id1] AND t1.[node_id2] = de.[node_id2] )
		--AND	t.[node_type_2] != 'entity'

		SET @row_count =  @row_count + @@ROWCOUNT

		INSERT @t
		SELECT 
			de.[date],
			de.[node_id1], 
			de.[node_type_1], 
			COALESCE( de.[country_code_1a], de.[country_code_1b], de.[country_code_1c] )[country_code_1],
			de.[node_id2], 
			de.[node_type_2], 
			COALESCE( de.[country_code_2a], de.[country_code_2b], de.[country_code_2c] )[country_code_2],
			de.[includes_entity], 
			de.[includes_officer], 
			de.[includes_intermediary], 
			de.[weight]
		FROM [Date_Edge] de JOIN @t t ON( de.[node_id1] = t.node_id1 AND de.[date] = t.[date] )
		WHERE
			de.[includes_entity] <= @incl_entity
		AND	de.[includes_officer] <= @incl_officer
		AND	de.[includes_intermediary] <= @incl_intermediary
		AND NOT EXISTS( SELECT NULL FROM @t t1 WHERE t1.[node_id1] = de.[node_id1] AND t1.[node_id2] = de.[node_id2] )
		--AND	t.[node_type_2] != 'entity'

		SET @row_count =  @row_count + @@ROWCOUNT
		IF( @row_count = 0 ) BREAK

		IF( ( SELECT COUNT( * ) FROM @t ) > @max_rows  ) BREAK;

		IF( @i > @max_iterations ) BREAK;
		SET @i = @i + 1

		END

	SELECT 
		COALESCE( e1.[name], o1.[name], i1.[name] ) [node1_name],
		COALESCE( e2.[name], o2.[name], i2.[name] ) [node2_name],
		t.[date],
		t.[node_id1], 
		t.[node_type_1], 
		t.[country_code_1],
		e.[rel_type],
		t.[node_id2], 
		t.[node_type_2], 
		t.[country_code_2],
		t.[includes_entity], 
		t.[includes_officer], 
		t.[includes_intermediary], 
		t.[weight]
	FROM @t t
		JOIN [Edge] e ON( e.[node_1] = t.[node_id1] AND e.[node_2] = t.[node_id2] )
		LEFT JOIN [Entity] e1 ON( e1.[node_id] = t.[node_id1] AND t.[node_type_1] = 'entity' )
		LEFT JOIN [Officer] o1 ON( o1.[node_id] = t.[node_id1]  AND t.[node_type_1] = 'officer' )
		LEFT JOIN [Intermediary] i1 ON( i1.[node_id] = t.[node_id1] AND t.[node_type_1] = 'intermediary' )
		LEFT JOIN [Entity] e2 ON( e2.[node_id] = t.[node_id2]  AND t.[node_type_2] = 'entity' )
		LEFT JOIN [Officer] o2 ON( o2.[node_id] = t.[node_id2]  AND t.[node_type_2] = 'officer' )
		LEFT JOIN [Intermediary] i2 ON( i2.[node_id] = t.[node_id2] AND t.[node_type_2] = 'intermediary' )

	
END
GO
