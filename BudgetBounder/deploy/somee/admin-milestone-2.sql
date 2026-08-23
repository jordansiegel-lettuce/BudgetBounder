BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE TABLE [AiRecommendations] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Title] nvarchar(160) NOT NULL,
        [Content] nvarchar(2000) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ReviewedByAdminId] int NULL,
        [ReviewedAt] datetime2 NULL,
        CONSTRAINT [PK_AiRecommendations] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AiRecommendations_Users_ReviewedByAdminId] FOREIGN KEY ([ReviewedByAdminId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AiRecommendations_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE TABLE [GameSessions] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [ClientResultId] uniqueidentifier NOT NULL,
        [Score] int NOT NULL,
        [Coins] int NOT NULL,
        [SavingsStars] int NOT NULL,
        [DurationSeconds] int NOT NULL,
        [AwardedXp] int NOT NULL,
        [ValidationState] nvarchar(20) NOT NULL,
        [ValidationReason] nvarchar(500) NULL,
        [SubmittedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_GameSessions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_GameSessions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE TABLE [RewardDefinitions] (
        [Id] int NOT NULL IDENTITY,
        [Code] nvarchar(50) NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [CosmeticType] nvarchar(30) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_RewardDefinitions] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE TABLE [UserRewards] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [RewardDefinitionId] int NOT NULL,
        [UnlockedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_UserRewards] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserRewards_RewardDefinitions_RewardDefinitionId] FOREIGN KEY ([RewardDefinitionId]) REFERENCES [RewardDefinitions] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserRewards_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE INDEX [IX_AiRecommendations_ReviewedByAdminId] ON [AiRecommendations] ([ReviewedByAdminId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE INDEX [IX_AiRecommendations_Status_CreatedAt] ON [AiRecommendations] ([Status], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE INDEX [IX_AiRecommendations_UserId] ON [AiRecommendations] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE UNIQUE INDEX [IX_GameSessions_UserId_ClientResultId] ON [GameSessions] ([UserId], [ClientResultId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE INDEX [IX_GameSessions_UserId_SubmittedAt] ON [GameSessions] ([UserId], [SubmittedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RewardDefinitions_Code] ON [RewardDefinitions] ([Code]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE INDEX [IX_UserRewards_RewardDefinitionId] ON [UserRewards] ([RewardDefinitionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserRewards_UserId_RewardDefinitionId] ON [UserRewards] ([UserId], [RewardDefinitionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260823081601_AddAdminMilestoneTwo'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260823081601_AddAdminMilestoneTwo', N'10.0.5');
END;

COMMIT;
GO

