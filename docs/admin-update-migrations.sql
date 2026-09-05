BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905105021_AddMissionReview'
)
BEGIN
    ALTER TABLE [Missions] ADD [ReviewStatus] nvarchar(20) NOT NULL DEFAULT N'Approved';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905105021_AddMissionReview'
)
BEGIN
    ALTER TABLE [Missions] ADD [ReviewedAt] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905105021_AddMissionReview'
)
BEGIN
    ALTER TABLE [Missions] ADD [ReviewedByAdminId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905105021_AddMissionReview'
)
BEGIN
    EXEC(N'UPDATE Missions SET ReviewStatus = CASE WHEN IsAiGenerated = 1 AND IsCompleted = 0 THEN ''Draft'' ELSE ''Approved'' END');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905105021_AddMissionReview'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260905105021_AddMissionReview', N'10.0.5');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905110158_AddSavingContributions'
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RewardDefinitions WHERE Code = 'first-entry') INSERT INTO RewardDefinitions (Code, Name, Description, CosmeticType, IsActive, CreatedAt) VALUES ('first-entry', 'First Entry', 'Recorded your first financial entry.', 'Badge', 1, SYSUTCDATETIME())
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905110158_AddSavingContributions'
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RewardDefinitions WHERE Code = 'first-mission') INSERT INTO RewardDefinitions (Code, Name, Description, CosmeticType, IsActive, CreatedAt) VALUES ('first-mission', 'Quest Starter', 'Completed your first mission.', 'Badge', 1, SYSUTCDATETIME())
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905110158_AddSavingContributions'
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RewardDefinitions WHERE Code = 'first-vault') INSERT INTO RewardDefinitions (Code, Name, Description, CosmeticType, IsActive, CreatedAt) VALUES ('first-vault', 'Vault Keeper', 'Completed a savings goal.', 'Badge', 1, SYSUTCDATETIME())
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905110158_AddSavingContributions'
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RewardDefinitions WHERE Code = 'level-five') INSERT INTO RewardDefinitions (Code, Name, Description, CosmeticType, IsActive, CreatedAt) VALUES ('level-five', 'Level Five', 'Reached finance level five.', 'Badge', 1, SYSUTCDATETIME())
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905110158_AddSavingContributions'
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RewardDefinitions WHERE Code = 'tower-explorer') INSERT INTO RewardDefinitions (Code, Name, Description, CosmeticType, IsActive, CreatedAt) VALUES ('tower-explorer', 'Tower Explorer', 'Submitted a valid built-in game result.', 'Badge', 1, SYSUTCDATETIME())
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905110158_AddSavingContributions'
)
BEGIN
    CREATE TABLE [SavingContributions] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [SavingGoalId] int NOT NULL,
        [Amount] float NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_SavingContributions] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905110158_AddSavingContributions'
)
BEGIN
    CREATE INDEX [IX_SavingContributions_UserId_CreatedAt] ON [SavingContributions] ([UserId], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905110158_AddSavingContributions'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260905110158_AddSavingContributions', N'10.0.5');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905171154_AddLevelHistory'
)
BEGIN
    CREATE TABLE [LevelHistory] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Level] int NOT NULL,
        [XP] float NOT NULL,
        [RecordedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_LevelHistory] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905171154_AddLevelHistory'
)
BEGIN
    CREATE INDEX [IX_LevelHistory_UserId_RecordedAt] ON [LevelHistory] ([UserId], [RecordedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260905171154_AddLevelHistory'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260905171154_AddLevelHistory', N'10.0.5');
END;

COMMIT;
GO

