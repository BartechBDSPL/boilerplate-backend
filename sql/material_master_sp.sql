USE [matrix_cosmec]
GO
/****** Object:  StoredProcedure [dbo].[sp_material_master_insert]    Script Date: 12/16/2025 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_material_master_insert]
@materialNumber nvarchar(100),
@materialDescription nvarchar(255),
@eanNumber nvarchar(13),
@createdBy nvarchar(50)
AS
DECLARE
@Status as CHAR(1),
@Message as NVARCHAR(100)
BEGIN
	IF EXISTS (SELECT 1 FROM material_master WHERE material_number = @materialNumber)
		BEGIN
			SET @Status = 'F';
			SET @Message = 'Material already exists.'
			SELECT @Status as 'Status' , @Message as 'Message';
			RETURN;
		END
	ELSE
		BEGIN
			INSERT INTO material_master (material_number , material_description , ean_number,
						 created_by , created_date)
			VALUES			(@materialNumber , @materialDescription , @eanNumber,
						 @createdBy , GETDATE());
			SET @Status = 'T';
			SET @Message = 'Material added successfully';
			SELECT @Status as 'Status' , @Message as 'Message';				 
		END
END




USE [matrix_cosmec]
GO
/****** Object:  StoredProcedure [dbo].[sp_material_master_update]    Script Date: 12/16/2025 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_material_master_update]
@id int,
@materialNumber nvarchar(100),
@materialDescription nvarchar(255),
@eanNumber nvarchar(13),
@updatedBy nvarchar(50)
AS
DECLARE
@Status as CHAR(1),
@Message as NVARCHAR(100)
BEGIN
	IF NOT EXISTS (SELECT 1 FROM material_master WHERE id = @id)
		BEGIN
			SET @Status = 'F';
			SET @Message = 'Material does not exist.'
			SELECT @Status as 'Status' , @Message as 'Message';
			RETURN;
		END
	ELSE IF EXISTS (SELECT 1 FROM material_master WHERE material_number = @materialNumber and id<>@id)
		BEGIN
			SET @Status = 'F';
			SET @Message = 'Material number already exists.'
			SELECT @Status as 'Status' , @Message as 'Message';
			RETURN;
		END
	ELSE IF EXISTS (SELECT 1 FROM material_master WHERE material_description = @materialDescription  and id<>@id)
		BEGIN
			SET @Status = 'F';
			SET @Message = 'Material description already exists.'
			SELECT @Status as 'Status' , @Message as 'Message';
			RETURN;
		END
	ELSE
		BEGIN
			UPDATE material_master
			SET material_number = @materialNumber,
			material_description = @materialDescription,
			ean_number = @eanNumber,
			updated_by = @updatedBy,
			updated_date = GETDATE()
			WHERE id = @id;
			SET @Status = 'T';
			SET @Message = 'Material updated successfully';
			SELECT @Status as 'Status' , @Message as 'Message';				 
		END
END



USE [matrix_cosmec]
GO
/****** Object:  StoredProcedure [dbo].[sp_material_master_get_all_details]    Script Date: 12/16/2025 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_material_master_get_all_details]
AS
BEGIN
	SELECT id,
	material_number AS materialNumber,
	material_description AS materialDescription,
	ean_number AS eanNumber,
	created_by AS createdBy,
	created_date AS createdDate,
	updated_by AS updatedBy,
	updated_date AS updatedDate
	FROM dbo.material_master
	ORDER BY created_date DESC
END
