using Microsoft.Data.Sqlite;

namespace RaccoonGame.Services;

public sealed record ScoreSubmission(Guid RunId, string? Name, int Score);
public sealed record LeaderboardEntry(long Id, string Name, int Score, long Rank);
public sealed record ScoreReceipt(LeaderboardEntry Entry, IReadOnlyList<LeaderboardEntry> Leaders);

public sealed class LeaderboardService(IConfiguration configuration, IWebHostEnvironment environment)
{
    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly string databasePath = Path.GetFullPath(
        configuration["Leaderboard:DatabasePath"] ?? Path.Combine("App_Data", "leaderboard.db"),
        environment.ContentRootPath);

    private SqliteConnection Open()
    {
        Directory.CreateDirectory(Path.GetDirectoryName(databasePath)!);
        var connection = new SqliteConnection(new SqliteConnectionStringBuilder
        {
            DataSource = databasePath, DefaultTimeout = 5
        }.ToString());
        try
        {
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = """
                CREATE TABLE IF NOT EXISTS scores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id TEXT NOT NULL UNIQUE,
                    name TEXT NOT NULL,
                    score INTEGER NOT NULL CHECK(score >= 0),
                    created_utc TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS ix_scores_score ON scores(score DESC, id);
                """;
            command.ExecuteNonQuery();
            return connection;
        }
        catch { connection.Dispose(); throw; }
    }

    private static IReadOnlyList<LeaderboardEntry> ReadLeaders(SqliteConnection connection, SqliteTransaction transaction)
    {
        using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = """
            SELECT s.id, s.name, s.score, 1 + (SELECT COUNT(*) FROM scores b WHERE b.score > s.score)
            FROM scores s ORDER BY s.score DESC, s.id ASC LIMIT 10;
            """;
        using var reader = command.ExecuteReader();
        var entries = new List<LeaderboardEntry>();
        while (reader.Read())
            entries.Add(new(reader.GetInt64(0), reader.GetString(1), reader.GetInt32(2), reader.GetInt64(3)));
        return entries;
    }

    public async Task<IReadOnlyList<LeaderboardEntry>> GetLeaders(CancellationToken cancellationToken)
    {
        await gate.WaitAsync(cancellationToken);
        try
        {
            using var connection = Open();
            using var transaction = connection.BeginTransaction(deferred: true);
            var leaders = ReadLeaders(connection, transaction);
            transaction.Commit();
            return leaders;
        }
        finally { gate.Release(); }
    }

    public async Task<ScoreReceipt> Submit(ScoreSubmission submission, CancellationToken cancellationToken)
    {
        var name = submission.Name?.Trim();
        if (submission.RunId == Guid.Empty || string.IsNullOrEmpty(name) || name.Length > 12 ||
            name.Any(char.IsControl) || submission.Score < 0 || submission.Score > 1_000_000)
            throw new ArgumentException("이름은 1~12자로, 점수는 올바른 숫자로 입력해 주세요.");

        await gate.WaitAsync(cancellationToken);
        try
        {
            using var connection = Open();
            using var transaction = connection.BeginTransaction();
            using (var insert = connection.CreateCommand())
            {
                insert.Transaction = transaction;
                insert.CommandText = """
                    INSERT INTO scores(run_id, name, score, created_utc)
                    VALUES($run, $name, $score, $created) ON CONFLICT(run_id) DO NOTHING;
                    """;
                insert.Parameters.AddWithValue("$run", submission.RunId.ToString("D"));
                insert.Parameters.AddWithValue("$name", name);
                insert.Parameters.AddWithValue("$score", submission.Score);
                insert.Parameters.AddWithValue("$created", DateTimeOffset.UtcNow.ToString("O"));
                insert.ExecuteNonQuery();
            }
            LeaderboardEntry entry;
            using (var query = connection.CreateCommand())
            {
                query.Transaction = transaction;
                query.CommandText = """
                    SELECT s.id, s.name, s.score, 1 + (SELECT COUNT(*) FROM scores b WHERE b.score > s.score)
                    FROM scores s WHERE s.run_id = $run;
                    """;
                query.Parameters.AddWithValue("$run", submission.RunId.ToString("D"));
                using var reader = query.ExecuteReader();
                if (!reader.Read()) throw new InvalidOperationException("Saved score missing.");
                entry = new(reader.GetInt64(0), reader.GetString(1), reader.GetInt32(2), reader.GetInt64(3));
            }
            var receipt = new ScoreReceipt(entry, ReadLeaders(connection, transaction));
            transaction.Commit();
            return receipt;
        }
        finally { gate.Release(); }
    }
}
